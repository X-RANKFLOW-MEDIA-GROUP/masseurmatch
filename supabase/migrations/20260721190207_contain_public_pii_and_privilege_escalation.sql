begin;

-- Stop exposing complete records through the Data API.
drop policy if exists "profiles_public_read_approved" on public.profiles;

DO $$
BEGIN
  IF to_regclass('public.therapist_profiles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public can read approved therapist profiles" ON public.therapist_profiles;
  END IF;
END
$$;

-- Verification documents are optional on clean branches.
DO $$
BEGIN
  IF to_regclass('public.profile_documents') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profile_documents' AND column_name='profile_id') THEN
    DROP POLICY IF EXISTS "Users can view own documents" ON public.profile_documents;
    DROP POLICY IF EXISTS "profile_documents_owner_read" ON public.profile_documents;
    CREATE POLICY "profile_documents_owner_read"
      ON public.profile_documents
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = profile_documents.profile_id
            AND p.user_id = (select auth.uid())
        )
      );
  END IF;
END
$$;

-- A profile owner may edit normal profile content, but never authorization,
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

-- The secondary therapist profile is optional on some clean branches.
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

DO $$
BEGIN
  IF to_regclass('public.therapist_profiles') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS prevent_sensitive_therapist_profile_mutation ON public.therapist_profiles;
    CREATE TRIGGER prevent_sensitive_therapist_profile_mutation
      BEFORE UPDATE ON public.therapist_profiles
      FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_therapist_profile_mutation();
  END IF;
END
$$;

revoke all on function public.prevent_sensitive_profile_mutation() from public;
revoke all on function public.prevent_sensitive_therapist_profile_mutation() from public;

commit;
