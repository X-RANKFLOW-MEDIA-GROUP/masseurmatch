-- Harden the admin authorization helper without breaking RLS policies.
--
-- public.is_admin() is referenced by many public-schema policies. It must remain
-- executable by anon/authenticated so those policies can evaluate it, but it
-- does not need postgres privileges. SECURITY INVOKER makes the helper obey the
-- caller's grants and user_roles RLS instead of bypassing them.

alter table public.user_roles enable row level security;

grant select on table public.user_roles to anon, authenticated;

-- Consolidate the duplicated authenticated self-read policies into one
-- initPlan-friendly policy. Anonymous callers may execute is_admin(), but they
-- must never see a user_roles row.
drop policy if exists "Users can read their own role" on public.user_roles;
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists user_roles_anon_no_rows on public.user_roles;
create policy user_roles_anon_no_rows
  on public.user_roles
  for select
  to anon
  using (false);

alter function public.is_admin() security invoker;

-- Remove the implicit PUBLIC grant, then explicitly keep only the roles that
-- legitimately evaluate this helper through RLS or trusted server execution.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

notify pgrst, 'reload schema';
