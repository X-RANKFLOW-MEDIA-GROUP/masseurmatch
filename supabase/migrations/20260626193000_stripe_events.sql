create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  failed_at timestamptz,
  processing_error text
);

create index if not exists stripe_events_type_idx on public.stripe_events(type);
create index if not exists stripe_events_processed_at_idx on public.stripe_events(processed_at desc);

alter table public.stripe_events enable row level security;
