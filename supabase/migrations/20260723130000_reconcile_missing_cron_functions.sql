-- Reconciliation migration.
--
-- Production logs show recurring failures for functions that ARE defined in the
-- repo but are absent from the live database — the schema has drifted from the
-- migration history (some earlier migrations never fully applied):
--
--   42883  function public.refresh_knotty_learning_scores() does not exist   (hourly, :17)
--   42883  function public.run_lifecycle_campaign_jobs() does not exist       (daily)
--
-- The pg_cron jobs that call them still exist, so every scheduled run errors.
-- This migration re-asserts those functions (and their dependencies) idempotently
-- from the canonical definitions in:
--   20260321143000_knotty_learning_engine.sql
--   20260315121500_2f7162c3-2648-47be-b2ca-52b95d90d8f2.sql
-- so it succeeds regardless of how far the live schema has drifted. Everything is
-- CREATE ... IF NOT EXISTS / CREATE OR REPLACE, so it is safe to run repeatedly
-- and safe on a database that already has these objects.

begin;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- ── Knotty learning: dependency tables (so the function body validates) ───────

create table if not exists public.ranking_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid null references auth.users (id) on delete set null,
  therapist_id uuid null references public.profiles (id) on delete cascade,
  event_name text not null check (
    event_name in (
      'knotty_open',
      'knotty_recommendation_shown',
      'knotty_profile_clicked',
      'knotty_contact_clicked',
      'knotty_call_clicked',
      'knotty_text_clicked',
      'knotty_whatsapp_clicked',
      'profile_viewed',
      'search_submitted',
      'filter_applied'
    )
  ),
  city text null,
  neighborhood text null,
  intent text not null default 'general' check (
    intent in (
      'available_now', 'mobile', 'verified', 'budget', 'premium',
      'nearby', 'technique', 'travel', 'help_choose', 'general'
    )
  ),
  device_type text null check (
    device_type is null or device_type in ('mobile', 'tablet', 'desktop', 'unknown')
  ),
  position_in_results integer null,
  recommendation_source text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_ranking_events_created_at on public.ranking_events (created_at desc);
create index if not exists idx_ranking_events_session on public.ranking_events (session_id, created_at desc);
create index if not exists idx_ranking_events_therapist on public.ranking_events (therapist_id, created_at desc);
create index if not exists idx_ranking_events_name on public.ranking_events (event_name, created_at desc);

alter table public.ranking_events enable row level security;

create table if not exists public.therapist_learning_scores (
  therapist_id uuid not null references public.profiles (id) on delete cascade,
  city text not null default '__all__',
  intent text not null default 'general' check (
    intent in (
      'available_now', 'mobile', 'verified', 'budget', 'premium',
      'nearby', 'technique', 'travel', 'help_choose', 'general'
    )
  ),
  impressions integer not null default 0 check (impressions >= 0),
  profile_clicks integer not null default 0 check (profile_clicks >= 0),
  contact_clicks integer not null default 0 check (contact_clicks >= 0),
  ctr numeric not null default 0,
  contact_rate numeric not null default 0,
  intent_conversion_rate numeric not null default 0,
  score_7d numeric not null default 0,
  score_30d numeric not null default 0,
  weighted_score numeric not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (therapist_id, city, intent)
);

create index if not exists idx_therapist_learning_scores_weighted
  on public.therapist_learning_scores (weighted_score desc, updated_at desc);
create index if not exists idx_therapist_learning_scores_city_intent
  on public.therapist_learning_scores (city, intent, weighted_score desc);

alter table public.therapist_learning_scores enable row level security;

-- ── Knotty learning: the refresh function (canonical body) ────────────────────

