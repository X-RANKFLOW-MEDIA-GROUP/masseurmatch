-- AI Profile Coach base schema.
-- The application computes deterministic snapshots server-side; production may
-- additionally use scheduled database functions for lifecycle email delivery.

create table if not exists public.ai_profile_coach_daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_date date not null default current_date,
  profile_score integer not null default 0 check (profile_score between 0 and 100),
  previous_profile_score integer check (previous_profile_score between 0 and 100),
  score_change integer not null default 0,
  visibility_score integer not null default 0 check (visibility_score between 0 and 100),
  trust_score integer not null default 0 check (trust_score between 0 and 100),
  content_score integer not null default 0 check (content_score between 0 and 100),
  conversion_score integer not null default 0 check (conversion_score between 0 and 100),
  profile_views_1d integer not null default 0,
  profile_views_7d integer not null default 0,
  profile_views_30d integer not null default 0,
  profile_views_change_pct numeric(8,2),
  contact_clicks_1d integer not null default 0,
  contact_clicks_7d integer not null default 0,
  contact_clicks_30d integer not null default 0,
  contact_rate_pct numeric(8,2),
  favorites_7d integer not null default 0,
  inquiries_7d integer not null default 0,
  average_search_position numeric(8,2),
  local_demand_score integer,
  local_demand_trend text,
  strongest_keyword text,
  weakest_section text,
  top_recommendation_key text,
  top_recommendation_title text,
  top_recommendation_reason text,
  top_recommendation_action text,
  top_recommendation_impact text check (top_recommendation_impact in ('high','medium','low')),
  recommended_headline text,
  missing_fields jsonb not null default '[]'::jsonb,
  completed_fields jsonb not null default '[]'::jsonb,
  trust_signals jsonb not null default '{}'::jsonb,
  photo_analysis jsonb not null default '{}'::jsonb,
  content_analysis jsonb not null default '{}'::jsonb,
  market_analysis jsonb not null default '{}'::jsonb,
  recommendation_list jsonb not null default '[]'::jsonb,
  trial_status text,
  trial_day integer,
  trial_days_remaining integer,
  subscription_tier text,
  email_subject text,
  email_preheader text,
  email_payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(profile_id, snapshot_date)
);

create index if not exists ai_profile_coach_daily_snapshots_profile_date_idx
  on public.ai_profile_coach_daily_snapshots(profile_id, snapshot_date desc);

create table if not exists public.ai_profile_coach_email_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  daily_email_enabled boolean not null default true,
  send_time_local time not null default '08:00',
  timezone text not null default 'America/Chicago',
  include_performance boolean not null default true,
  include_market_insights boolean not null default true,
  include_trial_status boolean not null default true,
  include_ai_rewrite boolean not null default true,
  last_sent_at timestamptz,
  last_queued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_profile_coach_daily_snapshots enable row level security;
alter table public.ai_profile_coach_email_preferences enable row level security;

drop policy if exists providers_read_own_ai_coach_snapshots on public.ai_profile_coach_daily_snapshots;
create policy providers_read_own_ai_coach_snapshots
  on public.ai_profile_coach_daily_snapshots for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists providers_manage_own_ai_coach_preferences on public.ai_profile_coach_email_preferences;
create policy providers_manage_own_ai_coach_preferences
  on public.ai_profile_coach_email_preferences for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

grant select on public.ai_profile_coach_daily_snapshots to authenticated;
grant select, insert, update, delete on public.ai_profile_coach_email_preferences to authenticated;
grant all on public.ai_profile_coach_daily_snapshots to service_role;
grant all on public.ai_profile_coach_email_preferences to service_role;

