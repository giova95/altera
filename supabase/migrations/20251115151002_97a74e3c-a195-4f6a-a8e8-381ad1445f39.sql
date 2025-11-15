-- Add RLS policy to allow users to view other users' consented personas
CREATE POLICY "Users can view other consented personas"
ON public.ai_personas
FOR SELECT
TO authenticated
USING (consent_given = true AND user_id != auth.uid());