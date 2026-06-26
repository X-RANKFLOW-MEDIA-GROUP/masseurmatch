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
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references auth.users(id) on delete cascade,
  role       text,
  email      text,
  full_name  text,
  status     text default 'draft',
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
