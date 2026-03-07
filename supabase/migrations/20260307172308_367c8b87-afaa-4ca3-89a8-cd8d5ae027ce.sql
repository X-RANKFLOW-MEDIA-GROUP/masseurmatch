
-- Weekly specials table
CREATE TABLE public.weekly_specials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (date_trunc('week', now() + interval '1 week') + interval '6 days 23 hours 59 minutes 59 seconds'),
  is_active boolean NOT NULL DEFAULT true
);

-- RLS
ALTER TABLE public.weekly_specials ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own specials
CREATE POLICY "Owners can manage own specials"
  ON public.weekly_specials FOR ALL
  TO authenticated
  USING (is_profile_owner(profile_id))
  WITH CHECK (is_profile_owner(profile_id));

-- Anyone can view active non-expired specials
CREATE POLICY "Anyone can view active specials"
  ON public.weekly_specials FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND expires_at > now());

-- Admins can manage all specials
CREATE POLICY "Admins can manage all specials"
  ON public.weekly_specials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookup
CREATE INDEX idx_weekly_specials_profile_active ON public.weekly_specials(profile_id, is_active) WHERE is_active = true;
CREATE INDEX idx_weekly_specials_expires ON public.weekly_specials(expires_at) WHERE is_active = true;
