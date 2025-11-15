-- Allow users to view profiles of users who have consented AI personas
CREATE POLICY "Users can view profiles with consented personas"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ai_personas
    WHERE ai_personas.user_id = profiles.id
    AND ai_personas.consent_given = true
  )
);