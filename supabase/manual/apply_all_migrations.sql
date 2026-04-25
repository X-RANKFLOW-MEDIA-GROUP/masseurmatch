-- AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
-- Generated at: 2026-04-15T06:43:38.418Z
-- Source directory: supabase/migrations
-- Total migrations included: 21
--
-- Usage in Supabase Dashboard SQL Editor:
-- 1) Open SQL Editor
-- 2) Paste this file contents
-- 3) Run once in a safe environment (prefer staging first)
--
BEGIN;
-- ============================================================
-- MIGRATION: 20260305063407_0247d14d-039a-40a1-ae85-e18fa9ef89d1.sql
-- ============================================================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE id = '94cf1601-fb7d-4895-a0b3-ead59e29b160'
ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRATION: 20260314000000_directory_schema.sql
-- ============================================================
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'therapist' check (role in ('admin', 'therapist')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  state text not null,
  state_code text not null,
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  hero text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  category text not null check (category in ('modality', 'identity', 'intent')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  slug text not null unique,
  display_name text not null,
  city_id uuid not null references public.cities (id) on delete restrict,
  state text not null,
  bio text not null,
  photo_url text not null,
  gallery jsonb not null default '[]'::jsonb,
  modalities text[] not null default '{}'::text[],
  keyword_slugs text[] not null default '{}'::text[],
  languages text[] not null default '{}'::text[],
  contact_email text not null,
  phone text not null,
  website text not null,
  incall boolean not null default true,
  outcall boolean not null default false,
  price_range text not null,
  gay_friendly boolean not null default false,
  inclusive boolean not null default true,
  segments text[] not null default '{}'::text[],
  latitude double precision not null,
  longitude double precision not null,
  tier text not null default 'free' check (tier in ('free', 'pro', 'featured')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'suspended')),
  view_count integer not null default 0,
  profile_completeness integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'removed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  seo_description text not null,
  content text not null,
  tags text[] not null default '{}'::text[],
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro', 'featured')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_cities_name on public.cities (name);
create index if not exists idx_keywords_category on public.keywords (category);
create index if not exists idx_therapists_city_id on public.therapists (city_id);
create index if not exists idx_therapists_status on public.therapists (status);
create index if not exists idx_therapists_tier on public.therapists (tier);
create index if not exists idx_therapists_user_id on public.therapists (user_id);
create index if not exists idx_therapists_view_count on public.therapists (view_count desc);
create index if not exists idx_reviews_therapist_id on public.reviews (therapist_id);
create index if not exists idx_reviews_status on public.reviews (status);
create index if not exists idx_blog_posts_published_at on public.blog_posts (published_at desc);
create index if not exists idx_subscriptions_status on public.subscriptions (status);
create index if not exists idx_therapists_modalities on public.therapists using gin (modalities);
create index if not exists idx_therapists_keyword_slugs on public.therapists using gin (keyword_slugs);
create index if not exists idx_therapists_segments on public.therapists using gin (segments);

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists trg_cities_set_updated_at on public.cities;
create trigger trg_cities_set_updated_at before update on public.cities for each row execute function public.set_updated_at();

drop trigger if exists trg_keywords_set_updated_at on public.keywords;
create trigger trg_keywords_set_updated_at before update on public.keywords for each row execute function public.set_updated_at();

drop trigger if exists trg_therapists_set_updated_at on public.therapists;
create trigger trg_therapists_set_updated_at before update on public.therapists for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_set_updated_at on public.reviews;
create trigger trg_reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_set_updated_at on public.blog_posts;
create trigger trg_blog_posts_set_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_set_updated_at on public.subscriptions;
create trigger trg_subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.handle_auth_user()
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
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data ->> 'role', 'therapist')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_auth_user();

alter table public.users enable row level security;
alter table public.cities enable row level security;
alter table public.keywords enable row level security;
alter table public.therapists enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin" on public.users for select using (id = auth.uid() or public.is_admin());
drop policy if exists "users_insert_self_or_admin" on public.users;
create policy "users_insert_self_or_admin" on public.users for insert with check (id = auth.uid() or public.is_admin());
drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin" on public.users for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin" on public.users for delete using (public.is_admin());

drop policy if exists "cities_public_read" on public.cities;
create policy "cities_public_read" on public.cities for select using (true);
drop policy if exists "cities_admin_manage" on public.cities;
create policy "cities_admin_manage" on public.cities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "keywords_public_read" on public.keywords;
create policy "keywords_public_read" on public.keywords for select using (true);
drop policy if exists "keywords_admin_manage" on public.keywords;
create policy "keywords_admin_manage" on public.keywords for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "therapists_public_read_approved" on public.therapists;
create policy "therapists_public_read_approved" on public.therapists for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
drop policy if exists "therapists_insert_self_or_admin" on public.therapists;
create policy "therapists_insert_self_or_admin" on public.therapists for insert with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "therapists_update_self_or_admin" on public.therapists;
create policy "therapists_update_self_or_admin" on public.therapists for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "therapists_delete_admin" on public.therapists;
create policy "therapists_delete_admin" on public.therapists for delete using (public.is_admin());

drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved" on public.reviews for select using (status = 'approved' or public.is_admin());
drop policy if exists "reviews_admin_manage" on public.reviews;
create policy "reviews_admin_manage" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts for select using (true);
drop policy if exists "blog_posts_admin_manage" on public.blog_posts;
create policy "blog_posts_admin_manage" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscriptions_select_self_or_admin" on public.subscriptions;
create policy "subscriptions_select_self_or_admin" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "subscriptions_insert_self_or_admin" on public.subscriptions;
create policy "subscriptions_insert_self_or_admin" on public.subscriptions for insert with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "subscriptions_update_self_or_admin" on public.subscriptions;
create policy "subscriptions_update_self_or_admin" on public.subscriptions for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('therapist-photos', 'therapist-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can read therapist photos" on storage.objects;
create policy "Public can read therapist photos" on storage.objects for select using (bucket_id = 'therapist-photos');
drop policy if exists "Authenticated can upload therapist photos" on storage.objects;
create policy "Authenticated can upload therapist photos" on storage.objects for insert to authenticated with check (bucket_id = 'therapist-photos');
drop policy if exists "Authenticated can update therapist photos" on storage.objects;
create policy "Authenticated can update therapist photos" on storage.objects for update to authenticated using (bucket_id = 'therapist-photos') with check (bucket_id = 'therapist-photos');
drop policy if exists "Authenticated can delete therapist photos" on storage.objects;
create policy "Authenticated can delete therapist photos" on storage.objects for delete to authenticated using (bucket_id = 'therapist-photos');

-- ============================================================
-- MIGRATION: 20260315113000_9f1e3a44-5f4c-4d6a-a1a8-93bc1ec5b9f3.sql
-- ============================================================
-- Lifecycle email system foundation: preferences, suppression, queue, logs, and policy RPCs

-- 1) Audience-level marketing preferences (explicit user setting)
CREATE TABLE IF NOT EXISTS public.marketing_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  newsletter_opt_in boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text,
  updated_by text
);

ALTER TABLE public.marketing_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own marketing preferences"
  ON public.marketing_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing preferences"
  ON public.marketing_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing preferences"
  ON public.marketing_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage marketing preferences"
  ON public.marketing_preferences FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- 2) Suppression table for bounces/complaints/manual unsubscribes
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reason text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, reason, is_active)
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email_active
  ON public.email_suppressions (email, is_active);

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suppressions"
  ON public.email_suppressions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- 3) Provider event stream (for segmentation and complaint monitoring)
CREATE TABLE IF NOT EXISTS public.email_provider_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'resend',
  provider_event_id text,
  recipient_email text,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_email_provider_events_type_time
  ON public.email_provider_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_provider_events_recipient
  ON public.email_provider_events (recipient_email, created_at DESC);

ALTER TABLE public.email_provider_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read provider events"
  ON public.email_provider_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert provider events"
  ON public.email_provider_events FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));


