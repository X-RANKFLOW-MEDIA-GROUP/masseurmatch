-- Restore the corrected auth signup trigger.
--
-- Migration 20260514121000 fixed handle_new_user to (a) insert profiles.id
-- explicitly (profiles.id is NOT NULL with no default) and (b) map the role
-- to 'provider' ('therapist' violates users_role_check / profiles_role_check).
-- The later migrations 20260626000000 / 20260626050000 recreated the function
-- from an older template that defaults the role to 'therapist' again, so any
-- database provisioned after them rejects every signup with
-- "Database error creating new user". This migration reinstalls the correct
-- version and must stay the last word on handle_new_user.

alter table public.profiles add column if not exists tier text default 'free';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  app_role text;
  display_name text;
begin
  app_role := coalesce(new.raw_user_meta_data ->> 'role', 'provider');

  if app_role = 'therapist' then
    app_role := 'provider';
  end if;

  if app_role not in ('admin', 'provider', 'client') then
    app_role := 'provider';
  end if;

  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'User'
  );

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, display_name, app_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = timezone('utc', now());

  insert into public.profiles (
    id,
    user_id,
    email,
    email_address,
    full_name,
    display_name,
    role,
    status,
    profile_status,
    visibility_status,
    subscription_tier,
    _tier,
    tier
  )
  values (
    new.id,
    new.id,
    new.email,
    new.email,
    display_name,
    display_name,
    app_role,
    'pending',
    'draft',
    'hidden',
    'free',
    'free',
    'free'
  )
  on conflict (id) do update set
    user_id = excluded.user_id,
    email = coalesce(public.profiles.email, excluded.email),
    email_address = coalesce(public.profiles.email_address, excluded.email_address),
    role = excluded.role,
    updated_at = timezone('utc', now());

  insert into public.user_roles (user_id, role)
  values (new.id, app_role)
  on conflict do nothing;

  return new;
end;
$function$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
