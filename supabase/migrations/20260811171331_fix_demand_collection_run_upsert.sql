drop index if exists public.demand_collection_runs_run_id_uidx;
alter table public.demand_collection_runs add constraint demand_collection_runs_run_id_key unique (run_id);
