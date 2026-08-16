do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'therapist_analytics_daily'
      and c.relkind = 'v'
  ) then
    execute 'alter view public.therapist_analytics_daily set (security_invoker = true)';
  end if;
end $$;
