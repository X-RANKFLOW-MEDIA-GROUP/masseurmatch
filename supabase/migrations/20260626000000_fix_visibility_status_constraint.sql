-- Fix trigger functions that set invalid visibility_status values.
-- The profiles_visibility_status_check constraint only allows:
-- 'hidden', 'public', 'paused', 'suspended'

-- Fix any existing rows with invalid values
update public.profiles
set visibility_status = 'hidden'
where visibility_status not in ('hidden', 'public', 'paused', 'suspended');

-- Recreate sync_profiles_runtime_columns with 'hidden' instead of 'private'
create or replace function public.sync_profiles_runtime_columns()
returns trigger
language plpgsql
as $$
begin
  new.user_id := coalesce(new.user_id, new.id);
  new.email_address := coalesce(new.email_address, new.email);
  new.subscription_tier := coalesce(new.subscription_tier, new._tier, new.tier, 'free');
  new._tier := coalesce(new._tier, new.subscription_tier, new.tier, 'free');
  new.tier := coalesce(new.tier, new.subscription_tier, new._tier, 'free');
  new.status := coalesce(new.status, new.profile_status, 'pending');
  new.profile_status := coalesce(new.profile_status, 'draft');
  new.visibility_status := coalesce(new.visibility_status, 'hidden');
  new.is_active := coalesce(new.is_active, true);
  new.starting_price := coalesce(new.starting_price, new.incall_price, new.outcall_price);
  return new;
end;
$$;

-- Recreate handle_new_user with 'hidden' instead of 'private'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'therapist')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
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
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    'therapist',
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
    updated_at = timezone('utc', now());

  insert into public.user_roles (user_id, role)
  values (new.id, 'provider')
  on conflict do nothing;

  return new;
end;
$$;