create or replace function public.refresh_knotty_learning_scores()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with base_events as (
    select
      therapist_id,
      coalesce(nullif(trim(city), ''), '__all__') as city_bucket,
      coalesce(nullif(trim(intent), ''), 'general') as intent_bucket,
      event_name,
      created_at
    from public.ranking_events
    where therapist_id is not null
      and created_at >= timezone('utc', now()) - interval '30 days'
  ),
  expanded_events as (
    select therapist_id, city_bucket as city, intent_bucket as intent, event_name, created_at from base_events
    union all
    select therapist_id, '__all__' as city, intent_bucket as intent, event_name, created_at from base_events
    union all
    select therapist_id, city_bucket as city, 'general' as intent, event_name, created_at from base_events
    union all
    select therapist_id, '__all__' as city, 'general' as intent, event_name, created_at from base_events
  ),
  aggregate_30d as (
    select
      therapist_id, city, intent,
      count(*) filter (where event_name = 'knotty_recommendation_shown') as impressions_30d,
      count(*) filter (where event_name = 'knotty_profile_clicked') as profile_clicks_30d,
      count(*) filter (
        where event_name in ('knotty_contact_clicked','knotty_call_clicked','knotty_text_clicked','knotty_whatsapp_clicked')
      ) as contact_clicks_30d,
      count(*) filter (where event_name = 'knotty_contact_clicked') as generic_contact_clicks_30d,
      count(*) filter (
        where event_name in ('knotty_call_clicked','knotty_text_clicked','knotty_whatsapp_clicked')
      ) as direct_contact_clicks_30d
    from expanded_events
    group by therapist_id, city, intent
  ),
  aggregate_7d as (
    select
      therapist_id, city, intent,
      count(*) filter (where event_name = 'knotty_recommendation_shown') as impressions_7d,
      count(*) filter (where event_name = 'knotty_profile_clicked') as profile_clicks_7d,
      count(*) filter (
        where event_name in ('knotty_contact_clicked','knotty_call_clicked','knotty_text_clicked','knotty_whatsapp_clicked')
      ) as contact_clicks_7d,
      count(*) filter (where event_name = 'knotty_contact_clicked') as generic_contact_clicks_7d,
      count(*) filter (
        where event_name in ('knotty_call_clicked','knotty_text_clicked','knotty_whatsapp_clicked')
      ) as direct_contact_clicks_7d
    from expanded_events
    where created_at >= timezone('utc', now()) - interval '7 days'
    group by therapist_id, city, intent
  ),
  merged as (
    select
      a30.therapist_id, a30.city, a30.intent,
      a30.impressions_30d, a30.profile_clicks_30d, a30.contact_clicks_30d,
      coalesce(a7.impressions_7d, 0) as impressions_7d,
      coalesce(a7.profile_clicks_7d, 0) as profile_clicks_7d,
      coalesce(a7.contact_clicks_7d, 0) as contact_clicks_7d,
      coalesce(a30.generic_contact_clicks_30d, 0) as generic_contact_clicks_30d,
      coalesce(a30.direct_contact_clicks_30d, 0) as direct_contact_clicks_30d,
      coalesce(a7.generic_contact_clicks_7d, 0) as generic_contact_clicks_7d,
      coalesce(a7.direct_contact_clicks_7d, 0) as direct_contact_clicks_7d
    from aggregate_30d a30
    left join aggregate_7d a7
      on a7.therapist_id = a30.therapist_id
     and a7.city = a30.city
     and a7.intent = a30.intent
  ),
  scored as (
    select
      therapist_id, city, intent,
      impressions_30d as impressions,
      profile_clicks_30d as profile_clicks,
      contact_clicks_30d as contact_clicks,
      least(1, coalesce(profile_clicks_30d::numeric / nullif(impressions_30d, 0), 0)) as ctr_30d,
      least(1, coalesce(contact_clicks_30d::numeric / nullif(impressions_30d, 0), 0)) as contact_rate_30d,
      least(1, coalesce(
        ((profile_clicks_30d * 1) + (generic_contact_clicks_30d * 3) + (direct_contact_clicks_30d * 6))::numeric
        / nullif(impressions_30d, 0), 0)) as intent_conversion_rate_30d,
      least(1, coalesce(profile_clicks_7d::numeric / nullif(impressions_7d, 0), 0)) as ctr_7d,
      least(1, coalesce(contact_clicks_7d::numeric / nullif(impressions_7d, 0), 0)) as contact_rate_7d,
      least(1, coalesce(
        ((profile_clicks_7d * 1) + (generic_contact_clicks_7d * 3) + (direct_contact_clicks_7d * 6))::numeric
        / nullif(impressions_7d, 0), 0)) as intent_conversion_rate_7d,
      least(1, coalesce(impressions_7d::numeric / nullif(impressions_30d, 0), 0)) as recency_boost
    from merged
  )
  insert into public.therapist_learning_scores (
    therapist_id, city, intent, impressions, profile_clicks, contact_clicks,
    ctr, contact_rate, intent_conversion_rate, score_7d, score_30d, weighted_score, updated_at
  )
  select
    therapist_id, city, intent, impressions, profile_clicks, contact_clicks,
    round(ctr_30d, 6),
    round(contact_rate_30d, 6),
    round(intent_conversion_rate_30d, 6),
    round((ctr_7d * 0.30) + (contact_rate_7d * 0.45) + (intent_conversion_rate_7d * 0.15) + (recency_boost * 0.10), 6),
    round((ctr_30d * 0.30) + (contact_rate_30d * 0.45) + (intent_conversion_rate_30d * 0.15) + (recency_boost * 0.10), 6),
    round(
      (((ctr_7d * 0.30) + (contact_rate_7d * 0.45) + (intent_conversion_rate_7d * 0.15) + (recency_boost * 0.10)) * 0.60) +
      (((ctr_30d * 0.30) + (contact_rate_30d * 0.45) + (intent_conversion_rate_30d * 0.15) + (recency_boost * 0.10)) * 0.40),
      6
    ),
    timezone('utc', now())
  from scored
  on conflict (therapist_id, city, intent) do update
  set
    impressions = excluded.impressions,
    profile_clicks = excluded.profile_clicks,
    contact_clicks = excluded.contact_clicks,
    ctr = excluded.ctr,
    contact_rate = excluded.contact_rate,
    intent_conversion_rate = excluded.intent_conversion_rate,
    score_7d = excluded.score_7d,
    score_30d = excluded.score_30d,
    weighted_score = excluded.weighted_score,
    updated_at = excluded.updated_at;

  delete from public.therapist_learning_scores
  where updated_at < timezone('utc', now()) - interval '45 days';
