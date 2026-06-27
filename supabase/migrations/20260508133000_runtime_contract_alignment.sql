-- MasseurMatch runtime contract alignment
-- Additive, no-drop migration for project ijsdpozjfjjufjsoexod.
-- Purpose: make the live Supabase schema compatible with the current Next.js repository.

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles compatibility
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists status text default 'pending',
  add column if not exists is_active boolean default true,
  add column if not exists tier text,
  add column if not exists neighborhood_name text,
  add column if not exists tagline text,
  add column if not exists languages_spoken text[] default '{}',
  add column if not exists education text,
  add column if not exists certifications text,
  add column if not exists pricing_sessions jsonb,
  add column if not exists add_ons jsonb,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists is_verified_phone boolean default false,
  add column if not exists is_verified_identity boolean default false,
  add column if not exists is_verified_profile boolean default false,
  add column if not exists is_verified_photos boolean default false,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid,
  add column if not exists submitted_at timestamptz,
  add column if not exists moderation_notes text,
  add column if not exists rejection_reason text,
  add column if not exists review_count integer not null default 0,
  add column if not exists average_rating numeric(3,2) not null default 0,
  add column if not exists stripe_verification_session_id text,
  add column if not exists suspension_reason text,
  add column if not exists banned_reason text;

update public.profiles
set
  user_id = coalesce(user_id, id),
  email_address = coalesce(email_address, email),
  tier = coalesce(tier, subscription_tier, _tier, 'free'),
  subscription_tier = coalesce(subscription_tier, _tier, tier, 'free'),
  _tier = coalesce(_tier, subscription_tier, tier, 'free'),
  status = coalesce(status, profile_status, 'pending'),
  profile_status = coalesce(profile_status, 'draft'),
  visibility_status = coalesce(visibility_status, 'private'),
  is_active = coalesce(is_active, true),
  languages_spoken = case
    when languages_spoken is null or array_length(languages_spoken, 1) is null then coalesce(languages, '{}')
    else languages_spoken
  end,
  starting_price = coalesce(starting_price, incall_price, outcall_price)
where true;

create or replace function public.sync_profiles_runtime_columns()
returns trigger
language plpgsql
as $$
begin
  new.user_id := coalesce(new.user_id, new.id);
  new.email_address := coalesce(new.email_address, new.email);
  new.subscription_tier := coalesce(new.subscription_tier, new._tier, new.tier, 'free');
  new._tier := coalesce(new._tier, new.subscription_tier, new.tier, 'free');
  new.tier := coalesce(new.tier, new.subscription_tier, new._tier, 'free');
  new.status := coalesce(new.status, new.profile_status, 'pending');
  new.profile_status := coalesce(new.profile_status, 'draft');
  new.visibility_status := coalesce(new.visibility_status, 'private');
  new.is_active := coalesce(new.is_active, true);
  new.starting_price := coalesce(new.starting_price, new.incall_price, new.outcall_price);
  return new;
end;
$$;

drop trigger if exists trg_sync_profiles_runtime_columns on public.profiles;
create trigger trg_sync_profiles_runtime_columns
before insert or update on public.profiles
for each row execute function public.sync_profiles_runtime_columns();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Legacy public.users sync used by auth helper.
-- -----------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'therapist',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

insert into public.users (id, email, full_name, role, created_at, updated_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(coalesce(u.email, ''), '@', 1), 'User'),
  coalesce(p.role, 'therapist'),
  coalesce(u.created_at, timezone('utc', now())),
  timezone('utc', now())
from auth.users u
left join public.profiles p on p.user_id = u.id or p.id = u.id
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  updated_at = timezone('utc', now());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'therapist')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = timezone('utc', now());

  insert into public.profiles (
    id,
    user_id,
    email,
    email_address,
    full_name,
    display_name,
    role,
    status,
    profile_status,
    visibility_status,
    subscription_tier,
    _tier,
    tier
  )
  values (
    new.id,
    new.id,
    new.email,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'User'),
    'therapist',
    'pending',
    'draft',
    'private',
    'free',
    'free',
    'free'
  )
  on conflict (id) do update set
    user_id = excluded.user_id,
    email = coalesce(public.profiles.email, excluded.email),
    email_address = coalesce(public.profiles.email_address, excluded.email_address),
    updated_at = timezone('utc', now());

  insert into public.user_roles (user_id, role)
  values (new.id, 'provider')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Tables used by API routes that are missing or partially present in production.
-- -----------------------------------------------------------------------------

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'submitted',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  admin_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profile_reviews
  add column if not exists admin_notes text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists submitted_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create unique index if not exists profile_reviews_profile_id_unique on public.profile_reviews(profile_id);
