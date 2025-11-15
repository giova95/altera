import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      console.error("Auth error:", userError);
      throw new Error("Unauthorized: " + userError.message);
    }
    if (!user) {
      throw new Error("Unauthorized: No user found");
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const displayName = formData.get("displayName") as string || "Demo Persona";
    const description = formData.get("description") as string || "Demo voice for Altera communication coach.";

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "Audio file is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare form data for ElevenLabs
    const elevenlabsFormData = new FormData();
    elevenlabsFormData.append("name", displayName);
    elevenlabsFormData.append("description", description);
    elevenlabsFormData.append("files", audioFile);

    // Call ElevenLabs Add Voice API
    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: elevenlabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create voice with ElevenLabs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const voiceId = result.voice_id;

    // Save persona to database
    const { error: personaError } = await supabaseClient
      .from("ai_personas")
      .upsert({
        user_id: user.id,
        voice_profile_id: voiceId,
        status: "active",
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (personaError) {
      console.error("Error saving persona:", personaError);
      throw personaError;
    }
    
    return new Response(
      JSON.stringify({ voiceId, personaCreated: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in elevenlabs-create-voice:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
