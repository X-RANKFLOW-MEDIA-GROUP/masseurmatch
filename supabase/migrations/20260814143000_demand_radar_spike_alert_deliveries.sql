create table if not exists public.demand_radar_spike_alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  demand_score_id uuid not null references public.demand_scores(id) on delete cascade,
  run_id text,
  city text not null,
  state text not null,
  spike_score integer not null,
  confidence integer,
  recipient_email text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  provider_message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(profile_id, demand_score_id)
);

create index if not exists demand_radar_spike_alert_deliveries_profile_idx
  on public.demand_radar_spike_alert_deliveries(profile_id, created_at desc);

create index if not exists demand_radar_spike_alert_deliveries_run_idx
  on public.demand_radar_spike_alert_deliveries(run_id, created_at desc);

alter table public.demand_radar_spike_alert_deliveries enable row level security;
revoke all on public.demand_radar_spike_alert_deliveries from public, anon, authenticated;
grant all on public.demand_radar_spike_alert_deliveries to service_role;
