begin;

-- Stop exposing complete records through the Data API. Public directory access will
-- move to a deliberately scoped view/API in the application migration.
drop policy if exists "profiles_public_read_approved" on public.profiles;
drop policy if exists "Public can read approved therapist profiles" on public.therapist_profiles;

-- Do not expose verification documents to other users or anonymous callers.
drop policy if exists "Users can view own documents" on public.profile_documents;
create policy "profile_documents_owner_read"
on public.profile_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_documents.profile_id
      and p.user_id = (select auth.uid())
  )
);

-- A profile owner may edit normal profile content, but never their authorization,
-- moderation, lifecycle, or billing state.
create or replace function public.prevent_sensitive_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'
  ) then
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
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_sensitive_profile_mutation on public.profiles;
create trigger prevent_sensitive_profile_mutation
before update on public.profiles
for each row execute function public.prevent_sensitive_profile_mutation();

-- A provider cannot self-publish or self-approve the secondary profile record.
create or replace function public.prevent_sensitive_therapist_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'
  ) then
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
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_sensitive_therapist_profile_mutation on public.therapist_profiles;
create trigger prevent_sensitive_therapist_profile_mutation
before update on public.therapist_profiles
for each row execute function public.prevent_sensitive_therapist_profile_mutation();

revoke all on function public.prevent_sensitive_profile_mutation() from public;
revoke all on function public.prevent_sensitive_therapist_profile_mutation() from public;

commit;
