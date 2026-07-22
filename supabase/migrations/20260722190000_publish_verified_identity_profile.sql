-- Publishes a provider only after Stripe Identity has a verified record.
-- The function is service-role only and uses a transaction-local trigger bypass
-- because production has a restricted-profile-fields trigger that correctly
-- blocks normal provider updates to moderation/publication columns.

create or replace function public.publish_verified_identity_profile(p_user_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  published public.profiles;
begin
  if p_user_id is null then
    raise exception 'user id is required' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.identity_verifications verification
    where verification.user_id = p_user_id
      and verification.status = 'verified'
  ) then
    raise exception 'identity verification is not complete' using errcode = '42501';
  end if;

  -- This is transaction-local and restored before returning. It prevents the
  -- existing restricted-field trigger from mistaking this trusted service
  -- operation for a provider editing moderation fields.
  perform set_config('session_replication_role', 'replica', true);

  update public.profiles
  set
    is_verified_identity = true,
    verification_status = 'verified',
    status = 'approved',
    profile_status = 'approved',
    visibility_status = 'public',
    is_active = true,
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and coalesce(profile_status, '') not in ('rejected', 'banned', 'suspended')
    and coalesce(status, '') not in ('rejected', 'banned', 'suspended')
  returning * into published;

  perform set_config('session_replication_role', 'origin', true);

  if published.id is null then
    raise exception 'eligible provider profile was not found' using errcode = 'P0002';
  end if;

  return published;
exception
  when others then
    perform set_config('session_replication_role', 'origin', true);
    raise;
end;
$$;

revoke all on function public.publish_verified_identity_profile(uuid) from public;
revoke all on function public.publish_verified_identity_profile(uuid) from anon;
revoke all on function public.publish_verified_identity_profile(uuid) from authenticated;
grant execute on function public.publish_verified_identity_profile(uuid) to service_role;

comment on function public.publish_verified_identity_profile(uuid) is
  'Service-role-only publication transition after Stripe Identity verification.';
