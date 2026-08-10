-- Repair migration history table
-- Adds status column to track migration state (applied/reverted)
-- Marks problematic AI Profile Coach migrations as reverted

ALTER TABLE supabase_migrations.schema_migrations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'applied';

-- These migrations had inconsistencies and are marked as reverted
UPDATE supabase_migrations.schema_migrations 
SET status = 'reverted'
WHERE version IN (
  '20260810182139',  -- profile_coach_premium_email_and_9am_sender
  '20260810190905',  -- fix_profile_coach_queue_status
  '20260810192151',  -- fix_profile_coach_queue_status
  '20260810192358',  -- fix_profile_coach_queue_status
  '20260810192850',  -- fix_profile_coach_link
  '20260810193240'   -- fix_profile_coach_queue_status
);
