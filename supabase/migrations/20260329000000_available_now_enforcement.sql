ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS available_now boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_now_expires timestamptz,
  ADD COLUMN IF NOT EXISTS available_now_activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS available_now_activations_today integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_now_last_reset_date date;

CREATE INDEX IF NOT EXISTS idx_profiles_available_now
  ON public.profiles (available_now)
  WHERE available_now = true;

CREATE OR REPLACE FUNCTION public.expire_available_now()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET available_now = false
  WHERE available_now = true
    AND available_now_expires IS NOT NULL
    AND available_now_expires <= now();
END;
$$;
