-- Waitlist tables for the coming-soon page signup flow
-- waitlist_rate_limits  – per-fingerprint rate limiting
-- waitlist_events       – analytics / tracking events
-- waitlist_signups      – actual email sign-ups

-- ─────────────────────────────────────────────
-- 1. waitlist_rate_limits
-- ─────────────────────────────────────────────
create table if not exists public.waitlist_rate_limits (
  id            uuid primary key default gen_random_uuid(),
  fingerprint   text not null unique,
  window_start  timestamptz not null default now(),
  request_count integer not null default 1,
  blocked_until timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.waitlist_rate_limits enable row level security;

-- The API route runs with the anon key, so grant anon the minimum it needs.
create policy "anon_select_rate_limits"
  on public.waitlist_rate_limits
  for select
  to anon
  using (true);

create policy "anon_insert_rate_limits"
  on public.waitlist_rate_limits
  for insert
  to anon
  with check (true);

create policy "anon_update_rate_limits"
  on public.waitlist_rate_limits
  for update
  to anon
  using (true)
  with check (true);

-- ─────────────────────────────────────────────
-- 2. waitlist_events
-- ─────────────────────────────────────────────
create table if not exists public.waitlist_events (
  id          uuid primary key default gen_random_uuid(),
  event_name  text not null,
  email       text,
  source      text,
  page_path   text,
  referrer    text,
  user_agent  text,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.waitlist_events enable row level security;

create policy "anon_insert_waitlist_events"
  on public.waitlist_events
  for insert
  to anon
  with check (true);

-- ─────────────────────────────────────────────
-- 3. waitlist_signups
-- ─────────────────────────────────────────────
create table if not exists public.waitlist_signups (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  normalized_email text not null unique,
  role             text not null default 'visitor',
  source           text,
  campaign         text,
  page_path        text,
  referrer         text,
  user_agent       text,
  metadata         jsonb default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

create policy "anon_insert_waitlist_signups"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

-- The upsert in the API route uses onConflict: "normalized_email" which
-- resolves to an UPDATE, so anon also needs SELECT + UPDATE on this table.
create policy "anon_select_waitlist_signups"
  on public.waitlist_signups
  for select
  to anon
  using (true);

create policy "anon_update_waitlist_signups"
  on public.waitlist_signups
  for update
  to anon
  using (true)
  with check (true);
