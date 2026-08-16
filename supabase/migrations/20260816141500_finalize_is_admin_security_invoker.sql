-- Finalize public.is_admin() as SECURITY INVOKER after a concurrent Dashboard
-- script reintroduced SECURITY DEFINER after migration 20260816140500.
--
-- anon and authenticated already have EXECUTE on is_admin() and SELECT on
-- user_roles. RLS keeps anon at zero user_roles rows and restricts authenticated
-- callers to their own role row, so INVOKER preserves the required behavior
-- without elevating the caller to the function owner's privileges.

alter function public.is_admin() security invoker;
