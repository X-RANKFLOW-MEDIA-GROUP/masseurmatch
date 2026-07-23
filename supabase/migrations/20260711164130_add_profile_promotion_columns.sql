-- Ensure the legacy therapist-to-profile promotion migration can run on a
-- clean Supabase preview branch. Production already has these additive fields;
-- IF NOT EXISTS keeps this safe and idempotent.

alter table public.profiles
  add column if not exists keyword_slugs text[] not null default '{}'::text[],
  add column if not exists segments text[] not null default '{}'::text[];

create index if not exists idx_profiles_keyword_slugs
  on public.profiles using gin (keyword_slugs);

create index if not exists idx_profiles_segments
  on public.profiles using gin (segments);
