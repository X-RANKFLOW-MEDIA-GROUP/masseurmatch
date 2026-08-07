-- Identity verification is a trust and safety signal. The latest Stripe
-- Identity session is authoritative; profile flags are only denormalized cache.

create or replace function public.sync_profile_identity_verification(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session_status text := 'not_started';
  v_profile_status text := 'unverified';
  v_status_at timestamptz := null;
  v_verified_at timestamptz := null;
  v_verified boolean := false;
begin
  if p_user_id is null then
    return;
  end if;

  select
    case
      when lower(coalesce(iv.status, '')) = 'verified' then 'verified'
      when lower(coalesce(iv.status, '')) = 'pending' then 'pending'
      when lower(coalesce(iv.status, '')) = 'processing' then 'processing'
      when lower(coalesce(iv.status, '')) = 'requires_input' then 'requires_input'
      when lower(coalesce(iv.status, '')) = 'failed' then 'failed'
      when lower(coalesce(iv.status, '')) in ('canceled', 'cancelled') then 'canceled'
      else 'not_started'
    end,
    coalesce(iv.updated_at, iv.created_at)
  into v_session_status, v_status_at
  from public.identity_verifications iv
  where iv.user_id = p_user_id
  order by iv.created_at desc nulls last, iv.updated_at desc nulls last, iv.id desc
  limit 1;

  if not found then
    v_session_status := 'not_started';
    v_status_at := null;
  end if;

  v_verified := v_session_status = 'verified';
  v_verified_at := case
    when v_verified then coalesce(v_status_at, timezone('utc', now()))
    else null
  end;

  -- profiles.verification_status has a narrower legacy constraint. Richer
  -- session states remain in identity_verifications and provider APIs.
  v_profile_status := case
    when v_session_status = 'verified' then 'verified'
    when v_session_status = 'pending' then 'pending'
    when v_session_status = 'processing' then 'processing'
    when v_session_status = 'failed' then 'rejected'
    else 'unverified'
  end;

  update public.profiles
  set
    is_verified_identity = v_verified,
    verification_status = v_profile_status,
    identity_verified_at = v_verified_at,
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and (
      is_verified_identity is distinct from v_verified
      or verification_status is distinct from v_profile_status
      or identity_verified_at is distinct from v_verified_at
    );
end;
$$;

revoke all on function public.sync_profile_identity_verification(uuid) from public;
revoke all on function public.sync_profile_identity_verification(uuid) from anon;
revoke all on function public.sync_profile_identity_verification(uuid) from authenticated;
grant execute on function public.sync_profile_identity_verification(uuid) to service_role;

create or replace function public.identity_verification_sync_profile_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_profile_identity_verification(old.user_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.sync_profile_identity_verification(old.user_id);
  end if;

  perform public.sync_profile_identity_verification(new.user_id);
  return new;
end;
$$;

drop trigger if exists identity_verification_sync_profile on public.identity_verifications;
create trigger identity_verification_sync_profile
after insert or update of status, user_id or delete
on public.identity_verifications
for each row execute function public.identity_verification_sync_profile_trigger();

-- Repair every existing profile. This clears stale verified booleans for users
-- whose latest session is pending, processing, failed, requires input, canceled,
-- or missing, while preserving genuinely verified latest sessions.
do $$
declare
  v_user_id uuid;
begin
  for v_user_id in
    select distinct p.user_id
    from public.profiles p
    where p.user_id is not null
  loop
    perform public.sync_profile_identity_verification(v_user_id);
  end loop;
end;
$$;

create or replace function public.process_stripe_identity_verified(
  p_stripe_session_id text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.identity_verifications
  set status = 'verified', updated_at = timezone('utc', now())
  where user_id = p_user_id
    and (
      stripe_session_id = p_stripe_session_id
      or stripe_verification_session_id = p_stripe_session_id
    );

  if not found then
    raise exception 'identity verification session was not found' using errcode = 'P0002';
  end if;

  perform public.sync_profile_identity_verification(p_user_id);
end;
$$;

create or replace function public.process_stripe_identity_requires_input(
  p_stripe_session_id text,
  p_last_error_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
begin
  update public.identity_verifications
  set
    status = 'requires_input',
    last_error = p_last_error_reason,
    updated_at = timezone('utc', now())
  where stripe_session_id = p_stripe_session_id
     or stripe_verification_session_id = p_stripe_session_id
  returning user_id into v_user_id;

  if v_user_id is not null then
    perform public.sync_profile_identity_verification(v_user_id);
  end if;
end;
$$;

revoke execute on function public.process_stripe_identity_verified(text, uuid) from public, anon, authenticated;
revoke execute on function public.process_stripe_identity_requires_input(text, text) from public, anon, authenticated;
grant execute on function public.process_stripe_identity_verified(text, uuid) to service_role;
grant execute on function public.process_stripe_identity_requires_input(text, text) to service_role;

-- Publication must use the latest session, not any historical verified row.
create or replace function public.publish_verified_identity_profile(p_user_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  published public.profiles;
  v_latest_status text;
begin
  if p_user_id is null then
    raise exception 'user id is required' using errcode = '22023';
  end if;

  select lower(coalesce(iv.status, ''))
  into v_latest_status
  from public.identity_verifications iv
  where iv.user_id = p_user_id
  order by iv.created_at desc nulls last, iv.updated_at desc nulls last, iv.id desc
  limit 1;

  if coalesce(v_latest_status, '') <> 'verified' then
    raise exception 'latest identity verification is not complete' using errcode = '42501';
  end if;

  update public.profiles
  set
    is_verified_identity = true,
    verification_status = 'verified',
    identity_verified_at = coalesce(identity_verified_at, timezone('utc', now())),
    status = 'approved',
    profile_status = 'approved',
    visibility_status = 'public',
    is_active = true,
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and coalesce(profile_status, '') not in ('rejected', 'banned', 'suspended')
    and coalesce(status, '') not in ('rejected', 'banned', 'suspended')
  returning * into published;

  if published.id is null then
    raise exception 'eligible provider profile was not found' using errcode = 'P0002';
  end if;

  return published;
end;
$$;

revoke all on function public.publish_verified_identity_profile(uuid) from public;
revoke all on function public.publish_verified_identity_profile(uuid) from anon;
revoke all on function public.publish_verified_identity_profile(uuid) from authenticated;
grant execute on function public.publish_verified_identity_profile(uuid) to service_role;

comment on function public.sync_profile_identity_verification(uuid) is
  'Synchronizes profile trust flags from the latest identity_verifications row. Latest session is authoritative.';
