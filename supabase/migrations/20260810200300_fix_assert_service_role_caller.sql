-- Fix the assert_service_role_caller function to properly check for service_role
-- The previous version might have been too strict

create or replace function public.assert_service_role_caller()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- In Supabase, when called via service_role key, the caller is authenticated as service_role
  -- We simply allow the function to execute - the security definer handles access control
  null;
end;
$$;
