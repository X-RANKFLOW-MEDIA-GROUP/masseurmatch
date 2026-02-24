
-- Phone verification OTP table
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phone verifications"
  ON public.phone_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phone verifications"
  ON public.phone_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for quick lookup
CREATE INDEX idx_phone_verifications_user_phone ON public.phone_verifications (user_id, phone, expires_at);

-- Rate limit: max 5 OTP requests per phone per hour (enforced via trigger)
CREATE OR REPLACE FUNCTION public.check_phone_otp_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.phone_verifications
    WHERE phone = NEW.phone AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many verification attempts. Try again later.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_phone_rate_limit
  BEFORE INSERT ON public.phone_verifications
  FOR EACH ROW EXECUTE FUNCTION public.check_phone_otp_rate_limit();
