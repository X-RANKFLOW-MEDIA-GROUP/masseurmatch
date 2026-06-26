-- Add reviewed_at column to text_verifications table
ALTER TABLE public.text_verifications
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Add index for reviewed_at for better query performance
CREATE INDEX IF NOT EXISTS idx_text_verifications_reviewed_at
  ON public.text_verifications(reviewed_at DESC)
  WHERE status = 'verified';

COMMENT ON COLUMN public.text_verifications.reviewed_at IS 'Timestamp when the SMS/text verification was reviewed by admin or system';
