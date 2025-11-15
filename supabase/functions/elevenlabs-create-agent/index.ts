import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { voiceId, personaId } = await req.json();

    if (!voiceId) {
      return new Response(
        JSON.stringify({ error: "Voice ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating ElevenLabs agent with voice ID:", voiceId);

    // Get user profile for agent configuration
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || "User";

    // Create conversational AI agent
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: {
                prompt: `You are an AI persona representing ${userName}. You are participating in a workplace communication simulation. Respond naturally and authentically based on the conversation context. Be helpful, professional, and maintain the personality traits associated with this persona.`,
              },
              first_message: "Hello! I'm ready to have a conversation with you.",
              language: "en",
            },
            tts: {
              voice_id: voiceId,
            },
          },
          platform_settings: {
            widget: {
              variant: "full-screen",
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create agent", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const agentId = data.agent_id;

    console.log("Agent created successfully:", agentId);

    // Update persona with agent ID if personaId is provided
    if (personaId) {
      const { error: updateError } = await supabase
        .from("ai_personas")
        .update({ agent_id: agentId })
        .eq("id", personaId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating persona with agent ID:", updateError);
        // Don't fail the request, agent was created successfully
      }
    }

    return new Response(
      JSON.stringify({ agent_id: agentId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in elevenlabs-create-agent:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
