-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view other consented personas" ON public.ai_personas;
DROP POLICY IF EXISTS "Users can view profiles with consented personas" ON public.profiles;

-- Create a security definer function to safely check if a user has a consented persona
CREATE OR REPLACE FUNCTION public.user_has_consented_persona(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ai_personas
    WHERE user_id = _user_id
    AND consent_given = true
  )
$$;

-- Re-create the policies using the security definer function
CREATE POLICY "Users can view other consented personas"
ON public.ai_personas
FOR SELECT
TO authenticated
USING (consent_given = true AND user_id != auth.uid());

CREATE POLICY "Users can view profiles with consented personas"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.user_has_consented_persona(profiles.id));