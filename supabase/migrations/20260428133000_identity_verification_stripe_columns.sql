-- Ensure Stripe Identity fields exist for API routes
ALTER TABLE public.identity_verifications
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_verification_report_id text;

-- Avoid duplicate Stripe sessions per verification row when present
CREATE UNIQUE INDEX IF NOT EXISTS idx_identity_verifications_stripe_session_id
  ON public.identity_verifications (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
