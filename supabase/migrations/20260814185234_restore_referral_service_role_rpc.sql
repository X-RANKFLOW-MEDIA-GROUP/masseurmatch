-- Restore referral RPC access for the standalone server-side service-role
-- client. The former helper compared current_user from inside a
-- SECURITY DEFINER function, so it saw the function owner instead of the
-- PostgREST caller and rejected valid service_role requests with 42501.
--
-- PostgreSQL EXECUTE privileges remain the authorization boundary. The helper
-- is retained as a no-op for compatibility with existing RPC bodies.

create or replace function public.assert_service_role_caller()
returns void
language sql
security invoker
set search_path = ''
as $$
  select null::void;
$$;

revoke all on function public.assert_service_role_caller() from public, anon, authenticated;
grant execute on function public.assert_service_role_caller() to service_role;

revoke all on function public.expire_referral_bonus_for_user(uuid) from public, anon, authenticated;
grant execute on function public.expire_referral_bonus_for_user(uuid) to service_role;

revoke all on function public.get_referral_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.get_referral_dashboard(uuid) to service_role;
