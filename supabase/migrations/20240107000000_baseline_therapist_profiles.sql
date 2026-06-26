-- therapist_profiles was created manually in production; no migration ever creates it.
-- 20260508133000_runtime_contract_alignment ALTERs it and runs UPDATE/INSERT against it.
-- Create it here with the full column set needed by all subsequent migrations/views.
--
-- Also backfill therapist_photos with therapist_profile_id, is_primary, approval_status
-- which are referenced in the UPDATE that runtime_contract_alignment runs after this.

create table if not exists public.therapist_profiles (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users(id) on delete cascade,
  profile_id               uuid references public.profiles(id) on delete cascade,
  slug                     text unique,
  display_name             text,
  headline                 text,
  bio                      text,
  phone                    text,
  contact_email            text,
  city                     text,
  state                    text,
  country                  text default 'US',
  neighborhood             text,
  latitude                 double precision,
  longitude                double precision,
  service_radius_miles     integer,
  offers_incall            boolean default false,
  offers_outcall           boolean default false,
  availability_note        text,
  seo_title                text,
  seo_description          text,
  canonical_city_slug      text,
  profile_completion_score integer default 0,
  is_published             boolean default false,
  verification_status      text default 'unverified',
  moderation_status        text default 'draft',
  average_rating           numeric(3,2) default 0,
  total_reviews            integer default 0,
  created_at               timestamptz not null default timezone('utc', now()),
  updated_at               timestamptz not null default timezone('utc', now())
);

-- therapist_photos UPDATE in runtime_contract_alignment references these columns
-- which are absent from the 20260427200000 CREATE TABLE definition.
alter table public.therapist_photos
  add column if not exists therapist_profile_id uuid references public.therapist_profiles(id) on delete cascade,
  add column if not exists is_primary            boolean default false,
  add column if not exists approval_status       text default 'pending';
