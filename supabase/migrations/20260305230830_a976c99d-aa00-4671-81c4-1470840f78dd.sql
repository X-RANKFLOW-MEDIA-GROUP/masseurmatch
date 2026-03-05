
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS available_now boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_now_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS available_now_expires timestamptz,
  ADD COLUMN IF NOT EXISTS available_now_last_used timestamptz,
  ADD COLUMN IF NOT EXISTS available_now_credits integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_available_now ON public.profiles (available_now, available_now_expires)
  WHERE available_now = true;
