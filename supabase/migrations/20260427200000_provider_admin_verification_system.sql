-- ============================================================
-- MasseurMatch: Provider / Admin / Verification / Photos / Public Profiles
-- Additive-only migration – no drops, no renames, no data loss
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. site_settings singleton
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id                           text PRIMARY KEY DEFAULT 'singleton',
  require_identity_verification boolean NOT NULL DEFAULT true,
  require_text_verification     boolean NOT NULL DEFAULT true,
  require_photo_review          boolean NOT NULL DEFAULT true,
  require_manual_profile_review boolean NOT NULL DEFAULT true,
  allow_public_profiles         boolean NOT NULL DEFAULT true,
  max_free_photos               integer NOT NULL DEFAULT 2,
  max_standard_photos           integer NOT NULL DEFAULT 6,
  max_pro_photos                integer NOT NULL DEFAULT 12,
  max_elite_photos              integer NOT NULL DEFAULT 20,
  maintenance_mode              boolean NOT NULL DEFAULT false,
  signup_enabled                boolean NOT NULL DEFAULT true,
  support_email                 text    NOT NULL DEFAULT 'support@masseurmatch.com',
  billing_email                 text    NOT NULL DEFAULT 'billing@masseurmatch.com',
  legal_email                   text    NOT NULL DEFAULT 'legal@masseurmatch.com',
  updated_at                    timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by                    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ensure exactly one row exists
INSERT INTO public.site_settings (id) VALUES ('singleton')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_all" ON public.site_settings;
CREATE POLICY "site_settings_select_all"
  ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
CREATE POLICY "site_settings_update_admin"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 2. text_verifications
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.text_verifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         text NOT NULL,
  status        text NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started','pending','verified','failed','expired')),
  provider      text,
  attempt_count integer NOT NULL DEFAULT 0,
  sent_at       timestamptz,
  verified_at   timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at    timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_text_verifications_user
  ON public.text_verifications (user_id, status);

ALTER TABLE public.text_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "text_verifications_select_own" ON public.text_verifications;
CREATE POLICY "text_verifications_select_own"
  ON public.text_verifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "text_verifications_insert_own" ON public.text_verifications;
CREATE POLICY "text_verifications_insert_own"
  ON public.text_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "text_verifications_update_own_or_admin" ON public.text_verifications;
CREATE POLICY "text_verifications_update_own_or_admin"
  ON public.text_verifications FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 3. therapist_photos  (replaces/extends profile_photos)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.therapist_photos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id       uuid,   -- soft ref to profiles.id
  storage_path     text,
  public_url       text,
  photo_type       text NOT NULL DEFAULT 'gallery'
                     CHECK (photo_type IN ('profile','gallery')),
  status           text NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','pending_review','approved','rejected','removed')),
  rejection_reason text,
  sort_order       integer NOT NULL DEFAULT 0,
  width            integer,
  height           integer,
  file_size        bigint,
  mime_type        text,
  reviewed_at      timestamptz,
  reviewed_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_therapist_photos_user
  ON public.therapist_photos (user_id, status);
CREATE INDEX IF NOT EXISTS idx_therapist_photos_profile
  ON public.therapist_photos (profile_id, status);
CREATE INDEX IF NOT EXISTS idx_therapist_photos_pending
  ON public.therapist_photos (status, created_at)
  WHERE status = 'pending_review';

ALTER TABLE public.therapist_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist_photos_select_own_or_admin" ON public.therapist_photos;
CREATE POLICY "therapist_photos_select_own_or_admin"
  ON public.therapist_photos FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "therapist_photos_insert_own" ON public.therapist_photos;
CREATE POLICY "therapist_photos_insert_own"
  ON public.therapist_photos FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "therapist_photos_update_own_or_admin" ON public.therapist_photos;
CREATE POLICY "therapist_photos_update_own_or_admin"
  ON public.therapist_photos FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "therapist_photos_delete_own_or_admin" ON public.therapist_photos;
CREATE POLICY "therapist_photos_delete_own_or_admin"
  ON public.therapist_photos FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 4. profile_reviews
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid NOT NULL,   -- soft ref to profiles.id
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'draft'
                      CHECK (status IN (
                        'draft','submitted','under_review',
                        'approved','rejected','changes_requested'
                      )),
  moderation_notes  text,
  submitted_at      timestamptz,
  reviewed_at       timestamptz,
  reviewed_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at        timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_profile_reviews_profile
  ON public.profile_reviews (profile_id, status);
