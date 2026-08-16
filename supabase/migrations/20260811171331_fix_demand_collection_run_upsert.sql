drop index if exists public.demand_collection_runs_run_id_uidx;

-- A clean replay may already have the UNIQUE(run_id) constraint because
-- 20260810_fix_demand_radar_schema.sql creates run_id as UNIQUE inline.
-- Only add the named constraint when no equivalent single-column unique
-- constraint exists yet.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'demand_collection_runs'
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) = 'UNIQUE (run_id)'
  ) then
    alter table public.demand_collection_runs
      add constraint demand_collection_runs_run_id_key unique (run_id);
  end if;
end
$$;
