begin;

-- The privilege-escalation guards added in
-- 20260721190207_contain_public_pii_and_privilege_escalation.sql decide who may
-- change authorization / moderation / billing fields by checking for an admin
-- row via auth.uid(). But EVERY admin action in the app (approve, reject,
-- activate, suspend, ban, verify_identity, …) is performed server-side with the
-- SERVICE ROLE key through createSupabaseAdminClient(), where auth.uid() is
-- NULL. So those already-authorized writes (the route gates on
-- requireAdminSession first) were rejected with:
--   "restricted profile fields may only be changed by an administrator".
--
-- Fix: let the service role bypass the guard, in addition to the existing
-- admin-via-auth.uid() path. This does NOT reopen the escalation hole the guard
-- closes — providers act through the `authenticated` role and can never obtain
-- the service-role key, so they remain blocked from changing these fields on
-- their own rows. Only trusted server code (which already enforces admin auth at
-- the application layer) can present the service role.

create or replace function public.prevent_sensitive_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Trusted backend (service role) or an admin acting through their own JWT.
  if (select auth.role()) = 'service_role'
     or exists (
       select 1 from public.user_roles ur
       where ur.user_id = (select auth.uid())
         and ur.role = 'admin'
     ) then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.profile_status is distinct from old.profile_status
     or new.visibility_status is distinct from old.visibility_status
     or new.is_suspended is distinct from old.is_suspended
     or new.is_banned is distinct from old.is_banned
     or new.moderation_notes is distinct from old.moderation_notes
     or new.admin_notes is distinct from old.admin_notes
     or new.rejection_reason is distinct from old.rejection_reason
     or new.suspension_reason is distinct from old.suspension_reason
     or new.banned_reason is distinct from old.banned_reason
     or new.tier is distinct from old.tier
     or new._tier is distinct from old._tier
     or new.subscription_tier is distinct from old.subscription_tier
     or new.subscription_plan is distinct from old.subscription_plan
  then
    raise exception 'restricted profile fields may only be changed by an administrator'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_sensitive_therapist_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role'
     or exists (
       select 1 from public.user_roles ur
       where ur.user_id = (select auth.uid())
         and ur.role = 'admin'
     ) then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.profile_id is distinct from old.profile_id
     or new.user_id is distinct from old.user_id
     or new.is_published is distinct from old.is_published
     or new.moderation_status is distinct from old.moderation_status
     or new.verification_status is distinct from old.verification_status
  then
    raise exception 'publication and moderation fields may only be changed by an administrator'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- The BEFORE UPDATE triggers reference these functions by name, so replacing the
-- function bodies above is sufficient; no trigger re-creation needed.

revoke all on function public.prevent_sensitive_profile_mutation() from public;
revoke all on function public.prevent_sensitive_therapist_profile_mutation() from public;

commit;