CREATE INDEX IF NOT EXISTS idx_profile_reviews_user
  ON public.profile_reviews (user_id, status);
CREATE INDEX IF NOT EXISTS idx_profile_reviews_pending
  ON public.profile_reviews (status, submitted_at)
  WHERE status IN ('submitted','under_review');

ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_reviews_select_own_or_admin" ON public.profile_reviews;
CREATE POLICY "profile_reviews_select_own_or_admin"
  ON public.profile_reviews FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profile_reviews_insert_own" ON public.profile_reviews;
CREATE POLICY "profile_reviews_insert_own"
  ON public.profile_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profile_reviews_update_own_or_admin" ON public.profile_reviews;
CREATE POLICY "profile_reviews_update_own_or_admin"
  ON public.profile_reviews FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 5. admin_actions log
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type       text NOT NULL,
  target_user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_profile_id uuid,
  reason            text,
  metadata          jsonb,
  created_at        timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin
  ON public.admin_actions (admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user
  ON public.admin_actions (target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type
  ON public.admin_actions (action_type, created_at DESC);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_actions_select_admin" ON public.admin_actions;
CREATE POLICY "admin_actions_select_admin"
  ON public.admin_actions FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin_actions_insert_admin" ON public.admin_actions;
CREATE POLICY "admin_actions_insert_admin"
  ON public.admin_actions FOR INSERT WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 6. Additive columns on profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS slug                   text,
  ADD COLUMN IF NOT EXISTS headline               text,
  ADD COLUMN IF NOT EXISTS years_experience       integer,
  ADD COLUMN IF NOT EXISTS neighborhood           text,
  ADD COLUMN IF NOT EXISTS service_categories     text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_lengths        integer[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS starting_price         integer,
  ADD COLUMN IF NOT EXISTS location_type          text DEFAULT 'incall',
  ADD COLUMN IF NOT EXISTS sms_enabled            boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp               text,
  ADD COLUMN IF NOT EXISTS website                text,
  ADD COLUMN IF NOT EXISTS profile_status         text NOT NULL DEFAULT 'draft'
                              CHECK (profile_status IN (
                                'draft','submitted','under_review',
                                'approved','rejected','changes_requested'
                              )),
  ADD COLUMN IF NOT EXISTS visibility_status      text NOT NULL DEFAULT 'hidden'
                              CHECK (visibility_status IN ('public','hidden')),
  ADD COLUMN IF NOT EXISTS verification_status    text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS subscription_tier      text NOT NULL DEFAULT 'free'
                              CHECK (subscription_tier IN ('free','standard','pro','elite')),
  ADD COLUMN IF NOT EXISTS is_featured            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned              boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completion_score       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS submitted_at           timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at            timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_at            timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_notes       text;

-- Unique slug index (only when slug is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug
  ON public.profiles (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_profile_status
  ON public.profiles (profile_status);
CREATE INDEX IF NOT EXISTS idx_profiles_visibility_status
  ON public.profiles (visibility_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended
  ON public.profiles (is_suspended) WHERE is_suspended = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned
  ON public.profiles (is_banned) WHERE is_banned = true;

-- ─────────────────────────────────────────────────────────────
-- 7. Additive columns on identity_verifications
--    (align with Stripe Identity flow)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.identity_verifications
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS last_error        text;

-- Normalise status check to include Stripe statuses (additive)
ALTER TABLE public.identity_verifications
  DROP CONSTRAINT IF EXISTS identity_verifications_status_check;
ALTER TABLE public.identity_verifications
  ADD CONSTRAINT identity_verifications_status_check
  CHECK (status IN (
    'not_started','pending','processing','verified',
    'requires_input','failed','canceled',
    'reviewing','approved','rejected','expired'
  ));

-- ─────────────────────────────────────────────────────────────
-- 8. updated_at triggers for new tables
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_text_verifications_updated_at ON public.text_verifications;
CREATE TRIGGER trg_text_verifications_updated_at
  BEFORE UPDATE ON public.text_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_therapist_photos_updated_at ON public.therapist_photos;
CREATE TRIGGER trg_therapist_photos_updated_at
  BEFORE UPDATE ON public.therapist_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profile_reviews_updated_at ON public.profile_reviews;
CREATE TRIGGER trg_profile_reviews_updated_at
  BEFORE UPDATE ON public.profile_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
