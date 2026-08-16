-- Operational health for the dedicated MasseurMatch iMessage bridge.
-- Contains runtime metadata only; no message bodies, phone numbers or provider PII.

create table if not exists public.messaging_imessage_bridge_workers (
  worker_id text primary key check (char_length(worker_id) between 1 and 120),
  bridge_version text not null check (char_length(bridge_version) between 1 and 80),
  started_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  last_cycle_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  last_error_code text check (
    last_error_code is null or last_error_code ~ '^[A-Z0-9_]{1,80}$'
  ),
  last_error_at timestamptz,
  replay_history boolean not null default false,
  poll_ms integer not null default 5000 check (poll_ms between 2000 and 60000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_messaging_imessage_bridge_workers_last_seen
  on public.messaging_imessage_bridge_workers(last_seen_at desc);

alter table public.messaging_imessage_bridge_workers enable row level security;

create policy messaging_imessage_bridge_workers_admin_read
on public.messaging_imessage_bridge_workers
for select to authenticated
using (public.is_admin());

revoke all on public.messaging_imessage_bridge_workers from anon;
grant select on public.messaging_imessage_bridge_workers to authenticated;
grant select, insert, update, delete on public.messaging_imessage_bridge_workers to service_role;

comment on table public.messaging_imessage_bridge_workers is
  'Liveness and sanitized operational health for authenticated MasseurMatch iMessage bridge workers.';
