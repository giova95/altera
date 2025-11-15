-- Create enum for user roles  
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'standard');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrate existing user_role data from profiles to user_roles table
-- Map user_role enum values to app_role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id, 
  CASE 
    WHEN user_role = 'admin' THEN 'admin'::app_role
    WHEN user_role = 'hr' THEN 'hr'::app_role
    ELSE 'standard'::app_role
  END as role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Add RLS policy to ai_personas for HR/admin access
CREATE POLICY "HR and admins can view all consented personas"
ON public.ai_personas
FOR SELECT
USING (
  consent_given = true AND (
    public.has_role(auth.uid(), 'hr') OR 
    public.has_role(auth.uid(), 'admin')
  )
);

-- Add DELETE policy for users to delete their own personas
CREATE POLICY "Users can delete their own personas"
ON public.ai_personas
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for simulation_messages
CREATE POLICY "Users can delete their own simulation messages"
ON public.simulation_messages
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.simulations WHERE id = simulation_id
  )
);

-- Add UPDATE and DELETE policies for voice_recordings
CREATE POLICY "Users can update their own voice recordings"
ON public.voice_recordings
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.ai_personas WHERE id = persona_id
  )
);

CREATE POLICY "Users can delete their own voice recordings"
ON public.voice_recordings
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.ai_personas WHERE id = persona_id
  )
);