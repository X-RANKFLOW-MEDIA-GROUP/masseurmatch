-- ============================================================================
-- Explicit Client Preferences on Profiles
-- Allows therapists to declare inclusivity signals and client preferences
-- and clients to filter by these criteria.
-- ============================================================================

-- 1) Add preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lgbtq_affirming       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepts_all_genders   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS languages_spoken       text[] DEFAULT '{English}'::text[],
  ADD COLUMN IF NOT EXISTS accessibility_features text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS clientele_preferences  jsonb DEFAULT '{}'::jsonb;

-- 2) Index for fast filter queries
CREATE INDEX IF NOT EXISTS idx_profiles_lgbtq_affirming
  ON public.profiles (lgbtq_affirming)
  WHERE lgbtq_affirming = true;

CREATE INDEX IF NOT EXISTS idx_profiles_languages_spoken
  ON public.profiles USING gin (languages_spoken);

-- 3) Comment on columns for documentation
COMMENT ON COLUMN public.profiles.lgbtq_affirming IS
  'Therapist explicitly declares LGBTQ+-affirming practice';

COMMENT ON COLUMN public.profiles.accepts_all_genders IS
  'Therapist accepts clients of all genders';

COMMENT ON COLUMN public.profiles.languages_spoken IS
  'Languages the therapist can conduct sessions in';

COMMENT ON COLUMN public.profiles.accessibility_features IS
  'Accessibility features: wheelchair-accessible, adjustable-table, etc.';

COMMENT ON COLUMN public.profiles.clientele_preferences IS
  'Free-form JSONB for additional preference signals: {"couples":true,"seniors":true}';
