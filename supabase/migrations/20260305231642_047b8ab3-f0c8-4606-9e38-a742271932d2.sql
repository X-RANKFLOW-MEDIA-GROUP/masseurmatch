
-- Update the profile visibility policy to also show seed profiles publicly
DROP POLICY IF EXISTS "Anyone can view active verified profiles" ON public.profiles;

CREATE POLICY "Anyone can view active verified profiles"
ON public.profiles
FOR SELECT
USING (
  (
    (is_active = true AND is_verified_identity = true AND is_verified_photos = true)
    OR (is_active = true AND is_seed_profile = true)
    OR (auth.uid() = user_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);
