-- The private provider view must enforce the querying caller's permissions and
-- the RLS policies on public.profiles instead of the view owner's privileges.
-- Existing profiles RLS already permits authenticated owners to read their own
-- row, while service_role retains its normal RLS bypass.

alter view public.provider_profiles_private set (security_invoker = true);

do $$
declare
  v_options text[];
begin
  select c.reloptions
    into v_options
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'provider_profiles_private'
    and c.relkind = 'v';

  if not coalesce(v_options, '{}'::text[]) @> array['security_invoker=true'] then
    raise exception 'public.provider_profiles_private must be security_invoker';
  end if;
end;
$$;
