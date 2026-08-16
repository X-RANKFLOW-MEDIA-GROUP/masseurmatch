-- Restore the public profile RLS helper contract after production permission drift.
--
-- profiles public-read policies call public.is_admin(). If anon/authenticated lose
-- EXECUTE on the helper, PostgreSQL rejects the whole profiles SELECT before the
-- public-profile predicate can succeed. Keep this helper SECURITY INVOKER and
-- constrain user_roles reads so callers can only evaluate their own role.

begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant select on table public.user_roles to anon, authenticated, service_role;

-- Remove the recursive legacy admin policy. Because is_admin() itself reads
-- user_roles as SECURITY INVOKER, a user_roles policy that calls is_admin()
-- creates a policy recursion cycle.
drop policy if exists "Admins can read all user roles" on public.user_roles;
drop policy if exists "Users can view their own role" on public.user_roles;
drop policy if exists "Service role can manage all user roles" on public.user_roles;
drop policy if exists "user_roles_authenticated_read_own" on public.user_roles;
drop policy if exists "user_roles_anon_no_read" on public.user_roles;

create policy "user_roles_authenticated_read_own"
on public.user_roles
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_roles_anon_no_read"
on public.user_roles
for select
to anon
using (false);

commit;
