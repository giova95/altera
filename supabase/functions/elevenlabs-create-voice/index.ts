import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    return new Response(
      JSON.stringify({ voiceId: result.voice_id }),
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
