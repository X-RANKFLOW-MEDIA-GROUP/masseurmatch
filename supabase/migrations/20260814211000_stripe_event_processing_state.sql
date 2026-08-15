alter table public.stripe_events
  add column if not exists processing_status text not null default 'processed';

alter table public.stripe_events
  drop constraint if exists stripe_events_processing_status_check;

alter table public.stripe_events
  add constraint stripe_events_processing_status_check
  check (processing_status in ('processing', 'processed', 'failed'));

create index if not exists idx_stripe_events_processing_status
  on public.stripe_events(processing_status, processed_at desc);
