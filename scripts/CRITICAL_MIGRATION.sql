-- ============================================================
-- MASSEURMATCH - CRITICAL MIGRATION
-- Execute this SQL in Supabase Dashboard > SQL Editor
-- This creates the essential tables for user signup to work
-- ============================================================

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.users WHERE id = auth.uid()),
    false
  )
$$;

-- ============================================================
-- 2. USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'therapist' CHECK (role IN ('admin', 'therapist', 'client')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_self_or_admin" ON public.users;
CREATE POLICY "users_select_self_or_admin" ON public.users FOR SELECT 
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "users_insert_self_or_admin" ON public.users;
CREATE POLICY "users_insert_self_or_admin" ON public.users FOR INSERT 
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "users_update_self_or_admin" ON public.users;
CREATE POLICY "users_update_self_or_admin" ON public.users FOR UPDATE 
  USING (id = auth.uid() OR public.is_admin()) 
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- ============================================================
-- 3. USER ROLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'provider' CHECK (role IN ('admin', 'provider', 'client')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_admin" ON public.user_roles FOR INSERT 
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- ============================================================
-- 4. PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email text,
  full_name text,
  display_name text,
  phone text,
  
  -- Profile details
  bio text,
  photo_url text,
  avatar_url text,
  slug text UNIQUE,
  city text,
  state text,
  country text DEFAULT 'US',
  primary_area text,
  
  -- Therapist-specific fields
  specialties text[] DEFAULT '{}',
  modalities text[] DEFAULT '{}',
  modality text,
  massage_techniques text[] DEFAULT '{}',
  languages text[] DEFAULT '{English}',
  languages_spoken text[] DEFAULT '{English}',
  neighborhood_name text,
  tagline text,
  education text,
  certifications text,
  years_experience integer,
  is_active boolean DEFAULT false,
  terms_accepted_at timestamptz,
  add_ons jsonb,
  pricing_sessions jsonb,
  incall_price integer,
  outcall_price integer,
  
  -- Service options
  incall boolean DEFAULT true,
  outcall boolean DEFAULT false,
  traveling boolean DEFAULT false,
  visiting boolean DEFAULT false,
  
  -- Pricing
  price_min integer,
  price_max integer,
  session_duration integer DEFAULT 60,
  
  -- Availability
  available_now boolean DEFAULT false,
  
  -- Verification status
  is_verified_identity boolean DEFAULT false,
  is_verified_email boolean DEFAULT false,
  is_verified_phone boolean DEFAULT false,
  is_verified_profile boolean DEFAULT false,
  is_verified_photos boolean DEFAULT false,
  
  -- Subscription
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'pro', 'elite')),
  subscription_status text DEFAULT 'active',
  stripe_customer_id text,
  stripe_verification_session_id text,
  _tier text,
  
  -- Profile status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'pending_approval', 'approved', 'suspended', 'rejected')),
  profile_completeness integer DEFAULT 0,
  
  -- Stats
  view_count integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  contact_clicks integer DEFAULT 0,
  inquiry_count integer DEFAULT 0,
  review_count integer DEFAULT 0,
  average_rating numeric(3,2),
  
  -- Business info
  business_hours jsonb,
  custom_faq jsonb,
  promotions jsonb,
  travel_schedule jsonb,
  areas_served text[],
  training text,
  outcall_radius_miles integer,
  
  -- Additional profile fields
  lgbtq_affirming boolean DEFAULT false,
  accepts_all_genders boolean DEFAULT true,
  accessibility_features text[],
  height_inches integer,
  weight_lb integer,
  body_type text,
  start_year integer,
  
  -- Availability
  available_now_expires timestamptz,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  approved_at timestamptz,
  last_active_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public_approved" ON public.profiles;
CREATE POLICY "profiles_select_public_approved" ON public.profiles FOR SELECT 
  USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE 
  USING (user_id = auth.uid() OR public.is_admin()) 
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- 5. IDENTITY VERIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid,
  
  -- Make these nullable for Stripe Identity flow
  legal_name_hash text,
  document_type text CHECK (document_type IS NULL OR document_type IN (
    'drivers_license', 'passport', 'state_id', 'military_id', 'driving_license', 'id_card'
  )),
  document_country text DEFAULT 'US',
  document_expiry date,
  document_storage_path text,
  selfie_storage_path text,
  
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'reviewing', 'approved', 'rejected', 'expired', 'verified', 'processing'
  )),
  rejection_reason text,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  
  show_verified_badge boolean NOT NULL DEFAULT true,
  show_first_name boolean NOT NULL DEFAULT false,
  show_verification_date boolean NOT NULL DEFAULT true,
  show_document_type boolean NOT NULL DEFAULT false,
  
  verification_method text NOT NULL DEFAULT 'stripe_identity' CHECK (verification_method IN (
    'manual', 'automated', 'partner_api', 'stripe_identity'
  )),
  stripe_session_id text,
  stripe_verification_session_id text,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user ON public.identity_verifications(user_id, status);

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verifications_select_own" ON public.identity_verifications;
CREATE POLICY "verifications_select_own" ON public.identity_verifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "verifications_insert_own" ON public.identity_verifications;
CREATE POLICY "verifications_insert_own" ON public.identity_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "verifications_update_admin" ON public.identity_verifications;
CREATE POLICY "verifications_update_admin" ON public.identity_verifications FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- 6. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user record
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_app_meta_data->>'role', 'therapist')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

  -- Create profile record
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. AUDIT LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON public.audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_admin_only" ON public.audit_log;
CREATE POLICY "audit_log_admin_only" ON public.audit_log FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 8. LIFECYCLE EMAIL QUEUE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lifecycle_email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_name text,
  segment text,
  campaign_key text,
  flow_key text,
  template_key text,
  send_category text DEFAULT 'transactional',
  subject text NOT NULL,
  body_html text,
  body_text text,
  scheduled_for timestamptz NOT NULL DEFAULT timezone('utc', now()),
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message text,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.lifecycle_email_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON public.lifecycle_email_queue(user_id);

ALTER TABLE public.lifecycle_email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_queue_admin_only" ON public.lifecycle_email_queue;
CREATE POLICY "email_queue_admin_only" ON public.lifecycle_email_queue FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 9. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('therapist-photos', 'therapist-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents',
  'identity-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE! User signup should now work.
-- ============================================================
