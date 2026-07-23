-- AI Profile Coach growth engine
-- Backward-compatible additions used by the provider dashboard and reporting jobs.

create table if not exists public.ai_profile_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('profile','seo','competitor','market','forecast','ranking','photo','report')),
  status text not null default 'completed' check (status in ('queued','running','completed','failed')),
  provider text,
  model text,
  input_summary jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_profile_analysis_runs_profile_created_idx
  on public.ai_profile_analysis_runs(profile_id, created_at desc);

create table if not exists public.ai_profile_photo_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid not null references public.profile_photos(id) on delete cascade,
  overall_score integer not null default 0 check (overall_score between 0 and 100),
  pose_score integer not null default 0 check (pose_score between 0 and 100),
  lighting_score integer not null default 0 check (lighting_score between 0 and 100),
  smile_score integer not null default 0 check (smile_score between 0 and 100),
  composition_score integer not null default 0 check (composition_score between 0 and 100),
  background_score integer not null default 0 check (background_score between 0 and 100),
  professionalism_score integer not null default 0 check (professionalism_score between 0 and 100),
  sharpness_score integer not null default 0 check (sharpness_score between 0 and 100),
  thumbnail_score integer not null default 0 check (thumbnail_score between 0 and 100),
  predicted_ctr_lift_pct numeric(8,2),
  recommended_primary boolean not null default false,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  recommendation text,
  analysis_mode text not null default 'metadata' check (analysis_mode in ('vision','metadata')),
  provider text,
  model text,
  analyzed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, photo_id)
);

create index if not exists ai_profile_photo_scores_profile_score_idx
  on public.ai_profile_photo_scores(profile_id, overall_score desc);

create table if not exists public.ai_profile_content_drafts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  field text not null check (field in ('headline','tagline','bio','seo_title','seo_description','seo_keywords')),
  source_text text,
  suggested_text text not null,
  suggested_keywords text[] not null default '{}'::text[],
  rationale text,
  provider text,
  model text,
  status text not null default 'draft' check (status in ('draft','accepted','dismissed')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists ai_profile_content_drafts_profile_created_idx
  on public.ai_profile_content_drafts(profile_id, created_at desc);

create table if not exists public.ai_profile_optimization_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'preview' check (status in ('preview','applied','cancelled','failed')),
  before_state jsonb not null default '{}'::jsonb,
  after_state jsonb not null default '{}'::jsonb,
  applied_fields text[] not null default '{}'::text[],
  estimated_impact jsonb not null default '{}'::jsonb,
  provider text,
  model text,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  error_message text
);

create index if not exists ai_profile_optimization_runs_profile_created_idx
  on public.ai_profile_optimization_runs(profile_id, created_at desc);

create table if not exists public.ai_profile_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  period_type text not null check (period_type in ('weekly','monthly')),
  period_start date not null,
  period_end date not null,
  summary jsonb not null default '{}'::jsonb,
  narrative text,
  provider text,
  model text,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(profile_id, period_type, period_start, period_end),
  check (period_end >= period_start)
);

create index if not exists ai_profile_reports_profile_period_idx
  on public.ai_profile_reports(profile_id, period_end desc);

alter table public.ai_profile_analysis_runs enable row level security;
alter table public.ai_profile_photo_scores enable row level security;
alter table public.ai_profile_content_drafts enable row level security;
alter table public.ai_profile_optimization_runs enable row level security;
alter table public.ai_profile_reports enable row level security;

-- Direct reads are limited to the signed-in provider. Mutations are performed
-- by authenticated server routes through the service role after session checks.
drop policy if exists ai_profile_analysis_runs_select_own on public.ai_profile_analysis_runs;
create policy ai_profile_analysis_runs_select_own
  on public.ai_profile_analysis_runs for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists ai_profile_photo_scores_select_own on public.ai_profile_photo_scores;
create policy ai_profile_photo_scores_select_own
  on public.ai_profile_photo_scores for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists ai_profile_content_drafts_select_own on public.ai_profile_content_drafts;
create policy ai_profile_content_drafts_select_own
  on public.ai_profile_content_drafts for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists ai_profile_optimization_runs_select_own on public.ai_profile_optimization_runs;
create policy ai_profile_optimization_runs_select_own
  on public.ai_profile_optimization_runs for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists ai_profile_reports_select_own on public.ai_profile_reports;
create policy ai_profile_reports_select_own
  on public.ai_profile_reports for select to authenticated
  using (profile_id = (select auth.uid()));

revoke all on table public.ai_profile_analysis_runs from anon, authenticated;
revoke all on table public.ai_profile_photo_scores from anon, authenticated;
revoke all on table public.ai_profile_content_drafts from anon, authenticated;
revoke all on table public.ai_profile_optimization_runs from anon, authenticated;
revoke all on table public.ai_profile_reports from anon, authenticated;

grant select on table public.ai_profile_analysis_runs to authenticated;
grant select on table public.ai_profile_photo_scores to authenticated;
grant select on table public.ai_profile_content_drafts to authenticated;
grant select on table public.ai_profile_optimization_runs to authenticated;
grant select on table public.ai_profile_reports to authenticated;

grant all on table public.ai_profile_analysis_runs to service_role;
grant all on table public.ai_profile_photo_scores to service_role;
grant all on table public.ai_profile_content_drafts to service_role;
grant all on table public.ai_profile_optimization_runs to service_role;
grant all on table public.ai_profile_reports to service_role;

-- Tighten the two existing provider policies and avoid per-row auth.uid() calls.
drop policy if exists providers_read_own_ai_coach_snapshots on public.ai_profile_coach_daily_snapshots;
create policy providers_read_own_ai_coach_snapshots
  on public.ai_profile_coach_daily_snapshots for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists providers_manage_own_ai_coach_preferences on public.ai_profile_coach_email_preferences;
create policy providers_manage_own_ai_coach_preferences
  on public.ai_profile_coach_email_preferences for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- The source view is server-only and must respect the invoking role.
alter view public.ai_profile_coach_source set (security_invoker = true);
revoke all on public.ai_profile_coach_source from public, anon, authenticated;
grant select on public.ai_profile_coach_source to service_role;
