-- 20260314000000_directory_schema creates therapists(city_id uuid FK) without
-- a plain city text column. 20260508133000_runtime_contract_alignment skips
-- CREATE TABLE IF NOT EXISTS but then INSERTs with city which doesn't exist.
-- The ALTER TABLE in that migration omits city, so add it here.

DO $$
BEGIN
  IF to_regclass('public.therapists') IS NOT NULL THEN
    ALTER TABLE public.therapists
      ADD COLUMN IF NOT EXISTS city text;
  END IF;
END $$;
