-- Create enum types
CREATE TYPE public.user_role AS ENUM ('standard', 'hr', 'admin');
CREATE TYPE public.work_role AS ENUM ('individual_contributor', 'manager', 'hr', 'leadership', 'other');
CREATE TYPE public.conversation_theme AS ENUM ('feedback', 'performance', 'conflict', 'workload', 'change_decision', 'other');
CREATE TYPE public.emotion AS ENUM ('anxious', 'guilty', 'frustrated', 'calm_unsure', 'confident', 'other');
CREATE TYPE public.persona_status AS ENUM ('not_created', 'in_progress', 'processing', 'active', 'failed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  work_role work_role,
  user_role user_role NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create AI personas table
CREATE TABLE public.ai_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ,
  status persona_status NOT NULL DEFAULT 'not_created',
  voice_profile_id TEXT,
  transcription TEXT,
  interview_questions JSONB,
  interview_answers JSONB,
  traits JSONB DEFAULT '[]'::jsonb,
  context_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own persona"
  ON public.ai_personas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own persona"
  ON public.ai_personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own persona"
  ON public.ai_personas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "HR can view all personas with consent"
  ON public.ai_personas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND user_role IN ('hr', 'admin')
    ) AND consent_given = TRUE
  );

CREATE POLICY "HR can update personas with consent"
  ON public.ai_personas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND user_role IN ('hr', 'admin')
    ) AND consent_given = TRUE
  );

-- Create simulations table
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_role work_role NOT NULL,
  other_role work_role NOT NULL,
  theme conversation_theme NOT NULL,
  emotion emotion,
  context TEXT,
  is_using_persona BOOLEAN DEFAULT FALSE,
  persona_id UUID REFERENCES public.ai_personas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON public.simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON public.simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON public.simulations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create simulation messages table
CREATE TABLE public.simulation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.simulation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own simulations"
  ON public.simulation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.simulations
      WHERE id = simulation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own simulations"
  ON public.simulation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.simulations
      WHERE id = simulation_id AND user_id = auth.uid()
    )
  );

-- Create saved phrases (playbook) table
CREATE TABLE public.saved_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.saved_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phrases"
  ON public.saved_phrases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phrases"
  ON public.saved_phrases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own phrases"
  ON public.saved_phrases FOR DELETE
  USING (auth.uid() = user_id);

-- Create voice recording sessions table
CREATE TABLE public.voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES public.ai_personas(id) ON DELETE CASCADE,
  recording_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recordings"
  ON public.voice_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_personas
      WHERE id = persona_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recordings"
  ON public.voice_recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_personas
      WHERE id = persona_id AND user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON public.ai_personas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();