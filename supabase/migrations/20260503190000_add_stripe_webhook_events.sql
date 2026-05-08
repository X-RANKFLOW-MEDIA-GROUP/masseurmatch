-- Durable Stripe webhook idempotency table.
-- Additive only. Safe to run more than once.

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  status text not null default 'processing' check (status in ('processing','processed','failed','skipped')),
  user_id uuid,
  error_message text,
  payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_stripe_webhook_events_status_created_at
  on public.stripe_webhook_events(status, created_at desc);

create index if not exists idx_stripe_webhook_events_event_type_created_at
  on public.stripe_webhook_events(event_type, created_at desc);

alter table public.stripe_webhook_events enable row level security;

drop trigger if exists trg_stripe_webhook_events_updated_at on public.stripe_webhook_events;
create trigger trg_stripe_webhook_events_updated_at
  before update on public.stripe_webhook_events
  for each row execute function public.set_updated_at();
