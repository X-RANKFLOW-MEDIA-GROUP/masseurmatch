-- Harden signup triggers so Supabase auth user creation never fails because of profile/user mirror constraints.
-- Fixes: "Database error creating new user" and profiles_status_check failures.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Normalize legacy profile status values before rebuilding the constraint.
do $$
begin
  if to_regclass('public.profiles') is not null then
    update public.profiles
    set status = 'draft'
    where status is null
       or status not in ('draft', 'pending', 'approved', 'active', 'inactive', 'suspended', 'rejected');
  end if;
end;
$$;

alter table if exists public.profiles
  drop constraint if exists profiles_status_check;

alter table if exists public.profiles
  drop constraint if exists profiles_status_chec;

alter table if exists public.profiles
  add constraint profiles_status_check
  check (status in ('draft', 'pending', 'approved', 'active', 'inactive', 'suspended', 'rejected'));

alter table if exists public.profiles
  alter column status set default 'draft';

-- Normalize subscription tiers used across older and newer versions of the app.
do $$
begin
  if to_regclass('public.profiles') is not null and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'subscription_tier'
  ) then
    update public.profiles
    set subscription_tier = 'free'
    where subscription_tier is null
       or subscription_tier not in ('free', 'standard', 'pro', 'elite', 'featured');
  end if;
end;
$$;

alter table if exists public.profiles
  drop constraint if exists profiles_subscription_tier_check;

alter table if exists public.profiles
  add constraint profiles_subscription_tier_check
  check (subscription_tier in ('free', 'standard', 'pro', 'elite', 'featured'));

alter table if exists public.profiles
  alter column subscription_tier set default 'free';

-- Make auth user mirroring resilient to bad metadata and old role constraints.
create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_role text;
begin
  safe_role := case
    when lower(coalesce(new.raw_app_meta_data ->> 'role', new.raw_user_meta_data ->> 'role', 'therapist')) in ('admin', 'therapist')
      then lower(coalesce(new.raw_app_meta_data ->> 'role', new.raw_user_meta_data ->> 'role', 'therapist'))
    else 'therapist'
  end;

  begin
    insert into public.users (id, email, full_name, role)
    values (
      new.id,
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'New therapist'),
      safe_role
    )
    on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role;
  exception when others then
    raise warning 'handle_auth_user skipped for auth user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

-- Make profile creation resilient and compatible with current dashboard expectations.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_name text;
begin
  safe_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'New therapist'
  );

  begin
    insert into public.profiles (
      user_id,
      email,
      full_name,
      display_name,
      status,
      subscription_tier,
      subscription_status,
      is_verified_email,
      profile_completeness,
      created_at,
      updated_at
    )
    values (
      new.id,
      coalesce(new.email, ''),
      safe_name,
      safe_name,
      'draft',
      'free',
      'active',
      coalesce(new.email_confirmed_at is not null, false),
      0,
      timezone('utc', now()),
      timezone('utc', now())
    )
    on conflict (user_id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        display_name = coalesce(public.profiles.display_name, excluded.display_name),
        status = coalesce(public.profiles.status, 'draft'),
        subscription_tier = coalesce(public.profiles.subscription_tier, 'free'),
        subscription_status = coalesce(public.profiles.subscription_status, 'active'),
        updated_at = timezone('utc', now());
  exception when others then
    raise warning 'handle_new_user_profile skipped for auth user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

-- Recreate triggers cleanly. Either trigger may exist depending on migration history.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user();

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Keep updated_at trigger in place if profiles exists.
do $$
begin
  if to_regclass('public.profiles') is not null then
    drop trigger if exists trg_profiles_set_updated_at on public.profiles;
    create trigger trg_profiles_set_updated_at
      before update on public.profiles
      for each row execute function public.set_updated_at();
  end if;
end;
$$;
