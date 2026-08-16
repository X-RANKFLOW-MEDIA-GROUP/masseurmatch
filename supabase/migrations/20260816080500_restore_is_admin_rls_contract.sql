-- Reassert the canonical public.is_admin() RLS contract after production drift.
--
-- Public profiles policies call public.is_admin(). The helper must be executable
-- by anon/authenticated so those policies can evaluate it, while remaining
-- SECURITY INVOKER so it obeys caller grants and user_roles RLS.

begin;

alter table public.user_roles enable row level security;

grant select on table public.user_roles to anon, authenticated;

-- Remove legacy/self-read variants and any recursive admin policy before
-- recreating the canonical non-recursive policies.
drop policy if exists "Users can read their own role" on public.user_roles;
drop policy if exists "Users can view their own role" on public.user_roles;
drop policy if exists "Admins can read all user roles" on public.user_roles;
drop policy if exists user_roles_authenticated_read_own on public.user_roles;
drop policy if exists user_roles_anon_no_read on public.user_roles;
drop policy if exists user_roles_select_own on public.user_roles;
drop policy if exists user_roles_anon_no_rows on public.user_roles;

create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy user_roles_anon_no_rows
  on public.user_roles
  for select
  to anon
  using (false);

alter function public.is_admin() security invoker;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

notify pgrst, 'reload schema';

commit;
