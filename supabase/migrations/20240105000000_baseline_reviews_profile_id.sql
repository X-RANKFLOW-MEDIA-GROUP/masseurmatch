-- 20260314000000_directory_schema creates reviews(therapist_id, ...) without profile_id.
-- 20260508133000_runtime_contract_alignment skips CREATE TABLE IF NOT EXISTS but then
-- indexes reviews(profile_id, is_public, created_at desc) which fails.
-- Add profile_id here so that index succeeds.

DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL THEN
    ALTER TABLE public.reviews
      ADD COLUMN IF NOT EXISTS profile_id  uuid references public.profiles(id) on delete cascade,
      ADD COLUMN IF NOT EXISTS updated_at  timestamptz not null default timezone('utc', now());
  END IF;
END $$;
