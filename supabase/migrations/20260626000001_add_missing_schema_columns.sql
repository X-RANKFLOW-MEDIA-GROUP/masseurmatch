-- Add missing columns to moderation_queue
ALTER TABLE public.moderation_queue ADD COLUMN IF NOT EXISTS content_type text;

-- Add missing columns to payment_transactions
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS provider_transaction_id text;
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS provider text;

-- Add missing columns to appointments (or create aliases if using different names)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade;

-- Rename/add starts_at and ends_at if not already present
DO $$
BEGIN
  -- Check if starts_at column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'starts_at'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN starts_at timestamptz;
    -- Copy data from start_time if it exists
    UPDATE public.appointments SET starts_at = start_time WHERE starts_at IS NULL AND start_time IS NOT NULL;
  END IF;

  -- Check if ends_at column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'ends_at'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN ends_at timestamptz;
    -- Copy data from end_time if it exists
    UPDATE public.appointments SET ends_at = end_time WHERE ends_at IS NULL AND end_time IS NOT NULL;
  END IF;
END $$;

-- Add missing columns to text_verifications
ALTER TABLE public.text_verifications ADD COLUMN IF NOT EXISTS submitted_text text;
ALTER TABLE public.text_verifications ADD COLUMN IF NOT EXISTS code text;

-- Add missing columns to profile_reviews
ALTER TABLE public.profile_reviews ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add missing columns to therapist_photos
ALTER TABLE public.therapist_photos ADD COLUMN IF NOT EXISTS therapist_profile_id uuid;
ALTER TABLE public.therapist_photos ADD COLUMN IF NOT EXISTS approval_status text;

-- Add missing columns to admin_actions
ALTER TABLE public.admin_actions ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE public.admin_actions ADD COLUMN IF NOT EXISTS target_table text;

-- Add missing columns to demand_scores (table already created in 20260611200001)
ALTER TABLE public.demand_scores ADD COLUMN IF NOT EXISTS therapy_type text;
ALTER TABLE public.demand_scores ADD COLUMN IF NOT EXISTS demand_level integer;
ALTER TABLE public.demand_scores ADD COLUMN IF NOT EXISTS demand_score decimal(5, 2);
ALTER TABLE public.demand_scores ADD COLUMN IF NOT EXISTS last_updated timestamptz default timezone('utc', now());
ALTER TABLE public.demand_scores ADD COLUMN IF NOT EXISTS updated_at timestamptz default timezone('utc', now());

-- Create indexes for new tables/columns
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