end;
$$;

-- ── Lifecycle campaign jobs (canonical bodies) ────────────────────────────────
-- NB: invoke_edge_function requires the app.settings.supabase_url and
-- app.settings.supabase_anon_key GUCs to be set on the database; if they are
-- not, run_lifecycle_campaign_jobs will raise a clear configuration error rather
-- than the "function does not exist" error this migration removes.

create or replace function public.invoke_edge_function(
  p_function_name text,
  p_body jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _url text;
  _anon_key text;
begin
  _url := current_setting('app.settings.supabase_url', true);
  _anon_key := current_setting('app.settings.supabase_anon_key', true);

  if _url is null or _url = '' or _anon_key is null or _anon_key = '' then
    raise exception 'Set app.settings.supabase_url and app.settings.supabase_anon_key before scheduling lifecycle edge function jobs.';
  end if;

  perform net.http_post(
    url := _url || '/functions/v1/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon_key,
      'apikey', _anon_key
    ),
    body := coalesce(p_body, '{}'::jsonb)
  );
end;
$$;

create or replace function public.run_lifecycle_queue_worker()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.invoke_edge_function('process-lifecycle-email-queue', jsonb_build_object('limit', 100));
end;
$$;

create or replace function public.run_lifecycle_campaign_jobs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.invoke_edge_function('run-lifecycle-campaigns', '{}'::jsonb);
  perform public.invoke_edge_function('trial-reminder-emails', '{}'::jsonb);
end;
$$;

-- ── (Re)schedule the cron jobs, idempotently by name ──────────────────────────

do $$
declare
  _job_id bigint;
begin
  select jobid into _job_id from cron.job where jobname = 'knotty_learning_refresh_hourly';
  if _job_id is not null then perform cron.unschedule(_job_id); end if;
  perform cron.schedule('knotty_learning_refresh_hourly', '17 * * * *',
    'SELECT public.refresh_knotty_learning_scores();');
end $$;

do $$
declare
  _job_id bigint;
begin
  select jobid into _job_id from cron.job where jobname = 'lifecycle_email_queue_worker_q15';
  if _job_id is not null then perform cron.unschedule(_job_id); end if;
  perform cron.schedule('lifecycle_email_queue_worker_q15', '*/15 * * * *',
    'SELECT public.run_lifecycle_queue_worker();');
end $$;

do $$
declare
  _job_id bigint;
begin
  select jobid into _job_id from cron.job where jobname = 'lifecycle_campaign_jobs_daily';
  if _job_id is not null then perform cron.unschedule(_job_id); end if;
  perform cron.schedule('lifecycle_campaign_jobs_daily', '10 14 * * *',
    'SELECT public.run_lifecycle_campaign_jobs();');
end $$;

do $$
declare
  _job_id bigint;
begin
  select jobid into _job_id from cron.job where jobname = 'lifecycle_campaign_jobs_weekly';
  if _job_id is not null then perform cron.unschedule(_job_id); end if;
  perform cron.schedule('lifecycle_campaign_jobs_weekly', '0 15 * * 1',
    'SELECT public.run_lifecycle_campaign_jobs();');
end $$;

commit;
