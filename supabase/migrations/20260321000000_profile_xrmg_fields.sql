-- XRMG Therapist Profile: add new JSONB/text columns for add-ons, promotions,
-- travel schedule, areas served, training/credentials, and outcall radius.

alter table public.profiles
  add column if not exists add_ons          jsonb default '[]'::jsonb,
  add column if not exists promotions       jsonb default '[]'::jsonb,
  add column if not exists travel_schedule  jsonb default '[]'::jsonb,
  add column if not exists areas_served     text[] default '{}'::text[],
  add column if not exists training         jsonb default '[]'::jsonb,
  add column if not exists outcall_radius_miles integer,
  add column if not exists contact_clicks   integer not null default 0,
  add column if not exists education        text;
