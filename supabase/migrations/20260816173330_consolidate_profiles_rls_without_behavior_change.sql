-- Consolidate the profiles policy set into one permissive policy per action.
-- Preserve both id=uid and user_id=uid compatibility paths, public approved visibility,
-- is_admin(), and the legacy app_metadata admin predicate.

drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_delete_admin on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_insert_self_or_admin on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists profiles_owner_read on public.profiles;
drop policy if exists profiles_public_read_active on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists profiles_owner_update on public.profiles;
drop policy if exists profiles_update_self_or_admin on public.profiles;

create policy profiles_select_canonical on public.profiles
  for select to public
  using (
    (
      profile_status = 'approved'::text
      and visibility_status = 'public'::text
      and coalesce(is_suspended, false) = false
      and coalesce(is_banned, false) = false
    )
    or id = (select auth.uid())
    or user_id = (select auth.uid())
    or is_admin()
    or (((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
  );

create policy profiles_insert_canonical on public.profiles
  for insert to public
  with check (
    id = (select auth.uid())
    or user_id = (select auth.uid())
    or is_admin()
    or (((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
  );

create policy profiles_update_canonical on public.profiles
  for update to public
  using (
    id = (select auth.uid())
    or user_id = (select auth.uid())
    or is_admin()
    or (((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
  )
  with check (
    id = (select auth.uid())
    or user_id = (select auth.uid())
    or is_admin()
    or (((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
  );

create policy profiles_delete_canonical on public.profiles
  for delete to public
  using (
    is_admin()
    or (((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
  );