-- 4) Lifecycle queue and send log
CREATE TABLE IF NOT EXISTS public.lifecycle_email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email text,
  recipient_name text,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text NOT NULL CHECK (send_category IN ('marketing', 'transactional')),
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  from_address text,
  reply_to text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'suppressed', 'failed', 'skipped')),
  suppression_reason text,
  provider_id text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 2,
  idempotency_key text,
  processing_started_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lifecycle_email_queue_recipient_check CHECK (user_id IS NOT NULL OR recipient_email IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lifecycle_email_queue_idempotency
  ON public.lifecycle_email_queue (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_queue_pending
  ON public.lifecycle_email_queue (status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_queue_user
  ON public.lifecycle_email_queue (user_id, created_at DESC);

ALTER TABLE public.lifecycle_email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lifecycle queue"
  ON public.lifecycle_email_queue FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


CREATE TABLE IF NOT EXISTS public.lifecycle_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.lifecycle_email_queue(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text NOT NULL CHECK (send_category IN ('marketing', 'transactional')),
  status text NOT NULL CHECK (status IN ('sent', 'suppressed', 'failed', 'skipped')),
  suppression_reason text,
  provider text NOT NULL DEFAULT 'resend',
  provider_id text,
  subject text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_log_recipient_time
  ON public.lifecycle_email_log (recipient_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_log_category_time
  ON public.lifecycle_email_log (send_category, created_at DESC);

ALTER TABLE public.lifecycle_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read lifecycle log"
  ON public.lifecycle_email_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- 5) Helper trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_now()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketing_preferences_updated_at ON public.marketing_preferences;
CREATE TRIGGER trg_marketing_preferences_updated_at
BEFORE UPDATE ON public.marketing_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_now();

DROP TRIGGER IF EXISTS trg_email_suppressions_updated_at ON public.email_suppressions;
CREATE TRIGGER trg_email_suppressions_updated_at
BEFORE UPDATE ON public.email_suppressions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_now();

DROP TRIGGER IF EXISTS trg_lifecycle_email_queue_updated_at ON public.lifecycle_email_queue;
CREATE TRIGGER trg_lifecycle_email_queue_updated_at
BEFORE UPDATE ON public.lifecycle_email_queue
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_now();


-- 6) Marketing policy rules
CREATE OR REPLACE FUNCTION public.is_major_us_holiday(p_date date)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  y int := EXTRACT(YEAR FROM p_date);
  thanksgiving date;
BEGIN
  -- New Year (Jan 1)
  IF EXTRACT(MONTH FROM p_date) = 1 AND EXTRACT(DAY FROM p_date) = 1 THEN
    RETURN true;
  END IF;

  -- Christmas (Dec 25)
  IF EXTRACT(MONTH FROM p_date) = 12 AND EXTRACT(DAY FROM p_date) = 25 THEN
    RETURN true;
  END IF;

  -- Thanksgiving (4th Thursday of November)
  thanksgiving := make_date(y, 11, 1)
    + ((11 - EXTRACT(DOW FROM make_date(y, 11, 1))::int) % 7)
    + 21;

  RETURN p_date = thanksgiving;
END;
$$;


CREATE OR REPLACE FUNCTION public.can_send_marketing_email(
  p_user_id uuid,
  p_email text,
  p_send_time timestamptz DEFAULT now()
)
RETURNS TABLE (eligible boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_opt_in boolean;
  v_last_marketing timestamptz;
  v_monthly_count int;
  v_tx_same_day_count int;
  v_sent_30d int;
  v_complaints_30d int;
BEGIN
  IF v_email IS NULL OR v_email = '' THEN
    RETURN QUERY SELECT false, 'missing_email';
    RETURN;
  END IF;

  -- Never market to role-based inboxes
  IF split_part(v_email, '@', 1) ~* '^(info|admin|support)$' THEN
    RETURN QUERY SELECT false, 'role_based_address';
    RETURN;
  END IF;

  -- Explicit suppressions
  IF EXISTS (
    SELECT 1
    FROM public.email_suppressions s
    WHERE lower(s.email) = v_email
      AND s.is_active = true
  ) THEN
    RETURN QUERY SELECT false, 'suppressed_address';
    RETURN;
  END IF;

  -- Newsletter subscriber hard unsubscribe
  IF EXISTS (
    SELECT 1
    FROM public.newsletter_subscribers n
    WHERE lower(n.email) = v_email
      AND (n.is_active = false OR n.unsubscribed_at IS NOT NULL)
  ) THEN
    RETURN QUERY SELECT false, 'newsletter_unsubscribed';
    RETURN;
  END IF;

  -- User-level marketing opt-in (default true for legacy users with no row)
  IF p_user_id IS NOT NULL THEN
    SELECT mp.marketing_opt_in
    INTO v_opt_in
    FROM public.marketing_preferences mp
    WHERE mp.user_id = p_user_id;

    IF COALESCE(v_opt_in, true) = false THEN
      RETURN QUERY SELECT false, 'user_opted_out';
      RETURN;
    END IF;
  END IF;

  -- Holiday suppression
  IF public.is_major_us_holiday((p_send_time AT TIME ZONE 'America/New_York')::date) THEN
    RETURN QUERY SELECT false, 'major_holiday_blackout';
    RETURN;
  END IF;

  -- 24-hour cooldown between marketing emails
  SELECT max(l.created_at)
  INTO v_last_marketing
  FROM public.lifecycle_email_log l
  WHERE lower(l.recipient_email) = v_email
    AND l.send_category = 'marketing'
    AND l.status = 'sent';

  IF v_last_marketing IS NOT NULL AND p_send_time < v_last_marketing + interval '24 hours' THEN
    RETURN QUERY SELECT false, 'marketing_cooldown_24h';
    RETURN;
  END IF;

  -- Never send marketing same day as transactional
  SELECT count(*)
  INTO v_tx_same_day_count
  FROM public.lifecycle_email_log l
  WHERE lower(l.recipient_email) = v_email
    AND l.send_category = 'transactional'
    AND l.status = 'sent'
    AND (l.created_at AT TIME ZONE 'UTC')::date = (p_send_time AT TIME ZONE 'UTC')::date;

  IF v_tx_same_day_count > 0 THEN
    RETURN QUERY SELECT false, 'same_day_transactional';
    RETURN;
  END IF;

  -- Global cap: 8 marketing emails per month per recipient
  SELECT count(*)
  INTO v_monthly_count
  FROM public.lifecycle_email_log l
  WHERE lower(l.recipient_email) = v_email
    AND l.send_category = 'marketing'
    AND l.status = 'sent'
    AND date_trunc('month', l.created_at) = date_trunc('month', p_send_time);

  IF v_monthly_count >= 8 THEN
    RETURN QUERY SELECT false, 'monthly_marketing_cap_reached';
    RETURN;
  END IF;

  -- Complaint threshold guard: pause if > 0.08% over last 30 days
  SELECT count(*)
  INTO v_sent_30d
  FROM public.lifecycle_email_log l
  WHERE l.send_category = 'marketing'
    AND l.status = 'sent'
    AND l.created_at >= now() - interval '30 days';

  SELECT count(*)
  INTO v_complaints_30d
  FROM public.email_provider_events e
  WHERE e.event_type = 'complained'
    AND e.created_at >= now() - interval '30 days';

  IF v_sent_30d >= 200 AND (v_complaints_30d::numeric / v_sent_30d::numeric) > 0.0008 THEN
    RETURN QUERY SELECT false, 'global_complaint_threshold_exceeded';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'ok';
END;
$$;


-- 7) Enqueue RPC with policy checks
CREATE OR REPLACE FUNCTION public.queue_lifecycle_email(
  p_user_id uuid,
  p_recipient_email text,
  p_recipient_name text,
  p_segment text,
  p_campaign_key text,
  p_flow_key text,
  p_template_key text,
  p_send_category text,
  p_subject text,
  p_body_html text,
  p_body_text text DEFAULT NULL,
  p_from_address text DEFAULT NULL,
  p_reply_to text DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_scheduled_for timestamptz DEFAULT now(),
  p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE (queue_id uuid, status text, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_recipient_email));
  v_can_send record;
  v_id uuid;
  v_status text := 'queued';
  v_reason text := 'ok';
BEGIN
  IF p_send_category NOT IN ('marketing', 'transactional') THEN
    RAISE EXCEPTION 'Invalid send_category: %', p_send_category;
  END IF;

  IF p_subject IS NULL OR p_subject = '' THEN
    RAISE EXCEPTION 'Subject is required';
  END IF;

  IF p_body_html IS NULL OR p_body_html = '' THEN
    RAISE EXCEPTION 'body_html is required';
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    v_email := NULL;
  END IF;

  IF p_send_category = 'marketing' THEN
    SELECT * INTO v_can_send
    FROM public.can_send_marketing_email(p_user_id, v_email, p_scheduled_for)
    LIMIT 1;

    IF COALESCE(v_can_send.eligible, false) = false THEN
      v_status := 'suppressed';
      v_reason := COALESCE(v_can_send.reason, 'suppressed');
    END IF;
  END IF;

  INSERT INTO public.lifecycle_email_queue (
    user_id,
    recipient_email,
    recipient_name,
    segment,
    campaign_key,
    flow_key,
    template_key,
    send_category,
    subject,
    body_html,
    body_text,
    from_address,
    reply_to,
    payload,
    scheduled_for,
    status,
    suppression_reason,
    idempotency_key
  )
  VALUES (
    p_user_id,
    v_email,
    p_recipient_name,
    p_segment,
    p_campaign_key,
    p_flow_key,
    p_template_key,
    p_send_category,
    p_subject,
    p_body_html,
    p_body_text,
    p_from_address,
    p_reply_to,
    COALESCE(p_payload, '{}'::jsonb),
    COALESCE(p_scheduled_for, now()),
    v_status,
    CASE WHEN v_status = 'suppressed' THEN v_reason ELSE NULL END,
    p_idempotency_key
  )
  ON CONFLICT (idempotency_key)
  WHERE idempotency_key IS NOT NULL
  DO UPDATE SET updated_at = now()
  RETURNING id INTO v_id;

  IF v_status = 'suppressed' THEN
    INSERT INTO public.lifecycle_email_log (
      queue_id, user_id, recipient_email, segment, campaign_key, flow_key, template_key,
      send_category, status, suppression_reason, subject
    )
    VALUES (
      v_id, p_user_id, COALESCE(v_email, ''), p_segment, p_campaign_key, p_flow_key, p_template_key,
      p_send_category, 'suppressed', v_reason, p_subject
    );
  END IF;

  RETURN QUERY SELECT v_id, v_status, v_reason;
END;
$$;

GRANT EXECUTE ON FUNCTION public.queue_lifecycle_email(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, jsonb, timestamptz, text
) TO authenticated;


-- 8) Queue claim RPC (safe batched worker lock)
CREATE OR REPLACE FUNCTION public.claim_lifecycle_queue_batch(p_limit integer DEFAULT 50)
RETURNS SETOF public.lifecycle_email_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH cte AS (
    SELECT q.id
    FROM public.lifecycle_email_queue q
    WHERE q.status = 'queued'
      AND q.scheduled_for <= now()
      AND q.retry_count <= q.max_retries
    ORDER BY q.scheduled_for ASC
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(1, COALESCE(p_limit, 50))
  )
  UPDATE public.lifecycle_email_queue q
  SET status = 'processing',
      processing_started_at = now(),
      updated_at = now()
  FROM cte
  WHERE q.id = cte.id
  RETURNING q.*;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_lifecycle_queue_batch(integer) TO authenticated;


-- 9) Webhook ingestion helper (suppression automation)
CREATE OR REPLACE FUNCTION public.log_email_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_recipient_email text,
  p_event_type text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_email text := lower(trim(p_recipient_email));
  v_soft_bounce_count int;
BEGIN
  INSERT INTO public.email_provider_events (
    provider,
    provider_event_id,
    recipient_email,
    event_type,
    payload
  )
  VALUES (
    COALESCE(NULLIF(p_provider, ''), 'resend'),
    p_provider_event_id,
    v_email,
    p_event_type,
    COALESCE(p_payload, '{}'::jsonb)
  )
  ON CONFLICT (provider, provider_event_id)
  DO UPDATE SET payload = EXCLUDED.payload
  RETURNING id INTO v_id;

  -- Immediate permanent suppression for hard bounce or complaint
  IF p_event_type IN ('bounced_hard', 'complained') AND v_email IS NOT NULL THEN
    INSERT INTO public.email_suppressions (email, reason, details)
    VALUES (
      v_email,
      CASE WHEN p_event_type = 'complained' THEN 'spam_complaint' ELSE 'hard_bounce' END,
      jsonb_build_object('source', 'provider_event', 'event_type', p_event_type, 'event_id', p_provider_event_id)
    )
    ON CONFLICT (email, reason, is_active) DO NOTHING;
  END IF;

  -- Soft-bounce suppression after 3 in 14 days
  IF p_event_type = 'bounced_soft' AND v_email IS NOT NULL THEN
    SELECT count(*) INTO v_soft_bounce_count
    FROM public.email_provider_events e
    WHERE lower(e.recipient_email) = v_email
      AND e.event_type = 'bounced_soft'
      AND e.created_at >= now() - interval '14 days';

    IF v_soft_bounce_count >= 3 THEN
      INSERT INTO public.email_suppressions (email, reason, details)
      VALUES (
        v_email,
        'soft_bounce_3x_14d',
        jsonb_build_object('source', 'provider_event', 'count', v_soft_bounce_count)
      )
      ON CONFLICT (email, reason, is_active) DO NOTHING;
    END IF;
  END IF;

  RETURN v_id;
END;
$$;


-- 10) One-click unsubscribe helper
CREATE OR REPLACE FUNCTION public.unsubscribe_marketing_email(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
BEGIN
  IF v_email IS NULL OR v_email = '' THEN
    RETURN;
  END IF;

  -- Update newsletter subscribers immediately
  UPDATE public.newsletter_subscribers
  SET is_active = false,
      unsubscribed_at = COALESCE(unsubscribed_at, now())
  WHERE lower(email) = v_email;

  -- Add suppression marker for audit/compliance
  INSERT INTO public.email_suppressions (email, reason, details)
  VALUES (
    v_email,
    'manual_unsubscribe',
    jsonb_build_object('source', 'one_click_unsubscribe')
  )
  ON CONFLICT (email, reason, is_active) DO NOTHING;

  -- If user exists, update preferences
  UPDATE public.marketing_preferences mp
  SET marketing_opt_in = false,
      newsletter_opt_in = false,
      updated_at = now(),
      source = COALESCE(mp.source, 'unsubscribe_link'),
      updated_by = 'system'
  WHERE mp.user_id IN (
    SELECT id FROM auth.users WHERE lower(email) = v_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.unsubscribe_marketing_email(text) TO anon, authenticated;

-- ============================================================
-- MIGRATION: 20260315121500_2f7162c3-2648-47be-b2ca-52b95d90d8f2.sql
-- ============================================================
-- Schedule lifecycle worker and campaign orchestration jobs via pg_cron + pg_net

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.invoke_edge_function(
  p_function_name text,
  p_body jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  _url := current_setting('app.settings.supabase_url', true);
  _anon_key := current_setting('app.settings.supabase_anon_key', true);

  IF _url IS NULL OR _url = '' THEN
    _url := 'https://cnycelkfbtzfnphbeurd.supabase.co';
  END IF;

  IF _anon_key IS NULL OR _anon_key = '' THEN
    _anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueWNlbGtmYnR6Zm5waGJldXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzE1OTEsImV4cCI6MjA4Njk0NzU5MX0.NTLP8YbvjNhZGIrJPFrijsb1UZr5qjlcCkSl-UhSfCU';
  END IF;

  PERFORM net.http_post(
    url := _url || '/functions/v1/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon_key,
      'apikey', _anon_key
    ),
    body := COALESCE(p_body, '{}'::jsonb)
  );
END;
$$;


CREATE OR REPLACE FUNCTION public.run_lifecycle_queue_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.invoke_edge_function('process-lifecycle-email-queue', jsonb_build_object('limit', 100));
END;
$$;


CREATE OR REPLACE FUNCTION public.run_lifecycle_campaign_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Core segment automation flow from lifecycle plan
  PERFORM public.invoke_edge_function('run-lifecycle-campaigns', '{}'::jsonb);

  -- Keep existing trial ending cadence (billing-focused reminders)
  PERFORM public.invoke_edge_function('trial-reminder-emails', '{}'::jsonb);
END;
$$;


DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'lifecycle_email_queue_worker_q15';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  PERFORM cron.schedule(
    'lifecycle_email_queue_worker_q15',
    '*/15 * * * *',
    'SELECT public.run_lifecycle_queue_worker();'
  );
END $$;


DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'lifecycle_campaign_jobs_daily';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  -- Daily run for inactive/profile-completion/travel/trial-based segmentation
  PERFORM cron.schedule(
    'lifecycle_campaign_jobs_daily',
    '10 14 * * *',
    'SELECT public.run_lifecycle_campaign_jobs();'
  );
END $$;


DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'lifecycle_campaign_jobs_weekly';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  -- Weekly digest/newsletter oriented run
  PERFORM cron.schedule(
    'lifecycle_campaign_jobs_weekly',
    '0 15 * * 1',
    'SELECT public.run_lifecycle_campaign_jobs();'
  );
END $$;

-- ============================================================
-- MIGRATION: 20260317130500_7d19a2df-4d82-4f4a-bb4a-71584f9bd7f9.sql
-- ============================================================
-- Restore schema and object grants expected by Supabase API roles.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON ROUTINES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, anon;

-- ============================================================
-- MIGRATION: 20260321000000_profile_xrmg_fields.sql
-- ============================================================
-- XRMG Therapist Profile: add new JSONB/text columns for add-ons, promotions,
-- travel schedule, areas served, training/credentials, and outcall radius.

alter table public.profiles
  add column if not exists add_ons          jsonb default '[]'::jsonb,
  add column if not exists promotions       jsonb default '[]'::jsonb,
  add column if not exists travel_schedule  jsonb default '[]'::jsonb,
  add column if not exists areas_served     text[] default '{}'::text[],
  add column if not exists training         jsonb default '[]'::jsonb,
  add column if not exists outcall_radius_miles integer,
  add column if not exists contact_clicks   integer not null default 0,
  add column if not exists education        text;

-- ============================================================
-- MIGRATION: 20260321100000_geo_engine_rpc.sql
-- ============================================================
-- Migration: Add geo-engine fields + nearby therapists RPC
-- Required by PRD: Homepage Geo Engine + Results Engine

-- Add missing columns to profiles if they don't exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'boost_score') THEN
    ALTER TABLE public.profiles ADD COLUMN boost_score integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'featured_until') THEN
    ALTER TABLE public.profiles ADD COLUMN featured_until timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'latitude') THEN
    ALTER TABLE public.profiles ADD COLUMN latitude double precision;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'longitude') THEN
    ALTER TABLE public.profiles ADD COLUMN longitude double precision;
  END IF;
