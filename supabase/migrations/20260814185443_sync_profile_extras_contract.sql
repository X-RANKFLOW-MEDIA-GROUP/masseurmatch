-- Synchronize the additive schema contract with intended provider profile
-- fields. ADD COLUMN IF NOT EXISTS preserves every existing row and makes the
-- migration safe for both production and fresh preview databases.

alter table public.profiles
  add column if not exists map_enabled boolean default false,
  add column if not exists massage_setup text[],
  add column if not exists mobile_extras text[],
  add column if not exists products_used text[],
  add column if not exists products_sold text[],
  add column if not exists payment_methods text[],
  add column if not exists day_of_week_discount jsonb default '[]'::jsonb,
  add column if not exists education_entries jsonb default '[]'::jsonb,
  add column if not exists additional_services text[],
  add column if not exists studio_amenities text[],
  add column if not exists rate_disclaimers text[],
  add column if not exists affiliations text[],
  add column if not exists start_date timestamptz;
