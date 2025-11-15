-- Add agent_id column to ai_personas table for ElevenLabs Conversational AI agents
ALTER TABLE public.ai_personas
ADD COLUMN agent_id TEXT;

COMMENT ON COLUMN public.ai_personas.agent_id IS 'ElevenLabs Conversational AI agent ID (different from voice_profile_id which is for TTS)';