create or replace view public.ai_profile_coach_source
with (security_invoker = true)
as
select
  p.id as profile_id,
  coalesce(p.display_name, p.full_name, 'Provider') as display_name,
  coalesce(p.email_address, p.email) as recipient_email,
  p.slug,
  p.headline,
  p.tagline,
  p.bio,
  p.city,
  p.state,
  p.neighborhood,
  p.country,
  p.photo_url,
  p.avatar_url,
  p.profile_completion_score,
  p.profile_completeness,
  p.completion_score,
  p.completion_percentage,
  p.visibility_status,
  p.profile_status,
  p.verification_status,
  p.subscription_tier,
  p.subscription_status,
  p.current_period_end,
  p.subscription_current_period_start,
  p.subscription_current_period_end,
  p.is_featured,
  p.featured_until,
  p.available_now,
  p.available_now_expires,
  p.offers_incall,
  p.offers_outcall,
  p.incall,
  p.outcall,
  p.starting_price,
  p.starting_rate,
  p.incall_price,
  p.outcall_price,
  p.pricing_sessions,
  p.rates,
  p.session_lengths,
  p.service_categories,
  p.massage_techniques,
  p.modalities,
  p.specialties,
  p.languages,
  p.languages_spoken,
  p.years_experience,
  p.education_entries,
  p.certifications,
  p.training,
  p.affiliations,
  p.massage_setup,
  p.incall_amenities,
  p.studio_amenities,
  p.mobile_extras,
  p.products_used,
  p.payment_methods,
  p.areas_served,
  p.travel_schedule,
  p.business_trips,
  p.is_verified_phone,
  p.is_verified_email,
  p.is_verified_identity,
  p.is_verified_profile,
  p.is_verified_photos,
  p.lgbtq_affirming,
  p.accepts_all_genders,
  p.view_count,
  p.profile_views,
  p.contact_clicks,
  p.inquiry_count,
  p.review_count,
  p.average_rating,
  p.last_seen_at,
  p.updated_at,
  (select count(*) from public.profile_photos pp where pp.profile_id = p.id and pp.moderation_status = 'approved') as approved_photo_count,
  (select count(*) from public.profile_view_analytics pva where pva.profile_id = p.id and pva.created_at >= now() - interval '1 day') as profile_views_1d,
  (select count(*) from public.profile_view_analytics pva where pva.profile_id = p.id and pva.created_at >= now() - interval '7 days') as profile_views_7d,
  (select count(*) from public.profile_view_analytics pva where pva.profile_id = p.id and pva.created_at >= now() - interval '30 days') as profile_views_30d,
  (select count(*) from public.contact_events ce where ce.profile_id = p.id and ce.created_at >= now() - interval '1 day') as contact_clicks_1d,
  (select count(*) from public.contact_events ce where ce.profile_id = p.id and ce.created_at >= now() - interval '7 days') as contact_clicks_7d,
  (select count(*) from public.contact_events ce where ce.profile_id = p.id and ce.created_at >= now() - interval '30 days') as contact_clicks_30d,
  (select count(*) from public.favorites f where f.profile_id = p.id and f.created_at >= now() - interval '7 days') as favorites_7d,
  (select count(*) from public.contact_inquiries ci where ci.profile_id = p.id and ci.created_at >= now() - interval '7 days') as inquiries_7d,
  (select avg(re.position_in_results)::numeric(8,2) from public.ranking_events re where re.profile_id = p.id and re.created_at >= now() - interval '7 days' and re.position_in_results is not null) as average_search_position,
  (select ds.score from public.demand_scores ds where lower(ds.city) = lower(p.city) and lower(ds.state) = lower(p.state) order by ds.week_start desc limit 1) as local_demand_score,
  (select ds.trend from public.demand_scores ds where lower(ds.city) = lower(p.city) and lower(ds.state) = lower(p.state) order by ds.week_start desc limit 1) as local_demand_trend
from public.profiles p
where coalesce(p.is_demo, false) = false
  and coalesce(p.is_banned, false) = false
  and coalesce(p.is_suspended, false) = false;

revoke all on public.ai_profile_coach_source from public, anon, authenticated;
grant select on public.ai_profile_coach_source to service_role;
