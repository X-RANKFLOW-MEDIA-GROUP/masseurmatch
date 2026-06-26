-- MasseurMatch Production Schema Lock (idempotent)
-- This file is the production database contract used by go-live validation.
-- It must stay additive-only: no destructive drops, no renames, no data loss.

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','provider','client','therapist')),
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, role)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'provider',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.profiles
  add column if not exists slug text,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists display_name text,
  add column if not exists headline text,
  add column if not exists bio text,
  add column if not exists photo_url text,
  add column if not exists avatar_url text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists country text,
  add column if not exists neighborhood text,
  add column if not exists neighborhood_name text,
  add column if not exists primary_area text,
  add column if not exists phone text,
  add column if not exists phone_number text,
  add column if not exists whatsapp text,
  add column if not exists whatsapp_number text,
  add column if not exists email_address text,
  add column if not exists show_email boolean not null default false,
  add column if not exists website text,
  add column if not exists booking_link text,
  add column if not exists specialties text[] default '{}',
  add column if not exists specialty text,
  add column if not exists modalities text[] default '{}',
  add column if not exists modality text,
  add column if not exists massage_techniques text[] default '{}',
  add column if not exists service_categories text[] default '{}',
  add column if not exists languages text[] default '{}',
  add column if not exists languages_spoken text[] default '{}',
  add column if not exists incall boolean default false,
  add column if not exists outcall boolean default false,
  add column if not exists offers_incall boolean default false,
  add column if not exists offers_outcall boolean default false,
  add column if not exists traveling boolean default false,
  add column if not exists visiting boolean default false,
  add column if not exists starting_price integer,
  add column if not exists starting_rate integer,
  add column if not exists price_min integer,
  add column if not exists price_max integer,
  add column if not exists incall_price integer,
  add column if not exists outcall_price integer,
  add column if not exists session_duration integer,
  add column if not exists session_lengths integer[] default '{}',
  add column if not exists outcall_radius integer,
  add column if not exists outcall_radius_miles integer,
  add column if not exists location_type text default 'incall',
  add column if not exists available_now boolean default false,
  add column if not exists available_now_expires timestamptz,
  add column if not exists business_hours jsonb,
  add column if not exists custom_faq jsonb,
  add column if not exists promotions jsonb,
  add column if not exists travel_schedule jsonb,
  add column if not exists areas_served text[] default '{}',
  add column if not exists training text,
  add column if not exists education text,
  add column if not exists certifications text,
  add column if not exists years_experience integer,
  add column if not exists height_inches integer,
  add column if not exists weight_lb integer,
  add column if not exists body_type text,
  add column if not exists start_year integer,
  add column if not exists lgbtq_affirming boolean default false,
  add column if not exists accepts_all_genders boolean default true,
  add column if not exists accessibility_features text[] default '{}',
  add column if not exists is_verified_identity boolean default false,
  add column if not exists is_verified_email boolean default false,
  add column if not exists is_verified_phone boolean default false,
  add column if not exists is_verified_profile boolean default false,
  add column if not exists is_verified_photos boolean default false,
  add column if not exists verification_status text default 'unverified',
  add column if not exists profile_status text default 'draft',
  add column if not exists visibility_status text default 'hidden',
  add column if not exists status text default 'draft',
  add column if not exists is_active boolean default false,
  add column if not exists is_featured boolean default false,
  add column if not exists is_suspended boolean default false,
  add column if not exists is_banned boolean default false,
  add column if not exists subscription_tier text default 'free',
  add column if not exists subscription_status text,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_verification_session_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists _tier text,
  add column if not exists photo_limit integer default 2,
  add column if not exists visibility_level integer default 1,
  add column if not exists featured_until timestamptz,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text[],
  add column if not exists profile_completeness integer default 0,
  add column if not exists completion_score integer default 0,
  add column if not exists view_count integer default 0,
  add column if not exists profile_views integer default 0,
  add column if not exists contact_clicks integer default 0,
  add column if not exists inquiry_count integer default 0,
  add column if not exists review_count integer default 0,
  add column if not exists average_rating numeric(3,2),
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists add_ons jsonb,
  add column if not exists pricing_sessions jsonb,
  add column if not exists rates jsonb,
  add column if not exists rating_average numeric(3,2),
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7),
  add column if not exists presentation_video_url text,
  add column if not exists social_media jsonb,
  add column if not exists subscription_plan text,
  add column if not exists subscription_current_period_start timestamptz,
  add column if not exists subscription_current_period_end timestamptz,
  add column if not exists subscription_cancel_at_period_end boolean default false,
  add column if not exists completion_percentage integer default 0,
  add column if not exists role text,
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists admin_notes text,
  add column if not exists moderation_notes text,
  add column if not exists rejection_reason text,
  add column if not exists last_active_at timestamptz,
  add column if not exists regular_discounts jsonb;

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check check (status in ('draft','pending','pending_approval','under_review','approved','suspended','rejected','changes_requested'));
alter table public.profiles drop constraint if exists profiles_profile_status_check;
alter table public.profiles add constraint profiles_profile_status_check check (profile_status in ('draft','pending','pending_approval','under_review','approved','suspended','rejected','changes_requested'));
alter table public.profiles drop constraint if exists profiles_subscription_tier_check;
alter table public.profiles add constraint profiles_subscription_tier_check check (subscription_tier in ('free','standard','pro','elite','featured'));
alter table public.profiles drop constraint if exists profiles_visibility_status_check;
alter table public.profiles add constraint profiles_visibility_status_check check (visibility_status in ('hidden','public','paused','suspended'));
alter table public.profiles drop constraint if exists profiles_verification_status_check;
alter table public.profiles add constraint profiles_verification_status_check check (verification_status in ('unverified','pending','reviewing','verified','rejected','expired','processing'));

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  storage_path text,
  url text,
  is_primary boolean default false,
  sort_order integer default 0,
  moderation_status text default 'pending',
  moderation_reason text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.therapist_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  therapist_profile_id uuid,
  storage_path text,
  public_url text,
  photo_type text not null default 'gallery' check (photo_type in ('profile','gallery')),
  status text not null default 'draft' check (status in ('draft','pending_review','approved','rejected','removed')),
  approval_status text default 'pending',
  rejection_reason text,
  sort_order integer not null default 0,
  width integer,
  height integer,
  file_size bigint,
  mime_type text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','pending_approval','submitted','under_review','approved','rejected','changes_requested')),
  moderation_notes text,
  submitted_at timestamptz,
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  status text default 'pending',
  stripe_verification_session_id text,
  stripe_session_id text,
  last_error text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.identity_verifications drop constraint if exists identity_verifications_status_check;
