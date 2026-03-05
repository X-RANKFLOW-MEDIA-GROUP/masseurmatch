
-- Add seed profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_seed_profile boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seed_claimed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS seed_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS seed_slug text;

-- Index for quick seed lookups
CREATE INDEX IF NOT EXISTS idx_profiles_seed ON public.profiles (is_seed_profile) WHERE is_seed_profile = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_seed_slug ON public.profiles (seed_slug) WHERE seed_slug IS NOT NULL;
