-- is_admin() only needs to inspect the caller's own row in public.user_roles.
-- user_roles RLS already permits authenticated users to read their own role and
-- returns no rows to anon, so SECURITY DEFINER is unnecessary and exposes an RPC
-- with elevated privileges.

alter function public.is_admin() security invoker;