alter table public.identity_verifications add constraint identity_verifications_status_check check (status in ('not_started','pending','processing','verified','requires_input','failed','canceled','reviewing','approved','rejected','expired'));

create table if not exists public.text_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  submitted_text text,
  code text,
  verification_code text,
  status text not null default 'not_started' check (status in ('not_started','pending','verified','failed','expired')),
  provider text,
  attempt_count integer not null default 0,
  sent_at timestamptz,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  action text,
  action_type text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  target_profile_id uuid,
  target_table text,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  admin_id uuid references auth.users(id) on delete set null,
  action text,
  action_type text not null,
  target_type text,
  target_id uuid,
  target_user_id uuid,
  target_profile_id uuid,
  details jsonb,
  reason text,
  metadata jsonb,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.lifecycle_email_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  provider_id uuid,
  recipient_email text,
  recipient_name text,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text,
  suppression_reason text,
  subject text,
  status text default 'pending',
  body_html text,
  body_text text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  error_message text,
  retry_count integer not null default 0,
  idempotency_key text unique,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  therapist_id uuid,
  client_email text,
  message text,
  status text default 'new',
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  name text,
  city text,
  is_active boolean not null default true,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  slug text unique,
  display_name text,
  contact_email text,
  city text,
  state text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  state text,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text,
  slug text unique,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  profile_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  tier text,
  current_period_end timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text,
  excerpt text,
  body text,
  tags text[] default '{}',
  published_at timestamptz,
  seo_description text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  therapist_id uuid,
  client_id uuid,
  client_email text,
  reviewer_name text,
  title text,
  content text,
  review_text text,
  rating integer,
  review_date date,
  status text default 'pending',
  is_public boolean default false,
  is_verified boolean default false,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.client_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  client_user_id uuid,
  profile_id uuid,
  therapist_id uuid,
  therapist_profile_id uuid,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  query text,
  filters jsonb,
  results_count integer,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.contact_preferences (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid,
  allow_phone boolean default true,
  allow_email boolean default true,
  allow_whatsapp boolean default true,
  auto_reply_message text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email_enabled boolean default true,
  sms_enabled boolean default false,
  push_enabled boolean default false,
  marketing_enabled boolean default false,
  phone_e164 text,
  timezone text,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  message text,
  body text,
  type text,
  is_read boolean default false,
  data jsonb,
  metadata jsonb,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid,
  user_id uuid,
  channel text,
  provider text,
  destination text,
  status text,
  payload jsonb,
  provider_message_id text,
  error_message text,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  endpoint text unique,
  p256dh text,
  auth text,
  keys jsonb,
  user_agent text,
  is_active boolean default true,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.therapist_learning_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  therapist_id uuid,
  city text,
  intent text,
  score numeric,
  weighted_score numeric,
  impressions integer default 0,
  profile_clicks integer default 0,
  contact_clicks integer default 0,
  ctr numeric,
  contact_rate numeric,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.ranking_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid null references auth.users (id) on delete set null,
  therapist_id uuid null references public.profiles (id) on delete cascade,
  event_name text not null,
  city text null,
  neighborhood text null,
  intent text not null default 'general',
  device_type text null,
  position_in_results integer null,
  recommendation_source text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.imported_profile_data (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  source_url text,
  payload jsonb,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.imported_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  source_url text,
  reviewer_name text,
  review_text text,
  rating integer,
  review_date date,
  source_platform text,
  imported_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  profile_id uuid,
  photo_id uuid,
  target_id uuid,
  item_type text,
  queue_type text,
  source text,
  field_name text,
  priority integer default 0,
  moderation_provider text,
  moderation_reason text,
  admin_reason text,
  snapshot jsonb,
  content_type text,
  status text default 'pending',
  payload jsonb,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.therapist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  profile_id uuid,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.user_suspensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  admin_id uuid,
  type text,
  reason text,
  reason_detail text,
  duration_days integer,
  ends_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.featured_masters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  city text,
  display_order integer default 0,
  is_active boolean default true,
  featured_by uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  reporter_id uuid,
  reported_profile_id uuid,
  reporter_email text,
  category text,
  message text,
  description text,
  status text default 'new',
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  complainant_id uuid references auth.users(id) on delete set null,
  respondent_id uuid references auth.users(id) on delete cascade,
  title text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists public.photo_moderations (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid,
  therapist_id uuid,
  type text,
  url text,
  status text,
  reason text,
  admin_notes text,
  flagged_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.profile_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  type text,
  document_type text,
  storage_path text,
  url text,
  status text default 'pending',
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.provider_travel (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  destination_city text,
  start_date date,
  end_date date,
  is_active boolean default true,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.lifecycle_email_log (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid,
  user_id uuid,
  provider_id uuid,
  provider text,
  recipient_email text,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text,
  suppression_reason text,
  subject text,
  status text,
  metadata jsonb,
  error_message text,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.site_settings (
  id text primary key default 'singleton',
  key text unique,
  value jsonb not null default '{}'::jsonb,
  require_identity_verification boolean not null default true,
  require_text_verification boolean not null default true,
  require_photo_review boolean not null default true,
  require_manual_profile_review boolean not null default true,
  allow_public_profiles boolean not null default true,
  max_free_photos integer not null default 2,
  max_standard_photos integer not null default 6,
  max_pro_photos integer not null default 12,
  max_elite_photos integer not null default 20,
  maintenance_mode boolean not null default false,
  signup_enabled boolean not null default true,
  support_email text not null default 'support@masseurmatch.com',
  billing_email text not null default 'billing@masseurmatch.com',
  legal_email text not null default 'legal@masseurmatch.com',
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.site_settings (id) values ('singleton') on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.therapist_photos enable row level security;
alter table public.profile_reviews enable row level security;
alter table public.identity_verifications enable row level security;
alter table public.text_verifications enable row level security;
alter table public.admin_actions enable row level security;
alter table public.site_settings enable row level security;

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create unique index if not exists idx_profiles_slug on public.profiles(slug) where slug is not null;
create index if not exists idx_profiles_profile_status on public.profiles(profile_status);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_visibility_status on public.profiles(visibility_status);
create index if not exists idx_profiles_subscription_tier on public.profiles(subscription_tier);
create index if not exists idx_profiles_is_suspended on public.profiles(is_suspended) where is_suspended = true;
create index if not exists idx_profiles_is_banned on public.profiles(is_banned) where is_banned = true;
create index if not exists idx_profile_reviews_profile on public.profile_reviews(profile_id, status);
create index if not exists idx_profile_reviews_user on public.profile_reviews(user_id, status);
create index if not exists idx_profile_reviews_pending on public.profile_reviews(status, submitted_at) where status in ('submitted','pending_approval','under_review');
create index if not exists idx_therapist_photos_user on public.therapist_photos(user_id, status);
create index if not exists idx_therapist_photos_profile on public.therapist_photos(profile_id, status);
create index if not exists idx_therapist_photos_pending on public.therapist_photos(status, created_at) where status = 'pending_review';
create index if not exists idx_text_verifications_user on public.text_verifications(user_id, status);
create index if not exists idx_admin_actions_admin on public.admin_actions(admin_id, created_at desc);
create index if not exists idx_admin_actions_target_user on public.admin_actions(target_user_id, created_at desc);
create index if not exists idx_admin_actions_type on public.admin_actions(action_type, created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.users(id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  insert into public.user_roles(user_id, role)
  values (new.id, 'provider')
  on conflict do nothing;

  insert into public.profiles(user_id, email, full_name, status, profile_status)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 'draft', 'draft')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

drop trigger if exists trg_text_verifications_updated_at on public.text_verifications;
create trigger trg_text_verifications_updated_at before update on public.text_verifications for each row execute function public.set_updated_at();

drop trigger if exists trg_therapist_photos_updated_at on public.therapist_photos;
create trigger trg_therapist_photos_updated_at before update on public.therapist_photos for each row execute function public.set_updated_at();

drop trigger if exists trg_profile_reviews_updated_at on public.profile_reviews;
create trigger trg_profile_reviews_updated_at before update on public.profile_reviews for each row execute function public.set_updated_at();

insert into storage.buckets(id,name,public) values ('profile-photos','profile-photos',true) on conflict (id) do nothing;
insert into storage.buckets(id,name,public) values ('identity-documents','identity-documents',false) on conflict (id) do nothing;

-- Admin promotion snippet (run manually by replacing email)
-- insert into public.user_roles(user_id, role)
-- select id, 'admin' from auth.users where email = 'replace-with-admin@domain.com'
-- on conflict do nothing;

-- public_therapists is a VIEW over the profiles table, not a standalone table.
-- RLS is inherited from profiles (which has RLS enabled). Do NOT run
-- ALTER TABLE ... ENABLE ROW SECURITY on this relation — it will fail.
create or replace view public.public_therapists as
  select
    id, slug, city, state, country, display_name, full_name, headline, bio, tagline,
    phone, whatsapp_number, email_address, website, avatar_url, photo_url,
    service_categories, massage_techniques, specialties, languages,
    subscription_tier, profile_status, visibility_status, verification_status,
    moderation_status, incall_price, outcall_price, starting_price,
    available_now, available_now_expires, neighborhood, years_experience,
    height_inches, weight_lb, body_type, gender, latitude, longitude,
    is_featured, updated_at, promotions, pricing_sessions,
    is_verified_identity, is_verified_profile, is_verified_photos,
    lgbtq_affirming, zip_code, map_enabled, location_marker_type, massage_setup,
    payment_methods, booking_platform, booking_url, products_used, products_sold,
    review_count, average_rating, modalities, keyword_slugs, segments,
    view_count, profile_completion_score
  from profiles p
  where role = 'provider' and visibility_status = 'public';

-- Supplemental app-domain tables referenced by API/routes.

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  therapist_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  client_id uuid not null references auth.users(id) on delete cascade,
  therapist_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  service_type text,
  location_type text,
  notes text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  stripe_payment_intent_id text unique,
  provider_transaction_id text,
  provider text,
  amount integer,
  currency text,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,
  title text,
  message text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a_id uuid not null references auth.users(id) on delete cascade,
  participant_b_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.therapist_availability (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users(id) on delete cascade,
  day_of_week integer not null,
  start_time text not null,
  end_time text not null,
  created_at timestamptz not null default timezone('utc', now())
);
alter table public.payment_transactions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.payment_transactions add column if not exists stripe_refund_id text;
alter table public.payment_transactions add column if not exists amount_cents integer;

create table if not exists public.waitlist_rate_limits (
  id            uuid primary key default gen_random_uuid(),
  fingerprint   text not null unique,
  window_start  timestamptz not null default now(),
  request_count integer not null default 1,
  blocked_until timestamptz,
  created_at    timestamptz not null default now()
);

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

create table if not exists public.booking_inquiries (
  id                   uuid primary key default gen_random_uuid(),
  client_name          text,
  client_phone         text,
  client_email         text,
  client_hotel         text,
  service_type         text default 'massage',
  preferred_date       date,
  preferred_time       text,
  duration_minutes     integer default 60,
  message              text,
  source               text default 'website' check (source in ('website','sms','whatsapp','direct')),
  therapist_id         uuid references public.profiles(id) on delete set null,
  status               text not null default 'new' check (status in ('new','checking','pending_approval','approved','denied','completed','cancelled')),
  intelligence_status  text not null default 'pending' check (intelligence_status in ('pending','running','clean','flagged','inconclusive')),
  intelligence_report  jsonb default '{}',
  ai_conversation      jsonb default '[]',
  confirmed_date       date,
  confirmed_time       text,
  appointment_id       uuid references public.appointments(id) on delete set null,
  sheets_row_id        text,
  admin_notes          text,
  reviewed_by          uuid references auth.users(id) on delete set null,
  reviewed_at          timestamptz,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create table if not exists public.sms_profiles (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references public.profiles(id) on delete cascade,
  ready_to_reply       boolean not null default false,
  availability_mode    text not null default 'in_city' check (availability_mode in ('in_city','traveling','arrival_window','unavailable')),
  arrival_date         date,
  departure_date       date,
  pricing_60           text,
  pricing_90           text,
  pricing_couples      text,
  outcall_available    boolean not null default false,
  couples_available    boolean not null default false,
  outcall_area         text,
  alert_phone          text,
  custom_instructions  text,
  twilio_number        text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  unique(profile_id)
);

create table if not exists public.sms_logs (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid references public.sms_profiles(id) on delete set null,
  from_number         text not null,
  to_number           text not null,
  direction           text not null check (direction in ('inbound','outbound')),
  body                text not null,
  twilio_sid          text,
  intent              text,
  status              text default 'received' check (status in ('received','queued','sent','delivered','failed','undelivered')),
  is_manual           boolean not null default false,
  booking_inquiry_id  uuid references public.booking_inquiries(id) on delete set null,
  created_at          timestamptz default now()
);

create table if not exists public.sms_follow_up_alerts (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid references public.sms_profiles(id) on delete cascade,
  client_phone     text not null,
  our_phone        text not null,
  last_outbound_at timestamptz not null,
  last_inbound_at  timestamptz,
  resolved_at      timestamptz,
  resolved_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz default now(),
  unique(profile_id, client_phone, our_phone)
);

-- Tables added to satisfy validate:db-contract

create table if not exists moderation_queue (
  id                   uuid primary key default gen_random_uuid(),
  therapist_profile_id uuid,
  content_type         text not null,
  content_id           uuid,
  status               text not null default 'pending',
  notes                text,
  profile_id           uuid,
  user_id              uuid,
  target_id            uuid,
  item_type            text,
  source               text,
  field_name           text,
  priority             integer default 0,
  moderation_provider  text,
  moderation_reason    text,
  admin_reason         text,
  snapshot             jsonb,
  ai_response          jsonb,
  resolved_by          uuid,
  resolved_at          timestamptz,
  reviewed_at          timestamptz,
  reviewed_by          uuid,
  photo_id             uuid,
  queue_type           text,
  payload              jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists payment_transactions (
  id                      uuid primary key default gen_random_uuid(),
  appointment_id          uuid,
  user_id                 uuid,
  therapist_id            uuid,
  amount_cents            integer,
  currency                text default 'USD',
  status                  text default 'pending',
  provider                text,
  provider_transaction_id text,
  stripe_refund_id        text,
  metadata                jsonb,
  created_at              timestamptz not null default now()
);

create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  therapist_id uuid,
  profile_id   uuid,
  starts_at    timestamptz,
  ends_at      timestamptz,
  status       text not null default 'pending',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists text_verifications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid,
  profile_id       uuid,
  status           text not null default 'pending',
  code             text,
  submitted_text   text,
  reviewed_by      uuid,
  reviewed_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists profile_reviews (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid,
  user_id      uuid,
  status       text not null default 'pending_approval',
  submitted_at timestamptz,
  reviewed_at  timestamptz,
  reviewed_by  uuid,
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists therapist_photos (
  id                    uuid primary key default gen_random_uuid(),
  therapist_profile_id  uuid not null,
  storage_path          text not null,
  public_url            text,
  alt_text              text,
  is_primary            boolean not null default false,
  approval_status       text not null default 'pending',
  sort_order            integer not null default 0,
  user_id               uuid,
  profile_id            uuid,
  main_profile_id       uuid,
  photo_type            text default 'gallery',
  status                text default 'pending_review',
  rejection_reason      text,
  mime_type             text,
  file_size             integer,
  reviewed_at           timestamptz,
  reviewed_by           uuid,
  moderation_notes      text,
  moderation_confidence numeric,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists demand_scores (
  id                  uuid primary key default gen_random_uuid(),
  city                text not null,
  state               text not null,
  neighborhood        text,
  score               integer not null,
  trend               text not null default 'stable',
  search_volume_index integer not null default 0,
  competition_index   integer not null default 0,
  week_start          date not null,
  created_at          timestamptz not null default now()
);

create table if not exists admin_actions (
  id                uuid primary key default gen_random_uuid(),
  actor_profile_id  uuid,
  admin_id          uuid,
  target_table      text not null,
  target_id         uuid,
  target_user_id    uuid,
  target_profile_id uuid,
  action            text not null,
  action_type       text,
  reason            text,
  before_data       jsonb,
  after_data        jsonb,
  metadata          jsonb,
  created_at        timestamptz not null default now()
);
