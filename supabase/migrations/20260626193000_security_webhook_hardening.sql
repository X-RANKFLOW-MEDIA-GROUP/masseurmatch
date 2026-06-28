-- Security hardening: webhook idempotency and storage listing reduction.
-- Safe additive migration for Stripe webhook retries and Supabase advisor findings.

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

-- Webhook events are written by the service-role client only.
-- Do not create anon/authenticated policies for this table.

-- Supabase advisor reported that public bucket therapist-photos has a broad
-- storage.objects SELECT policy that allows bucket listing. Public buckets can
-- still serve object URLs without a broad listing policy, so remove only that
-- known broad policy when present.
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read therapist photos'
  ) then
    execute 'drop policy "Public can read therapist photos" on storage.objects';
  end if;
end $$;
