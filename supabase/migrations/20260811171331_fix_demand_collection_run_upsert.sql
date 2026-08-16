-- Replace the partial unique index on run_id with a real table constraint, so
-- PostgREST upserts can target `on_conflict=run_id` (a partial index is not a
-- valid conflict target).
--
-- This must be guarded. On a database built from scratch, the CREATE TABLE in
-- 20260806230000_demand_radar_pipeline.sql already declares
-- `run_id text NOT NULL UNIQUE`, and Postgres names that constraint
-- demand_collection_runs_run_id_key — exactly the name added here. ADD
-- CONSTRAINT has no IF NOT EXISTS form, so replaying this migration onto a
-- fresh database aborted with 42710 "constraint already exists".
--
-- Production never hit it: the migration is recorded as applied there, so
-- `supabase db push` skips it. Fresh replays are the only path that runs it,
-- which meant every Supabase preview branch ended in MIGRATIONS_FAILED and no
-- pull request ever got its schema verified against a real branch database.
--
-- The drop below targets an index (…_run_id_uidx) while the constraint being
-- added is a different object (…_run_id_key), so it guards nothing on its own.

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
