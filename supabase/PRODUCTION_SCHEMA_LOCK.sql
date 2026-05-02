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
  add column if not exists website text,
  add column if not exists booking_link text,
  add column if not exists specialties text[] default '{}',
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
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists admin_notes text,
  add column if not exists moderation_notes text,
  add column if not exists last_active_at timestamptz;

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check check (status in ('draft','pending','pending_approval','submitted','under_review','approved','suspended','rejected','changes_requested'));
alter table public.profiles drop constraint if exists profiles_profile_status_check;
alter table public.profiles add constraint profiles_profile_status_check check (profile_status in ('draft','pending','pending_approval','submitted','under_review','approved','suspended','rejected','changes_requested'));
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
  moderation_status text default 'pending',
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.therapist_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  storage_path text,
  public_url text,
  photo_type text not null default 'gallery' check (photo_type in ('profile','gallery')),
  status text not null default 'draft' check (status in ('draft','pending_review','approved','rejected','removed')),
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
  action_type text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  target_profile_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  target_user_id uuid,
  target_profile_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.lifecycle_email_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  recipient_email text,
  subject text,
  status text default 'pending',
  body_html text,
  body_text text,
  scheduled_for timestamptz,
  idempotency_key text unique,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  status text default 'new',
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
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
