-- Create the missing assert_service_role_caller function that all referral RPCs depend on.
-- This function checks that the caller has service_role privileges.

create or replace function public.assert_service_role_caller()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Check if the current role is service_role
  if current_user != 'service_role' then
    raise exception 'Only service_role can call this function' using errcode = '42501';
  end if;
end;
$$;
