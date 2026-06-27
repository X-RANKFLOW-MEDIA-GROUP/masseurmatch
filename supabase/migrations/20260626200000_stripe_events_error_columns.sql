alter table public.stripe_events
  add column if not exists failed_at timestamptz,
  add column if not exists processing_error text;