create index if not exists idx_profile_reviews_status on public.profile_reviews(status, submitted_at desc);

drop trigger if exists trg_profile_reviews_updated_at on public.profile_reviews;
create trigger trg_profile_reviews_updated_at
before update on public.profile_reviews
for each row execute function public.set_updated_at();

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
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_profile_photos_updated_at on public.profile_photos;
create trigger trg_profile_photos_updated_at
before update on public.profile_photos
for each row execute function public.set_updated_at();

create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  stripe_session_id text unique,
  provider text default 'stripe',
  status text not null default 'pending',
  last_error text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.identity_verifications
  add column if not exists stripe_session_id text,
  add column if not exists last_error text,
  add column if not exists metadata jsonb,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create index if not exists idx_identity_verifications_user_status on public.identity_verifications(user_id, status);

drop trigger if exists trg_identity_verifications_updated_at on public.identity_verifications;
create trigger trg_identity_verifications_updated_at
before update on public.identity_verifications
for each row execute function public.set_updated_at();

create table if not exists public.text_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  code text,
  submitted_text text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_text_verifications_user_status on public.text_verifications(user_id, status);

drop trigger if exists trg_text_verifications_updated_at on public.text_verifications;
create trigger trg_text_verifications_updated_at
before update on public.text_verifications
for each row execute function public.set_updated_at();

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
  created_at timestamptz not null default timezone('utc', now())
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
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  therapist_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  preferred_contact text,
  message text,
  status text default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.contact_inquiries
  add column if not exists client_name text,
  add column if not exists client_phone text,
  add column if not exists preferred_contact text,
  add column if not exists profile_id uuid,
  add column if not exists therapist_id uuid;

create index if not exists idx_contact_inquiries_profile_id on public.contact_inquiries(profile_id);
create index if not exists idx_contact_inquiries_therapist_id on public.contact_inquiries(therapist_id);
create index if not exists idx_contact_inquiries_client_email on public.contact_inquiries(client_email);

