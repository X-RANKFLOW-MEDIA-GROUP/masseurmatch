-- Baseline schema: creates the core tables that later migrations depend on.
-- The production profiles table was created manually before the migration
-- history began. This file ensures fresh Supabase Preview databases have
-- those tables before any ALTER/INDEX migration runs.

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text default 'provider',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, role)
);

create table if not exists public.profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique references auth.users(id) on delete cascade,
  role                  text,
  email                 text,
  full_name             text,
  display_name          text,
  phone                 text,
  bio                   text,
  photo_url             text,
  city                  text,
  state                 text,
  country               text default 'US',
  specialties           text[] default '{}',
  modalities            text[] default '{}',
  languages             text[] default '{English}',
  incall                boolean default true,
  outcall               boolean default false,
  traveling             boolean default false,
  visiting              boolean default false,
  price_min             integer,
  price_max             integer,
  session_duration      integer default 60,
  available_now         boolean default false,
  is_verified_identity  boolean default false,
  is_verified_email     boolean default false,
  is_verified_phone     boolean default false,
  subscription_tier     text default 'free',
  subscription_status   text default 'active',
  stripe_customer_id    text,
  status                text default 'draft',
  profile_status        text default 'draft',
  visibility_status     text default 'hidden',
  is_active             boolean default false,
  is_featured           boolean default false,
  is_suspended          boolean default false,
  is_banned             boolean default false,
  profile_completeness  integer default 0,
  view_count            integer default 0,
  inquiry_count         integer default 0,
  review_count          integer default 0,
  average_rating        numeric(3,2),
  latitude              double precision,
  longitude             double precision,
  boost_score           integer not null default 0,
  featured_until        timestamptz,
  approved_at           timestamptz,
  last_active_at        timestamptz,
  created_at            timestamptz not null default timezone('utc', now()),
  updated_at            timestamptz not null default timezone('utc', now())
);

-- is_admin() is used throughout RLS policies as an admin-check helper
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
$$;
