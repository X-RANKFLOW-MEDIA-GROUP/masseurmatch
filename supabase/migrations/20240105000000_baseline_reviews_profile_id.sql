-- 20260314000000_directory_schema creates reviews(therapist_id, ...) without profile_id.
-- 20260508133000_runtime_contract_alignment skips CREATE TABLE IF NOT EXISTS but then
-- indexes reviews(profile_id, is_public, created_at desc) which fails.
-- Add profile_id here so that index succeeds.

alter table public.reviews
  add column if not exists profile_id  uuid references public.profiles(id) on delete cascade,
  add column if not exists updated_at  timestamptz not null default timezone('utc', now());