create table if not exists public.contact_preferences (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid,
  profile_id uuid references public.profiles(id) on delete cascade,
  allow_phone boolean default true,
  allow_email boolean default true,
  allow_whatsapp boolean default true,
  auto_reply_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  therapist_id uuid,
  client_id uuid references auth.users(id) on delete set null,
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
  helpful_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.reviews
  add column if not exists client_id uuid,
  add column if not exists profile_id uuid,
  add column if not exists content text,
  add column if not exists helpful_count integer not null default 0,
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists is_public boolean default false,
  add column if not exists is_verified boolean default false;

create index if not exists idx_reviews_therapist_public on public.reviews(therapist_id, is_public, created_at desc);
create index if not exists idx_reviews_profile_public on public.reviews(profile_id, is_public, created_at desc);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  message text,
  body text,
  type text,
  is_read boolean default false,
  data jsonb,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  query text,
  filters jsonb,
  results_count integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.therapists (
  id uuid primary key,
  user_id uuid,
  slug text unique,
  display_name text,
  contact_email text,
  city text,
  state text,
  photo_url text,
  status text default 'approved',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.therapists
  add column if not exists user_id uuid,
  add column if not exists contact_email text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists photo_url text,
  add column if not exists status text default 'approved',
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

insert into public.therapists (id, user_id, slug, display_name, contact_email, city, state, status, created_at, updated_at)
select
  p.id,
  p.user_id,
  p.slug,
  coalesce(p.display_name, p.full_name, 'Therapist'),
  coalesce(p.email_address, p.email),
  p.city,
  p.state,
  case when p.profile_status = 'approved' or p.visibility_status = 'public' then 'approved' else coalesce(p.profile_status, 'pending') end,
  coalesce(p.created_at, timezone('utc', now())),
  timezone('utc', now())
from public.profiles p
on conflict (id) do update set
  user_id = excluded.user_id,
  slug = coalesce(public.therapists.slug, excluded.slug),
  display_name = coalesce(excluded.display_name, public.therapists.display_name),
  contact_email = coalesce(excluded.contact_email, public.therapists.contact_email),
  city = coalesce(excluded.city, public.therapists.city),
  state = coalesce(excluded.state, public.therapists.state),
  updated_at = timezone('utc', now());

drop trigger if exists trg_therapists_updated_at on public.therapists;
create trigger trg_therapists_updated_at
before update on public.therapists
for each row execute function public.set_updated_at();

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  state text,
  state_code text,
  description text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  hero text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.cities
  add column if not exists state_code text,
  add column if not exists description text,
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7),
  add column if not exists hero text;

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text,
  slug text unique,
  label text,
  category text,
  created_at timestamptz not null default timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- Therapist profiles/photos bridge for the newer separated marketplace schema.
-- -----------------------------------------------------------------------------

alter table public.therapist_profiles
  add column if not exists user_id uuid,
  add column if not exists contact_email text,
  add column if not exists profile_id uuid;

update public.therapist_profiles tp
set
  user_id = coalesce(tp.user_id, p.user_id),
  contact_email = coalesce(tp.contact_email, p.email_address, p.email),
  display_name = coalesce(tp.display_name, p.display_name, p.full_name, 'Therapist'),
  city = coalesce(tp.city, p.city, 'Unlisted')
from public.profiles p
where tp.profile_id = p.id;

create or replace function public.ensure_therapist_profile_for_profile(p_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tp_id uuid;
  v_profile record;
begin
  if p_profile_id is null then
    return null;
  end if;

  select id into v_tp_id from public.therapist_profiles where profile_id = p_profile_id limit 1;
  if v_tp_id is not null then
    return v_tp_id;
  end if;

  select * into v_profile from public.profiles where id = p_profile_id limit 1;
  if not found then
    return null;
  end if;

  insert into public.therapist_profiles (
    profile_id,
    user_id,
    slug,
    display_name,
    headline,
    bio,
    phone,
    contact_email,
    city,
    state,
    neighborhood,
    offers_incall,
    offers_outcall,
    is_published,
    verification_status,
    moderation_status
  )
  values (
    v_profile.id,
    v_profile.user_id,
    coalesce(v_profile.slug, v_profile.id::text),
    coalesce(v_profile.display_name, v_profile.full_name, 'Therapist'),
    v_profile.headline,
    v_profile.bio,
    v_profile.phone,
    coalesce(v_profile.email_address, v_profile.email),
    coalesce(v_profile.city, 'Unlisted'),
    v_profile.state,
    coalesce(v_profile.neighborhood_name, v_profile.neighborhood),
    coalesce(v_profile.offers_incall, v_profile.incall_price is not null, false),
    coalesce(v_profile.offers_outcall, v_profile.outcall_price is not null, false),
    coalesce(v_profile.visibility_status = 'public' and v_profile.profile_status = 'approved', false),
    coalesce(v_profile.verification_status, 'unverified'),
    case when v_profile.profile_status = 'approved' then 'approved' else 'draft' end
  )
  returning id into v_tp_id;

  return v_tp_id;
end;
$$;

alter table public.therapist_photos
  add column if not exists therapist_profile_id uuid,
  add column if not exists is_primary boolean default false,
  add column if not exists approval_status text default 'pending',
  add column if not exists profile_id uuid,
  add column if not exists user_id uuid,
  add column if not exists photo_type text default 'gallery',
  add column if not exists status text default 'pending_review',
  add column if not exists rejection_reason text,
  add column if not exists mime_type text,
  add column if not exists file_size integer;

update public.therapist_photos tph
set
  profile_id = coalesce(tph.profile_id, tp.profile_id),
  user_id = coalesce(tph.user_id, tp.user_id),
  photo_type = coalesce(tph.photo_type, case when tph.is_primary then 'profile' else 'gallery' end),
  status = coalesce(tph.status, case tph.approval_status when 'approved' then 'approved' when 'rejected' then 'rejected' else 'pending_review' end)
from public.therapist_profiles tp
where tph.therapist_profile_id = tp.id;

create or replace function public.sync_therapist_photo_runtime_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_tp_id uuid;
  v_user_id uuid;
begin
  if new.profile_id is null and new.user_id is not null then
    select id into v_profile_id from public.profiles where user_id = new.user_id limit 1;
    new.profile_id := v_profile_id;
  end if;

  if new.therapist_profile_id is null and new.profile_id is not null then
    new.therapist_profile_id := public.ensure_therapist_profile_for_profile(new.profile_id);
  end if;

  if new.user_id is null and new.profile_id is not null then
    select user_id into v_user_id from public.profiles where id = new.profile_id limit 1;
    new.user_id := v_user_id;
  end if;

  new.photo_type := coalesce(new.photo_type, case when coalesce(new.is_primary, false) then 'profile' else 'gallery' end, 'gallery');
  new.status := coalesce(new.status, case new.approval_status when 'approved' then 'approved' when 'rejected' then 'rejected' else 'pending_review' end);
  new.approval_status := coalesce(
    new.approval_status,
    case new.status when 'approved' then 'approved' when 'rejected' then 'rejected' else 'pending' end
  );
  new.is_primary := coalesce(new.is_primary, new.photo_type = 'profile', false);
  return new;
end;
$$;

drop trigger if exists trg_sync_therapist_photo_runtime_columns on public.therapist_photos;
create trigger trg_sync_therapist_photo_runtime_columns
before insert or update on public.therapist_photos
for each row execute function public.sync_therapist_photo_runtime_columns();

drop trigger if exists trg_therapist_photos_updated_at on public.therapist_photos;
create trigger trg_therapist_photos_updated_at
before update on public.therapist_photos
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Moderation queue compatibility
-- -----------------------------------------------------------------------------

alter table public.moderation_queue
  add column if not exists user_id uuid,
  add column if not exists profile_id uuid,
  add column if not exists therapist_profile_id uuid,
  add column if not exists photo_id uuid,
  add column if not exists target_id uuid,
  add column if not exists item_type text,
  add column if not exists queue_type text,
  add column if not exists source text,
  add column if not exists field_name text,
  add column if not exists priority integer default 0,
  add column if not exists moderation_provider text,
  add column if not exists moderation_reason text,
  add column if not exists ai_response jsonb,
  add column if not exists admin_reason text,
  add column if not exists snapshot jsonb,
  add column if not exists payload jsonb,
  add column if not exists resolved_by uuid,
  add column if not exists resolved_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

drop trigger if exists trg_moderation_queue_updated_at on public.moderation_queue;
create trigger trg_moderation_queue_updated_at
before update on public.moderation_queue
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Storage buckets used by upload routes.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('profile-photos', 'profile-photos', true),
  ('therapist-photos', 'therapist-photos', true),
  ('identity-documents', 'identity-documents', false)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- RLS hardening and minimal public policies.
-- -----------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;
alter table public.profile_reviews enable row level security;
alter table public.profile_photos enable row level security;
alter table public.therapist_photos enable row level security;
alter table public.identity_verifications enable row level security;
alter table public.text_verifications enable row level security;
alter table public.lifecycle_email_queue enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.contact_preferences enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.search_history enable row level security;
alter table public.moderation_queue enable row level security;
alter table public.therapists enable row level security;

-- Lock down legacy mm schema tables that were flagged with RLS disabled.
do $$
begin
  if to_regclass('mm.cities') is not null then alter table mm.cities enable row level security; end if;
  if to_regclass('mm.therapists') is not null then alter table mm.therapists enable row level security; end if;
  if to_regclass('mm.therapist_photos') is not null then alter table mm.therapist_photos enable row level security; end if;
  if to_regclass('mm.services') is not null then alter table mm.services enable row level security; end if;
  if to_regclass('mm.therapist_services') is not null then alter table mm.therapist_services enable row level security; end if;
  if to_regclass('mm.neighborhoods') is not null then alter table mm.neighborhoods enable row level security; end if;
  if to_regclass('mm.therapist_neighborhoods') is not null then alter table mm.therapist_neighborhoods enable row level security; end if;
  if to_regclass('mm.therapist_visibility') is not null then alter table mm.therapist_visibility enable row level security; end if;
end $$;

-- Recreate safe public policies. Service role bypasses RLS for server routes.
drop policy if exists profiles_public_read_approved on public.profiles;
create policy profiles_public_read_approved
on public.profiles
for select
using (
  visibility_status = 'public'
  and profile_status in ('approved')
  and coalesce(is_suspended, false) = false
  and coalesce(is_banned, false) = false
);

drop policy if exists profiles_owner_read on public.profiles;
create policy profiles_owner_read
on public.profiles
for select
to authenticated
using (user_id = auth.uid() or id = auth.uid());

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update
on public.profiles
for update
to authenticated
using (user_id = auth.uid() or id = auth.uid())
with check (user_id = auth.uid() or id = auth.uid());

drop policy if exists therapist_photos_public_read_approved on public.therapist_photos;
create policy therapist_photos_public_read_approved
on public.therapist_photos
for select
using (status = 'approved' or approval_status = 'approved');

drop policy if exists profile_photos_public_read_approved on public.profile_photos;
create policy profile_photos_public_read_approved
on public.profile_photos
for select
using (moderation_status = 'approved');

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read
on public.reviews
for select
using (coalesce(is_public, false) = true);

drop policy if exists reviews_insert_authenticated on public.reviews;
create policy reviews_insert_authenticated
on public.reviews
for insert
to authenticated
with check (true);

drop policy if exists contact_inquiries_insert_public on public.contact_inquiries;
create policy contact_inquiries_insert_public
on public.contact_inquiries
for insert
with check (true);

-- Grants for PostgREST roles.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles to anon, authenticated;
grant select on public.therapist_profiles to anon, authenticated;
grant select on public.therapist_photos to anon, authenticated;
grant select on public.profile_photos to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert on public.contact_inquiries to anon, authenticated;
grant insert on public.reviews to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

commit;
