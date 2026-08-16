-- Reassert the intended privilege mode for public.is_admin() after production
-- drift was observed despite 20260816140500 being recorded as applied.
-- Keep the function body and EXECUTE grants unchanged.

alter function public.is_admin() security invoker;

do $$
declare
  v_security_definer boolean;
begin
  select p.prosecdef
    into v_security_definer
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'is_admin'
    and p.pronargs = 0;

  if v_security_definer is distinct from false then
    raise exception 'public.is_admin() must be SECURITY INVOKER';
  end if;
end;
$$;
