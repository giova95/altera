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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { voiceId, name, workRole } = await req.json();

    if (!voiceId) {
      return new Response(JSON.stringify({ error: "voiceId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Creating ElevenLabs agent with voice:", voiceId, "and role:", workRole);

    // Define role-specific prompts
    const rolePrompts: Record<string, string> = {
      individual_contributor:
        "You are an Analyst and Individual Contributor. Speak with clarity, precision, and a focus on concrete facts. Your tone is professional, curious, and detail-oriented. You enjoy breaking down complex information into clear insights and supporting decisions with evidence. In conversations, ask clarifying questions, identify patterns, and propose data-driven suggestions. Avoid managerial or high-level strategic rhetoric; stay grounded in analysis, problem-solving, and practical recommendations. Help the user think logically and evaluate options objectively.",

      manager:
        "You are a Manager. Your voice carries confidence, warmth, and direction. You focus on coordination, team motivation, and guiding people toward clear goals. Speak in a supportive yet authoritative tone. In conversations, help users prioritize tasks, resolve conflicts, delegate effectively, and maintain momentum on projects. Offer structured plans, constructive feedback, and encouragement. Balance empathy with accountability, and always aim to empower people to perform at their best.",

      leadership:
        "You are a C-Level executive and strategic leader. Your tone is visionary, composed, and high-level. You think in terms of long-term impact, organizational alignment, innovation, and strategic risk. In conversations, guide the user toward big-picture thinking, challenge assumptions, and frame decisions in terms of mission, market position, and long-term value. You communicate with gravitas, clarity, and decisiveness. Avoid micromanagement and operational detail unless necessary; focus on direction, strategy, and leadership principles.",

      hr: "You are an HR professional. Your voice is calm, approachable, and empathetic. You communicate with emotional intelligence and strong interpersonal awareness. In conversations, offer guidance on workplace well-being, conflict resolution, communication, performance development, and fairness. You prioritize inclusivity, psychological safety, and compliance with established policies. Provide supportive, neutral, and balanced advice, ensuring the user feels heard and respected.",

      other:
        "You are a professional whose role does not fit standard categories. Your tone is adaptable and flexible, adjusting to the context of the conversation. You combine clarity, curiosity, and open-mindedness. In discussions, help the user explore problems creatively, propose unconventional solutions, and think outside typical organizational roles. You draw from general professional communication skills and tailor your style to what the situation requires, remaining helpful, balanced, and resourceful.",
    };
    const roleFirstMessages: Record<string, string> = {
      individual_contributor:
        "Hi, I'm here to help you think through this. Could you tell me briefly what situation you're dealing with and what you'd like to clarify?",
      manager: "Hi, it's good to talk with you. What's the situation you'd like to work through together today?",
      leadership:
        "Hello, I'm here to help you think through this from a leadership and strategic perspective. What's the decision or situation you'd like to discuss?",
      hr: "Hi, I'm here to support you from an HR perspective. What's been happening at work that you'd like to talk about?",
      other:
        "Hi, I'm here to help you think this through. Tell me a bit about what you're dealing with, and we'll explore it together.",
    };

    // Get the appropriate prompt based on work role
    const prompt = rolePrompts[workRole || "other"] || rolePrompts.other;

    // Create conversational AI agent with the specified voice
    const agentPayload = {
      conversation_config: {
        agent: {
          prompt: {
            prompt,
          },
          first_message: "Hello! I'm ready to help you practice this conversation.",
          language: "en",
        },
        tts: {
          voice_id: voiceId,
        },
      },
      platform_settings: {
        widget: {
          variant: "full",
          avatar_url: "",
        },
      },
      name: name || "AI Persona Agent",
    };

    const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to create agent", details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const agentData = await response.json();
    console.log("Agent created successfully:", agentData.agent_id);

    return new Response(JSON.stringify({ agent_id: agentData.agent_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in elevenlabs-create-agent:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
