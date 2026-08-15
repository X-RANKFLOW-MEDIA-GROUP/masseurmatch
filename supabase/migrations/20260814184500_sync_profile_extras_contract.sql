-- Synchronize the additive runtime schema contract with fields already present
-- in production and close schema/code drift discovered by the release gate.
-- This migration is idempotent and does not remove or rename data.

alter table public.profiles
  add column if not exists map_enabled boolean default false,
  add column if not exists massage_setup text[],
  add column if not exists mobile_extras text[],
  add column if not exists products_used text[],
  add column if not exists products_sold text[],
  add column if not exists payment_methods text[],
  add column if not exists day_of_week_discount jsonb default '[]'::jsonb,
  add column if not exists education_entries jsonb default '[]'::jsonb,
  add column if not exists additional_services text[],
  add column if not exists studio_amenities text[],
  add column if not exists rate_disclaimers text[],
  add column if not exists affiliations text[],
  add column if not exists start_date timestamptz;

-- Admin Messaging imports persist the acquisition source. Production already has
-- this column; keeping it here makes the canonical contract reproducible.
alter table public.messaging_contacts
  add column if not exists source text;

-- Bruno conversation logging predates the consolidated schema lock. Reassert
-- only its additive table shape here so a clean environment and the contract
-- validator agree with production.
create table if not exists public.bruno_conversations (
  id bigint generated always as identity primary key,
  phone text,
  inbound text,
  reply text,
  created_at timestamptz not null default now()
);

-- Stripe webhook idempotency needs an explicit processing state. Existing rows
-- are completed historical events unless they already carry a failure marker.
alter table public.stripe_events
  add column if not exists processing_status text;

update public.stripe_events
set processing_status = case
  when failed_at is not null or processing_error is not null then 'failed'
  else 'processed'
end
where processing_status is null;

alter table public.stripe_events
  alter column processing_status set default 'processed',
  alter column processing_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stripe_events_processing_status_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_processing_status_check
      check (processing_status in ('processing', 'processed', 'failed'));
  end if;
end
$$;
