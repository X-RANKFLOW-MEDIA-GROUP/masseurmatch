create table if not exists public.paypal_events (
  id uuid primary key default gen_random_uuid(),
  paypal_event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  processing_error text,
  failed_at timestamptz
);

alter table public.paypal_events enable row level security;

revoke all on table public.paypal_events from anon, authenticated;
grant all on table public.paypal_events to service_role;

create index if not exists paypal_events_event_type_idx on public.paypal_events(event_type);
create index if not exists paypal_events_processed_at_idx on public.paypal_events(processed_at desc);
