-- Add conversation_id to simulations table to track ElevenLabs conversations
ALTER TABLE public.simulations ADD COLUMN conversation_id text;

-- Add index for faster lookups
CREATE INDEX idx_simulations_conversation_id ON public.simulations(conversation_id);