END
$$;

-- Create index for geo queries
CREATE INDEX IF NOT EXISTS idx_profiles_geo
  ON public.profiles (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for available_now queries
CREATE INDEX IF NOT EXISTS idx_profiles_available_now
  ON public.profiles (available_now)
  WHERE available_now = true;

-- Create index for featured queries
CREATE INDEX IF NOT EXISTS idx_profiles_featured_until
  ON public.profiles (featured_until)
  WHERE featured_until IS NOT NULL;

-- Create index for boost_score sorting
CREATE INDEX IF NOT EXISTS idx_profiles_boost_score
  ON public.profiles (boost_score DESC);

-- RPC: get_nearby_therapists
-- Returns therapists near a given lat/lng with distance calculation
CREATE OR REPLACE FUNCTION public.get_nearby_therapists(
  p_lat double precision,
  p_lng double precision,
  p_radius_miles double precision DEFAULT 50,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  city text,
  neighborhood text,
  starting_price numeric,
  available_now boolean,
  distance_miles double precision,
  profile_photo text,
  boost_score integer,
  featured_until timestamptz,
  modality text,
  specialties text[],
  bio text,
  incall_price numeric,
  outcall_price numeric,
  tier text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    COALESCE(p.display_name, p.full_name, 'Therapist') AS name,
    p.slug,
    p.city,
    COALESCE(p.neighborhood_name, p.primary_area) AS neighborhood,
    LEAST(
      NULLIF(p.incall_price, 0),
      NULLIF(p.outcall_price, 0)
    ) AS starting_price,
    COALESCE(p.available_now, false) AS available_now,
    -- Haversine distance in miles
    3958.8 * 2 * ASIN(SQRT(
      SIN(RADIANS(p.latitude - p_lat) / 2) ^ 2 +
      COS(RADIANS(p_lat)) * COS(RADIANS(p.latitude)) *
      SIN(RADIANS(p.longitude - p_lng) / 2) ^ 2
    )) AS distance_miles,
    p.avatar_url AS profile_photo,
    COALESCE(p.boost_score, 0) AS boost_score,
    p.featured_until,
    p.modality,
    p.specialties,
    p.bio,
    p.incall_price,
    p.outcall_price,
    p._tier AS tier
  FROM public.profiles p
  WHERE
    p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND (p.is_active = true OR p.is_active IS NULL)
    AND p.status IN ('active', 'approved')
    AND 3958.8 * 2 * ASIN(SQRT(
      SIN(RADIANS(p.latitude - p_lat) / 2) ^ 2 +
      COS(RADIANS(p_lat)) * COS(RADIANS(p.latitude)) *
      SIN(RADIANS(p.longitude - p_lng) / 2) ^ 2
    )) <= p_radius_miles
  ORDER BY
    COALESCE(p.available_now, false) DESC,
    distance_miles ASC,
    COALESCE(p.boost_score, 0) DESC
  LIMIT p_limit;
$$;

-- ============================================================
-- MIGRATION: 20260321143000_knotty_learning_engine.sql
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.ranking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  therapist_id uuid NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  event_name text NOT NULL CHECK (
    event_name IN (
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
  city text NULL,
  neighborhood text NULL,
  intent text NOT NULL DEFAULT 'general' CHECK (
    intent IN (
      'available_now',
      'mobile',
      'verified',
      'budget',
      'premium',
      'nearby',
      'technique',
      'travel',
      'help_choose',
      'general'
    )
  ),
  device_type text NULL CHECK (
    device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop', 'unknown')
  ),
  position_in_results integer NULL,
  recommendation_source text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_ranking_events_created_at
  ON public.ranking_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_events_session
  ON public.ranking_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_events_therapist
  ON public.ranking_events (therapist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_events_name
  ON public.ranking_events (event_name, created_at DESC);

ALTER TABLE public.ranking_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.therapist_learning_scores (
  therapist_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  city text NOT NULL DEFAULT '__all__',
  intent text NOT NULL DEFAULT 'general' CHECK (
    intent IN (
      'available_now',
      'mobile',
      'verified',
      'budget',
      'premium',
      'nearby',
      'technique',
      'travel',
      'help_choose',
      'general'
    )
  ),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  profile_clicks integer NOT NULL DEFAULT 0 CHECK (profile_clicks >= 0),
  contact_clicks integer NOT NULL DEFAULT 0 CHECK (contact_clicks >= 0),
  ctr numeric NOT NULL DEFAULT 0,
  contact_rate numeric NOT NULL DEFAULT 0,
  intent_conversion_rate numeric NOT NULL DEFAULT 0,
  score_7d numeric NOT NULL DEFAULT 0,
  score_30d numeric NOT NULL DEFAULT 0,
  weighted_score numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (therapist_id, city, intent)
);

CREATE INDEX IF NOT EXISTS idx_therapist_learning_scores_weighted
  ON public.therapist_learning_scores (weighted_score DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_therapist_learning_scores_city_intent
  ON public.therapist_learning_scores (city, intent, weighted_score DESC);

ALTER TABLE public.therapist_learning_scores ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.refresh_knotty_learning_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH base_events AS (
    SELECT
      therapist_id,
      COALESCE(NULLIF(TRIM(city), ''), '__all__') AS city_bucket,
      COALESCE(NULLIF(TRIM(intent), ''), 'general') AS intent_bucket,
      event_name,
      created_at
    FROM public.ranking_events
    WHERE therapist_id IS NOT NULL
      AND created_at >= timezone('utc', now()) - interval '30 days'
  ),
  expanded_events AS (
    SELECT therapist_id, city_bucket AS city, intent_bucket AS intent, event_name, created_at FROM base_events
    UNION ALL
    SELECT therapist_id, '__all__' AS city, intent_bucket AS intent, event_name, created_at FROM base_events
    UNION ALL
    SELECT therapist_id, city_bucket AS city, 'general' AS intent, event_name, created_at FROM base_events
    UNION ALL
    SELECT therapist_id, '__all__' AS city, 'general' AS intent, event_name, created_at FROM base_events
  ),
  aggregate_30d AS (
    SELECT
      therapist_id,
      city,
      intent,
      COUNT(*) FILTER (WHERE event_name = 'knotty_recommendation_shown') AS impressions_30d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_profile_clicked') AS profile_clicks_30d,
      COUNT(*) FILTER (
        WHERE event_name IN (
          'knotty_contact_clicked',
          'knotty_call_clicked',
          'knotty_text_clicked',
          'knotty_whatsapp_clicked'
        )
      ) AS contact_clicks_30d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_contact_clicked') AS generic_contact_clicks_30d,
      COUNT(*) FILTER (
        WHERE event_name IN ('knotty_call_clicked', 'knotty_text_clicked', 'knotty_whatsapp_clicked')
      ) AS direct_contact_clicks_30d
    FROM expanded_events
    GROUP BY therapist_id, city, intent
  ),
  aggregate_7d AS (
    SELECT
      therapist_id,
      city,
      intent,
      COUNT(*) FILTER (WHERE event_name = 'knotty_recommendation_shown') AS impressions_7d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_profile_clicked') AS profile_clicks_7d,
      COUNT(*) FILTER (
        WHERE event_name IN (
          'knotty_contact_clicked',
          'knotty_call_clicked',
          'knotty_text_clicked',
          'knotty_whatsapp_clicked'
        )
      ) AS contact_clicks_7d,
      COUNT(*) FILTER (WHERE event_name = 'knotty_contact_clicked') AS generic_contact_clicks_7d,
      COUNT(*) FILTER (
        WHERE event_name IN ('knotty_call_clicked', 'knotty_text_clicked', 'knotty_whatsapp_clicked')
      ) AS direct_contact_clicks_7d
    FROM expanded_events
    WHERE created_at >= timezone('utc', now()) - interval '7 days'
    GROUP BY therapist_id, city, intent
  ),
  merged AS (
    SELECT
      a30.therapist_id,
      a30.city,
      a30.intent,
      a30.impressions_30d,
      a30.profile_clicks_30d,
      a30.contact_clicks_30d,
      COALESCE(a7.impressions_7d, 0) AS impressions_7d,
      COALESCE(a7.profile_clicks_7d, 0) AS profile_clicks_7d,
      COALESCE(a7.contact_clicks_7d, 0) AS contact_clicks_7d,
      COALESCE(a30.generic_contact_clicks_30d, 0) AS generic_contact_clicks_30d,
      COALESCE(a30.direct_contact_clicks_30d, 0) AS direct_contact_clicks_30d,
      COALESCE(a7.generic_contact_clicks_7d, 0) AS generic_contact_clicks_7d,
      COALESCE(a7.direct_contact_clicks_7d, 0) AS direct_contact_clicks_7d
    FROM aggregate_30d a30
    LEFT JOIN aggregate_7d a7
      ON a7.therapist_id = a30.therapist_id
     AND a7.city = a30.city
     AND a7.intent = a30.intent
  ),
  scored AS (
    SELECT
      therapist_id,
      city,
      intent,
      impressions_30d AS impressions,
      profile_clicks_30d AS profile_clicks,
      contact_clicks_30d AS contact_clicks,
      LEAST(1, COALESCE(profile_clicks_30d::numeric / NULLIF(impressions_30d, 0), 0)) AS ctr_30d,
      LEAST(1, COALESCE(contact_clicks_30d::numeric / NULLIF(impressions_30d, 0), 0)) AS contact_rate_30d,
      LEAST(
        1,
        COALESCE(
          (
            (profile_clicks_30d * 1) +
            (generic_contact_clicks_30d * 3) +
            (direct_contact_clicks_30d * 6)
          )::numeric / NULLIF(impressions_30d, 0),
          0
        )
      ) AS intent_conversion_rate_30d,
      LEAST(1, COALESCE(profile_clicks_7d::numeric / NULLIF(impressions_7d, 0), 0)) AS ctr_7d,
      LEAST(1, COALESCE(contact_clicks_7d::numeric / NULLIF(impressions_7d, 0), 0)) AS contact_rate_7d,
      LEAST(
        1,
        COALESCE(
          (
            (profile_clicks_7d * 1) +
            (generic_contact_clicks_7d * 3) +
            (direct_contact_clicks_7d * 6)
          )::numeric / NULLIF(impressions_7d, 0),
          0
        )
      ) AS intent_conversion_rate_7d,
      LEAST(1, COALESCE(impressions_7d::numeric / NULLIF(impressions_30d, 0), 0)) AS recency_boost
    FROM merged
  )
  INSERT INTO public.therapist_learning_scores (
    therapist_id,
    city,
    intent,
    impressions,
    profile_clicks,
    contact_clicks,
    ctr,
    contact_rate,
    intent_conversion_rate,
    score_7d,
    score_30d,
    weighted_score,
    updated_at
  )
  SELECT
    therapist_id,
    city,
    intent,
    impressions,
    profile_clicks,
    contact_clicks,
    ROUND(ctr_30d, 6),
    ROUND(contact_rate_30d, 6),
    ROUND(intent_conversion_rate_30d, 6),
    ROUND((ctr_7d * 0.30) + (contact_rate_7d * 0.45) + (intent_conversion_rate_7d * 0.15) + (recency_boost * 0.10), 6),
    ROUND((ctr_30d * 0.30) + (contact_rate_30d * 0.45) + (intent_conversion_rate_30d * 0.15) + (recency_boost * 0.10), 6),
    ROUND(
      (
        ((ctr_7d * 0.30) + (contact_rate_7d * 0.45) + (intent_conversion_rate_7d * 0.15) + (recency_boost * 0.10)) * 0.60
      ) +
      (
        ((ctr_30d * 0.30) + (contact_rate_30d * 0.45) + (intent_conversion_rate_30d * 0.15) + (recency_boost * 0.10)) * 0.40
      ),
      6
    ),
    timezone('utc', now())
  FROM scored
  ON CONFLICT (therapist_id, city, intent) DO UPDATE
  SET
    impressions = EXCLUDED.impressions,
    profile_clicks = EXCLUDED.profile_clicks,
    contact_clicks = EXCLUDED.contact_clicks,
    ctr = EXCLUDED.ctr,
    contact_rate = EXCLUDED.contact_rate,
    intent_conversion_rate = EXCLUDED.intent_conversion_rate,
    score_7d = EXCLUDED.score_7d,
    score_30d = EXCLUDED.score_30d,
    weighted_score = EXCLUDED.weighted_score,
    updated_at = EXCLUDED.updated_at;

  DELETE FROM public.therapist_learning_scores
  WHERE updated_at < timezone('utc', now()) - interval '45 days';
END;
$$;

DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'knotty_learning_refresh_hourly';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  PERFORM cron.schedule(
    'knotty_learning_refresh_hourly',
    '17 * * * *',
    'SELECT public.refresh_knotty_learning_scores();'
  );
END $$;

-- ============================================================
-- MIGRATION: 20260322000000_rls_audit_fix.sql
-- ============================================================
-- RLS Audit & Fix Migration
-- Issue 1: ranking_events has RLS enabled but NO policies → reads/writes fail for all roles
-- Issue 2: therapist_learning_scores has RLS enabled but NO policies → reads fail for anon
-- Issue 3: profiles table (used by directory.ts) may lack RLS — verify and add policies
-- Issue 4: subscriptions lacks DELETE policy for self-service cancellation cleanup
-- Issue 5: storage policies for therapist-photos allow ANY authenticated user to upload/modify/delete ANY file
-- Issue 6: reviews allows admin insert via FOR ALL but regular users cannot submit reviews

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 1: ranking_events — allow inserts from anon/authenticated, read only for admin
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "ranking_events_insert_anyone" ON public.ranking_events;
CREATE POLICY "ranking_events_insert_anyone"
  ON public.ranking_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "ranking_events_select_admin" ON public.ranking_events;
CREATE POLICY "ranking_events_select_admin"
  ON public.ranking_events FOR SELECT
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 2: therapist_learning_scores — public read for ranking, admin write
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "learning_scores_public_read" ON public.therapist_learning_scores;
CREATE POLICY "learning_scores_public_read"
  ON public.therapist_learning_scores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "learning_scores_admin_manage" ON public.therapist_learning_scores;
CREATE POLICY "learning_scores_admin_manage"
  ON public.therapist_learning_scores FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 3: profiles table — ensure RLS is enabled and policies exist
-- The app reads from "profiles" via directory.ts; we need public read for active profiles
-- ══════════════════════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles_public_read_active" ON public.profiles;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_public_read_active" ON public.profiles FOR SELECT USING (
      (status IN (''active'', ''approved'') AND (is_active = true OR is_active IS NULL))
      OR user_id = auth.uid()
      OR public.is_admin()
    )';
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles_insert_self_or_admin" ON public.profiles;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_insert_self_or_admin" ON public.profiles FOR INSERT WITH CHECK (
      user_id = auth.uid() OR public.is_admin()
    )';
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_update_self_or_admin" ON public.profiles FOR UPDATE USING (
      user_id = auth.uid() OR public.is_admin()
    ) WITH CHECK (
      user_id = auth.uid() OR public.is_admin()
    )';
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 4: subscriptions — add delete policy for admin cleanup
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "subscriptions_delete_admin" ON public.subscriptions;
CREATE POLICY "subscriptions_delete_admin"
  ON public.subscriptions FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 5: Storage — scope uploads/updates/deletes to user's own folder
-- Convention: therapist-photos/{user_id}/filename
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can upload therapist photos" ON storage.objects;
CREATE POLICY "Authenticated can upload therapist photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'therapist-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated can update therapist photos" ON storage.objects;
CREATE POLICY "Authenticated can update therapist photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'therapist-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'therapist-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated can delete therapist photos" ON storage.objects;
CREATE POLICY "Authenticated can delete therapist photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'therapist-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin override for storage management
DROP POLICY IF EXISTS "Admin can manage all therapist photos" ON storage.objects;
CREATE POLICY "Admin can manage all therapist photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'therapist-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'therapist-photos' AND public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 6: reviews — allow authenticated users to submit reviews (not just admin)
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- Fix 7: lifecycle email tables — ensure service_role can always access
-- Grant permissions to service_role for internal processing
-- ══════════════════════════════════════════════════════════════════════════════
GRANT ALL ON public.marketing_preferences TO service_role;
GRANT ALL ON public.email_suppressions TO service_role;
GRANT ALL ON public.email_provider_events TO service_role;
GRANT ALL ON public.lifecycle_email_queue TO service_role;
GRANT ALL ON public.lifecycle_email_log TO service_role;
GRANT ALL ON public.ranking_events TO service_role;
GRANT ALL ON public.therapist_learning_scores TO service_role;

-- ============================================================
-- MIGRATION: 20260322010000_identity_verification_selective_privacy.sql
-- ============================================================
-- Identity Verification with Selective Privacy for LGBTQ+ Safety
-- Therapists can verify their identity without exposing their legal name publicly
-- Only verification status (badge) is shown — legal details are encrypted/hashed

-- ══════════════════════════════════════════════════════════════════════════════
-- Verification requests table
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL,  -- references profiles(id) but allowing flexibility

  -- What they submit (encrypted at rest by Supabase; we store only hashes for matching)
  legal_name_hash text NOT NULL,  -- SHA-256 of normalized legal name
  document_type text NOT NULL CHECK (document_type IN (
    'drivers_license', 'passport', 'state_id', 'military_id'
  )),
  document_country text NOT NULL DEFAULT 'US',
  document_expiry date,

  -- Photo ID upload reference (stored in private bucket, auto-deleted after verification)
  document_storage_path text,

  -- Selfie for liveness check reference
  selfie_storage_path text,

  -- Verification result
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'reviewing', 'approved', 'rejected', 'expired'
  )),
  rejection_reason text,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,

  -- Privacy controls — what the therapist consents to share publicly
  show_verified_badge boolean NOT NULL DEFAULT true,
  show_first_name boolean NOT NULL DEFAULT false,
  show_verification_date boolean NOT NULL DEFAULT true,
  show_document_type boolean NOT NULL DEFAULT false,

  -- Audit
  verification_method text NOT NULL DEFAULT 'manual' CHECK (verification_method IN (
    'manual', 'automated', 'partner_api'
  )),
  verified_at timestamptz,
  expires_at timestamptz,  -- verifications expire after 2 years
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user
  ON public.identity_verifications (user_id, status);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_profile
  ON public.identity_verifications (profile_id, status);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_pending
  ON public.identity_verifications (status, created_at)
  WHERE status IN ('pending', 'reviewing');

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own verifications
DROP POLICY IF EXISTS "verifications_select_own" ON public.identity_verifications;
CREATE POLICY "verifications_select_own"
  ON public.identity_verifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "verifications_insert_own" ON public.identity_verifications;
CREATE POLICY "verifications_insert_own"
  ON public.identity_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "verifications_update_admin" ON public.identity_verifications;
CREATE POLICY "verifications_update_admin"
  ON public.identity_verifications FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Public verification status view — ONLY exposes what therapist consents to
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.public_verification_status AS
SELECT
  v.profile_id,
  v.status = 'approved' AND (v.expires_at IS NULL OR v.expires_at > now()) AS is_verified,
  CASE WHEN v.show_verified_badge THEN true ELSE false END AS show_badge,
  CASE WHEN v.show_verification_date THEN v.verified_at ELSE NULL END AS verified_since,
  CASE WHEN v.show_document_type THEN v.document_type ELSE NULL END AS document_type,
  v.verification_method
FROM public.identity_verifications v
WHERE v.status = 'approved'
  AND (v.expires_at IS NULL OR v.expires_at > now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Private storage bucket for verification documents (NOT public)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents',
  'identity-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Only the user can upload their own documents
DROP POLICY IF EXISTS "User can upload own identity docs" ON storage.objects;
CREATE POLICY "User can upload own identity docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all documents for review
DROP POLICY IF EXISTS "Admin can read identity docs" ON storage.objects;
CREATE POLICY "Admin can read identity docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- Admin can delete documents after review/expiry
DROP POLICY IF EXISTS "Admin can delete identity docs" ON storage.objects;
CREATE POLICY "Admin can delete identity docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND public.is_admin()
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC to submit verification request (hashes the legal name server-side)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.submit_identity_verification(
  p_profile_id uuid,
  p_legal_name text,
  p_document_type text,
  p_document_country text DEFAULT 'US',
  p_document_expiry date DEFAULT NULL,
  p_document_storage_path text DEFAULT NULL,
  p_selfie_storage_path text DEFAULT NULL,
  p_show_first_name boolean DEFAULT false,
  p_show_verification_date boolean DEFAULT true,
  p_show_document_type boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _name_hash text;
  _existing_id uuid;
  _new_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check for existing pending/reviewing verification
  SELECT id INTO _existing_id
  FROM public.identity_verifications
  WHERE user_id = _user_id
    AND profile_id = p_profile_id
    AND status IN ('pending', 'reviewing')
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'You already have a pending verification request';
  END IF;

  -- Hash the legal name (SHA-256) — the plain text is never stored
  _name_hash := encode(digest(lower(trim(p_legal_name)), 'sha256'), 'hex');

  INSERT INTO public.identity_verifications (
    user_id, profile_id, legal_name_hash, document_type,
    document_country, document_expiry, document_storage_path,
    selfie_storage_path, show_first_name, show_verification_date,
    show_document_type
  ) VALUES (
    _user_id, p_profile_id, _name_hash, p_document_type,
    p_document_country, p_document_expiry, p_document_storage_path,
    p_selfie_storage_path, p_show_first_name, p_show_verification_date,
    p_show_document_type
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RPC for admin to approve/reject verification
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.review_identity_verification(
  p_verification_id uuid,
  p_decision text,  -- 'approved' or 'rejected'
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reviewer_id uuid := auth.uid();
  _profile_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;

  UPDATE public.identity_verifications
  SET
    status = p_decision,
    rejection_reason = CASE WHEN p_decision = 'rejected' THEN p_rejection_reason ELSE NULL END,
    reviewer_id = _reviewer_id,
    reviewed_at = timezone('utc', now()),
    verified_at = CASE WHEN p_decision = 'approved' THEN timezone('utc', now()) ELSE NULL END,
    expires_at = CASE WHEN p_decision = 'approved' THEN timezone('utc', now()) + interval '2 years' ELSE NULL END,
    updated_at = timezone('utc', now())
  WHERE id = p_verification_id
    AND status IN ('pending', 'reviewing')
  RETURNING profile_id INTO _profile_id;

  -- Update the profile's verification flags
  IF p_decision = 'approved' AND _profile_id IS NOT NULL THEN
    -- Try profiles table first, then therapists table
    UPDATE public.profiles
    SET is_verified_identity = true
    WHERE id = _profile_id;

    IF NOT FOUND THEN
      UPDATE public.therapists
      SET status = 'approved'
      WHERE id = _profile_id;
    END IF;
  END IF;
END;
$$;

-- Grant service_role access for edge function processing
GRANT ALL ON public.identity_verifications TO service_role;
GRANT SELECT ON public.public_verification_status TO anon, authenticated;

-- ============================================================
-- MIGRATION: 20260322020000_explicit_client_preferences.sql
-- ============================================================
-- ============================================================================
-- Explicit Client Preferences on Profiles
-- Allows therapists to declare inclusivity signals and client preferences
-- and clients to filter by these criteria.
-- ============================================================================

-- 1) Add preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lgbtq_affirming       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepts_all_genders   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS languages_spoken       text[] DEFAULT '{English}'::text[],
  ADD COLUMN IF NOT EXISTS accessibility_features text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS clientele_preferences  jsonb DEFAULT '{}'::jsonb;

-- 2) Index for fast filter queries
CREATE INDEX IF NOT EXISTS idx_profiles_lgbtq_affirming
  ON public.profiles (lgbtq_affirming)
  WHERE lgbtq_affirming = true;

CREATE INDEX IF NOT EXISTS idx_profiles_languages_spoken
  ON public.profiles USING gin (languages_spoken);

-- 3) Comment on columns for documentation
COMMENT ON COLUMN public.profiles.lgbtq_affirming IS
  'Therapist explicitly declares LGBTQ+-affirming practice';

COMMENT ON COLUMN public.profiles.accepts_all_genders IS
  'Therapist accepts clients of all genders';

COMMENT ON COLUMN public.profiles.languages_spoken IS
  'Languages the therapist can conduct sessions in';

COMMENT ON COLUMN public.profiles.accessibility_features IS
  'Accessibility features: wheelchair-accessible, adjustable-table, etc.';

COMMENT ON COLUMN public.profiles.clientele_preferences IS
  'Free-form JSONB for additional preference signals: {"couples":true,"seniors":true}';

-- ============================================================
-- MIGRATION: 20260322030000_blog_system_enhancement.sql
-- ============================================================
-- ============================================================================
-- Blog System Enhancement: add category, author, read_time, cover_image
-- Extends the existing blog_posts table for full editorial workflow
-- ============================================================================

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS category       text DEFAULT 'Wellness Tips',
  ADD COLUMN IF NOT EXISTS author_name    text DEFAULT 'MasseurMatch Editorial',
  ADD COLUMN IF NOT EXISTS author_title   text DEFAULT 'Wellness & Inclusivity Editor',
  ADD COLUMN IF NOT EXISTS read_time_min  integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS cover_image    text,
  ADD COLUMN IF NOT EXISTS cover_alt      text,
  ADD COLUMN IF NOT EXISTS is_featured    boolean NOT NULL DEFAULT false;

-- Index for fast listing queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
  ON public.blog_posts (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON public.blog_posts (category);

CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
  ON public.blog_posts (is_featured)
  WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_tags
  ON public.blog_posts USING gin (tags);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read all published posts
DROP POLICY IF EXISTS "blog_posts_public_read" ON public.blog_posts;
CREATE POLICY "blog_posts_public_read"
  ON public.blog_posts FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
DROP POLICY IF EXISTS "blog_posts_admin_write" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_write"
  ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_admin());

-- Seed initial editorial content for LGBTQ+ SEO strategy
INSERT INTO public.blog_posts (slug, title, excerpt, seo_description, content, tags, category, published_at)
VALUES
  (
    'lgbtq-affirming-massage-guide',
    'How to Find an LGBTQ+-Affirming Massage Therapist',
    'Your therapeutic environment matters. Learn what signals to look for and what questions to ask when searching for an inclusive therapist.',
    'Guide to finding LGBTQ+-affirming massage therapists. What to look for, questions to ask, and how MasseurMatch verifies inclusive practice.',
    '[{"type":"paragraph","content":"Finding a massage therapist who genuinely understands and respects your identity isn''t just a preference — it''s a safety requirement. For LGBTQ+ individuals, the vulnerability of bodywork makes the therapeutic relationship uniquely important."},{"type":"h2","content":"What Does ''LGBTQ+-Affirming'' Actually Mean?"},{"type":"paragraph","content":"An affirming therapist goes beyond tolerance. They have specific training in working with diverse bodies and identities, use inclusive intake forms, and create an environment where you don''t have to educate your provider about your basic humanity."},{"type":"h2","content":"Key Signals to Look For"},{"type":"ul","content":["Gender-neutral intake forms that ask for pronouns","Visible LGBTQ+ affirming signage or website language","Explicit non-discrimination policies","Training certifications in inclusive bodywork","Reviews from other LGBTQ+ clients"]},{"type":"h2","content":"Questions to Ask Before Booking"},{"type":"ul","content":["Do you have experience working with LGBTQ+ clients?","What does your intake process look like?","How do you handle draping for clients with diverse body types?","Are you trained in trauma-informed touch?"]},{"type":"callout","content":"On MasseurMatch, therapists who have completed LGBTQ+-inclusive training and meet our affirming practice standards display a verified badge on their profile. Use the LGBTQ+ Affirming filter in search to find them instantly."},{"type":"h2","content":"Why Platform Verification Matters"},{"type":"paragraph","content":"Anyone can claim to be inclusive. MasseurMatch requires therapists to demonstrate their commitment through documented training, adherence to our community guidelines, and ongoing accountability through the review system."}]',
    ARRAY['LGBTQ+', 'affirming care', 'massage therapy', 'gay massage', 'inclusive bodywork'],
    'LGBTQ+ Health',
    '2025-03-08T09:00:00Z'
  ),
  (
    'trans-inclusive-bodywork',
    'Trans-Inclusive Bodywork: What Therapists Need to Know',
    'Creating genuine safety for transgender clients requires more than good intentions. Practical guidance for therapists committed to inclusive practice.',
    'Comprehensive guide for massage therapists on trans-inclusive bodywork practices, intake processes, and creating genuine safety for transgender clients.',
    '[{"type":"paragraph","content":"Transgender and non-binary clients often face unique barriers to accessing bodywork. Discomfort with traditional intake processes, anxiety about misgendering, and past experiences of discrimination can make the prospect of massage therapy feel inaccessible — even when it would be profoundly beneficial."},{"type":"h2","content":"Start with Your Intake Process"},{"type":"paragraph","content":"Your intake form is the first signal a client receives about your practice. Replace ''Male/Female'' checkboxes with open-ended gender identity fields. Ask for pronouns. Include a question about areas of the body the client would prefer not to have touched — without requiring justification."},{"type":"h2","content":"Language and Communication"},{"type":"ul","content":["Use the client''s stated name and pronouns consistently","Ask about touch preferences without making assumptions about the body","Never comment on a client''s body in ways that reference their transition","Frame all communication around the client''s comfort and agency"]},{"type":"h2","content":"Draping and Body Work"},{"type":"paragraph","content":"Standard draping protocols should work for all clients, but be prepared to adapt. Some trans clients may want additional draping in certain areas. Others may have post-surgical considerations. The key is asking, not assuming."},{"type":"callout","content":"A simple question like ''Is there anything about your body or comfort that would be helpful for me to know before we start?'' creates space without requiring disclosure."},{"type":"h2","content":"Continuing Education"},{"type":"paragraph","content":"Seek out specific training in trans-inclusive bodywork. Organizations like the National LGBTQ+ Task Force and the Gay and Lesbian Medical Association offer resources. MasseurMatch partners with certified trainers to provide ongoing education for platform therapists."}]',
    ARRAY['trans', 'LGBTQ+', 'inclusive bodywork', 'transgender massage', 'therapist training'],
    'LGBTQ+ Health',
    '2025-01-22T09:00:00Z'
  ),
  (
    'deep-tissue-vs-swedish',
    'Deep Tissue vs Swedish Massage: Which Is Right for You?',
    'Two of the most popular massage modalities serve very different purposes. Break down the key differences before your next booking.',
    'Compare deep tissue and Swedish massage techniques, benefits, and ideal use cases. Learn which modality is right for your wellness goals.',
    '[{"type":"paragraph","content":"Deep tissue and Swedish massage are the two most commonly requested modalities, but they serve fundamentally different purposes. Understanding the difference helps you book the right session and communicate effectively with your therapist."},{"type":"h2","content":"Swedish Massage: The Foundation"},{"type":"paragraph","content":"Swedish massage uses long, flowing strokes (effleurage), kneading (petrissage), and rhythmic tapping to promote general relaxation and improve circulation. Pressure is typically light to moderate."},{"type":"ul","content":["Best for: stress relief, general relaxation, first-time clients","Pressure: light to moderate","Session length: 60–90 minutes is ideal","Recovery: minimal; most people feel relaxed immediately"]},{"type":"h2","content":"Deep Tissue: Targeted Relief"},{"type":"paragraph","content":"Deep tissue massage uses slower, more concentrated strokes targeting the deeper layers of muscle and fascia. It''s designed to break up adhesions (knots) and relieve chronic tension patterns."},{"type":"ul","content":["Best for: chronic pain, sports recovery, repetitive strain injuries","Pressure: firm to deep","Session length: 60–90 minutes; can be intense","Recovery: some soreness for 24–48 hours is normal"]},{"type":"h2","content":"Which Should You Choose?"},{"type":"paragraph","content":"If you''re new to massage or primarily seeking relaxation, start with Swedish. If you have specific pain points, chronic tension, or athletic recovery needs, deep tissue is likely more effective."},{"type":"callout","content":"Many therapists blend techniques within a single session. You can always start with Swedish pressure and ask your therapist to go deeper in specific areas if needed."}]',
    ARRAY['deep tissue', 'swedish', 'modalities', 'massage comparison', 'wellness'],
    'Wellness Tips',
    '2025-02-28T09:00:00Z'
  ),
  (
    'massage-anxiety-relief',
    'Massage Therapy as an Anxiety Relief Tool: What the Research Says',
    'The evidence for massage as a clinical stress intervention is growing. We break down the latest research in accessible language.',
    'Research-backed guide on how massage therapy reduces anxiety and stress. Clinical evidence, mechanisms, and practical recommendations.',
    '[{"type":"paragraph","content":"Anxiety disorders affect over 40 million adults in the United States alone. While therapy and medication remain frontline treatments, a growing body of research supports massage therapy as a meaningful complementary intervention."},{"type":"h2","content":"What the Research Shows"},{"type":"paragraph","content":"A 2020 meta-analysis published in the Journal of Clinical Psychology found that massage therapy significantly reduced anxiety symptoms across 17 randomized controlled trials, with effects comparable to psychotherapy for generalized anxiety."},{"type":"paragraph","content":"The mechanism appears to involve multiple pathways: decreased cortisol, increased serotonin and dopamine, activation of the parasympathetic nervous system, and the simple but powerful effect of safe, consensual human touch."},{"type":"h2","content":"Types of Massage Most Effective for Anxiety"},{"type":"ul","content":["Swedish massage: gentle, rhythmic techniques that promote deep relaxation","Craniosacral therapy: light-touch approach targeting the central nervous system","Aromatherapy massage: combining touch with calming essential oils","Myofascial release: addresses tension stored in connective tissue"]},{"type":"h2","content":"Practical Recommendations"},{"type":"paragraph","content":"Research suggests sessions of 60 minutes or longer produce the most significant anxiety reduction. Regular sessions (weekly or biweekly) show cumulative benefits over time, with many participants reporting sustained improvement after 8–12 sessions."},{"type":"callout","content":"Massage therapy works best as part of a holistic approach to anxiety management, not as a replacement for mental health treatment. If you experience clinical anxiety, continue working with your mental health provider."}]',
    ARRAY['anxiety', 'research', 'wellness', 'mental health', 'stress relief'],
    'Wellness Tips',
    '2025-01-30T09:00:00Z'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  seo_description = EXCLUDED.seo_description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  category = EXCLUDED.category;

-- ============================================================
-- MIGRATION: 20260322113000_moderation_queue.sql
-- ============================================================
create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('text', 'photo')),
  source text not null default 'provider_listing',
  field_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  moderation_provider text,
  moderation_reason text,
  snapshot jsonb not null default '{}'::jsonb,
  ai_response jsonb,
  admin_reason text,
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_moderation_queue_status_created_at
  on public.moderation_queue (status, created_at desc);

create index if not exists idx_moderation_queue_profile_status
  on public.moderation_queue (profile_id, status, created_at desc);

create index if not exists idx_moderation_queue_user_status
  on public.moderation_queue (user_id, status, created_at desc);

create unique index if not exists idx_moderation_queue_pending_profile_source
  on public.moderation_queue (profile_id, item_type, source)
  where status = 'pending';

drop trigger if exists trg_moderation_queue_set_updated_at on public.moderation_queue;
create trigger trg_moderation_queue_set_updated_at
before update on public.moderation_queue
for each row execute function public.set_updated_at();

alter table public.moderation_queue enable row level security;

drop policy if exists "moderation_queue_select_self_or_admin" on public.moderation_queue;
create policy "moderation_queue_select_self_or_admin"
  on public.moderation_queue
  for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "moderation_queue_insert_self_or_admin" on public.moderation_queue;
create policy "moderation_queue_insert_self_or_admin"
  on public.moderation_queue
  for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "moderation_queue_update_admin_only" on public.moderation_queue;
create policy "moderation_queue_update_admin_only"
  on public.moderation_queue
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "moderation_queue_delete_admin_only" on public.moderation_queue;
create policy "moderation_queue_delete_admin_only"
  on public.moderation_queue
  for delete
  using (public.is_admin());

-- ============================================================
-- MIGRATION: 20260322121500_moderation_queue_target_id.sql
-- ============================================================
alter table public.moderation_queue
  add column if not exists target_id text;

create index if not exists idx_moderation_queue_target_status
  on public.moderation_queue (target_id, status, created_at desc);

drop index if exists public.idx_moderation_queue_pending_profile_source;

create unique index if not exists idx_moderation_queue_pending_target_source
  on public.moderation_queue (item_type, source, coalesce(target_id, profile_id::text))
  where status = 'pending';

-- ============================================================
-- MIGRATION: 20260322160000_profile_physical_stats.sql
-- ============================================================
alter table public.profiles
  add column if not exists height_inches integer,
  add column if not exists weight_lb integer,
  add column if not exists body_type text;

update public.profiles
set body_type = case lower(trim(body_type))
  when 'slim' then 'slim'
  when 'athletic' then 'athletic'
  when 'average' then 'average'
  when 'muscular' then 'muscular'
  when 'stocky' then 'stocky'
  when 'large' then 'large'
  else null
end
where body_type is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_height_inches_check'
  ) then
    alter table public.profiles
      add constraint profiles_height_inches_check
      check (height_inches is null or height_inches between 48 and 96);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_weight_lb_check'
  ) then
    alter table public.profiles
      add constraint profiles_weight_lb_check
      check (weight_lb is null or weight_lb between 80 and 450);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_body_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_body_type_check
      check (
        body_type is null
        or body_type in ('slim', 'athletic', 'average', 'muscular', 'stocky', 'large')
      );
  end if;
end $$;

create index if not exists idx_profiles_body_type on public.profiles (body_type);

-- ============================================================
-- MIGRATION: 20260322170000_city_digest_cron.sql
-- ============================================================
-- Schedule the City Digest email via pg_cron + pg_net
-- Runs every Friday at 9:00 AM UTC
-- Calls the Supabase Edge Function: send-city-digest

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the cron job
SELECT cron.schedule(
  'send-city-digest-weekly',         -- unique job name
  '0 9 * * 5',                       -- every Friday at 09:00 UTC
  $$
  SELECT extensions.http_post(
    url    := current_setting('app.settings.supabase_url') || '/functions/v1/send-city-digest',
    body   := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);

-- ============================================================
-- MIGRATION: 20260409000000_contact_system.sql
-- ============================================================
-- Create contact inquiries table
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_phone text,
  message text not null,
  preferred_contact text not null default 'email' check (preferred_contact in ('email', 'phone', 'whatsapp')),
  status text not null default 'new' check (status in ('new', 'viewed', 'responded', 'archived')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create contact preferences table
create table if not exists public.contact_preferences (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null unique references public.therapists (id) on delete cascade,
  allow_phone boolean not null default true,
  allow_email boolean not null default true,
  allow_whatsapp boolean not null default false,
  auto_reply_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create indexes
create index if not exists idx_contact_inquiries_therapist on public.contact_inquiries(therapist_id);
create index if not exists idx_contact_inquiries_status on public.contact_inquiries(status);
create index if not exists idx_contact_inquiries_created on public.contact_inquiries(created_at);
create index if not exists idx_contact_preferences_therapist on public.contact_preferences(therapist_id);

-- Add triggers for updated_at
create trigger set_contact_inquiries_updated_at
  before update on public.contact_inquiries
  for each row
  execute function public.set_updated_at();

create trigger set_contact_preferences_updated_at
  before update on public.contact_preferences
  for each row
  execute function public.set_updated_at();

-- Enable RLS
alter table public.contact_inquiries enable row level security;
alter table public.contact_preferences enable row level security;

-- RLS: Anyone can insert inquiries (for public form submissions)
create policy "contact_inquiries_insert_public"
  on public.contact_inquiries for insert
  with check (true);

-- RLS: Therapists can view their own inquiries
create policy "contact_inquiries_select_own"
  on public.contact_inquiries for select
  using (
    exists (
      select 1 from public.therapists
      where id = contact_inquiries.therapist_id
      and user_id = auth.uid()
    )
  );

-- RLS: Therapists can update their own inquiries
create policy "contact_inquiries_update_own"
  on public.contact_inquiries for update
  using (
    exists (
      select 1 from public.therapists
      where id = contact_inquiries.therapist_id
      and user_id = auth.uid()
    )
  );

-- RLS: Therapists can manage their contact preferences
create policy "contact_preferences_all_own"
  on public.contact_preferences for all
  using (
    exists (
      select 1 from public.therapists
      where id = contact_preferences.therapist_id
      and user_id = auth.uid()
    )
  );

-- ============================================================
-- MIGRATION: 20260410000000_client_dashboard_tables.sql
-- ============================================================
-- Create client_favorites table
CREATE TABLE IF NOT EXISTS client_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, therapist_id)
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  results_count INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_client_favorites_user_id ON client_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE client_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_favorites
CREATE POLICY "Users can view their own favorites"
  ON client_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON client_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON client_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for search_history
CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their search history"
  ON search_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION: 20260410000001_reviews_notifications.sql
-- ============================================================
-- Reviews table for client feedback on therapists
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, therapist_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_reviews_therapist ON reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Review helpful votes tracking
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = client_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Review helpful votes policies
CREATE POLICY "Anyone can view helpful votes" ON review_helpful_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON review_helpful_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote" ON review_helpful_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update therapist average rating
CREATE OR REPLACE FUNCTION update_therapist_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE therapist_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0)
      FROM reviews
      WHERE therapist_id = COALESCE(NEW.therapist_id, OLD.therapist_id)
      AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE therapist_id = COALESCE(NEW.therapist_id, OLD.therapist_id)
      AND is_public = true
    )
  WHERE id = COALESCE(NEW.therapist_id, OLD.therapist_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update rating
DROP TRIGGER IF EXISTS trigger_update_therapist_rating ON reviews;
CREATE TRIGGER trigger_update_therapist_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_therapist_rating();

-- ============================================================
-- MIGRATION: 20260410110000_client_dashboard_search_foundation.sql
-- ============================================================
create table if not exists public.client_favorites (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users (id) on delete cascade,
  therapist_profile_id uuid not null references public.profiles (id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (client_user_id, therapist_profile_id)
);

create index if not exists idx_client_favorites_client on public.client_favorites (client_user_id);
create index if not exists idx_client_favorites_therapist on public.client_favorites (therapist_profile_id);

drop trigger if exists trg_client_favorites_set_updated_at on public.client_favorites;
create trigger trg_client_favorites_set_updated_at
before update on public.client_favorites
for each row execute function public.set_updated_at();

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users (id) on delete cascade,
  query text not null,
  filters jsonb not null default '{}'::jsonb,
  result_count integer,
  searched_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_search_history_client on public.search_history (client_user_id, searched_at desc);

alter table public.profiles
  add column if not exists preferred_budget_min integer,
  add column if not exists preferred_budget_max integer,
  add column if not exists preferred_specialties text[] not null default '{}'::text[],
  add column if not exists preferred_languages text[] not null default '{}'::text[],
  add column if not exists preferred_radius_miles integer;

alter table public.client_favorites enable row level security;
alter table public.search_history enable row level security;

drop policy if exists "client_favorites_select_own" on public.client_favorites;
create policy "client_favorites_select_own" on public.client_favorites
for select using (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "client_favorites_insert_own" on public.client_favorites;
create policy "client_favorites_insert_own" on public.client_favorites
for insert with check (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "client_favorites_update_own" on public.client_favorites;
create policy "client_favorites_update_own" on public.client_favorites
for update using (client_user_id = auth.uid() or public.is_admin())
with check (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "client_favorites_delete_own" on public.client_favorites;
create policy "client_favorites_delete_own" on public.client_favorites
for delete using (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "search_history_select_own" on public.search_history;
create policy "search_history_select_own" on public.search_history
for select using (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "search_history_insert_own" on public.search_history;
create policy "search_history_insert_own" on public.search_history
for insert with check (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "search_history_delete_own" on public.search_history;
create policy "search_history_delete_own" on public.search_history
for delete using (client_user_id = auth.uid() or public.is_admin());

-- ============================================================
-- MIGRATION: 20260413100000_multichannel_notifications.sql
-- ============================================================
-- Multi-channel notification preferences and delivery tracking
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  marketing_enabled BOOLEAN NOT NULL DEFAULT false,
  phone_e164 TEXT,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  destination TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')),
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_created
  ON notification_deliveries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification
  ON notification_deliveries(notification_id);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can view their own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can upsert their own notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can update their own notification preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view their own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can create their own push subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notification deliveries" ON notification_deliveries;
CREATE POLICY "Users can view their own notification deliveries" ON notification_deliveries
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER trigger_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trigger_push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_timestamp_updated_at();
COMMIT;

-- Quick verification helpers (run separately, optional):
-- SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 20;
