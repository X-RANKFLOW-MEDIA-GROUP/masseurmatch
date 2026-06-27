-- MasseurMatch analytics event ledger
-- Stores privacy-conscious product and conversion events for internal dashboards.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid null references auth.users(id) on delete set null,
  profile_id uuid null,
  session_id text null,
  city text null,
  state text null,
  source_page text null,
  metadata jsonb not null default '{}'::jsonb,
  user_agent text null,
  referrer text null,
  created_at timestamptz not null default now(),

  constraint analytics_events_event_name_length check (char_length(event_name) between 2 and 80),
  constraint analytics_events_source_page_length check (source_page is null or char_length(source_page) <= 120),
  constraint analytics_events_session_id_length check (session_id is null or char_length(session_id) <= 120),
  constraint analytics_events_city_length check (city is null or char_length(city) <= 120),
  constraint analytics_events_state_length check (state is null or char_length(state) <= 80)
);

create index if not exists analytics_events_event_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_profile_created_at_idx
  on public.analytics_events (profile_id, created_at desc)
  where profile_id is not null;

create index if not exists analytics_events_user_created_at_idx
  on public.analytics_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists analytics_events_city_state_created_at_idx
  on public.analytics_events (city, state, created_at desc)
  where city is not null;

create index if not exists analytics_events_metadata_gin_idx
  on public.analytics_events using gin (metadata);

alter table public.analytics_events enable row level security;

-- Inserts are performed by server-side API routes using the service role key.
-- Public read access is intentionally blocked; dashboard-specific reads should use
-- secure server routes or future role-aware policies.

drop policy if exists "analytics_events_no_public_select" on public.analytics_events;
create policy "analytics_events_no_public_select"
  on public.analytics_events
  for select
  to anon, authenticated
  using (false);
