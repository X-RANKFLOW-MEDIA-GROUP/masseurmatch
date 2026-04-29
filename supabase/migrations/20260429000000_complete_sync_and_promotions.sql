-- ============================================================
-- MasseurMatch: Complete Sync, Promotions, and Subscriptions
-- Additive-only migration
-- ============================================================

-- 1. Ensure all required profile fields exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number      text,
  ADD COLUMN IF NOT EXISTS email_address         text,
  ADD COLUMN IF NOT EXISTS offers_incall         boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS offers_outcall        boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS outcall_radius        integer,
  ADD COLUMN IF NOT EXISTS seo_title             text,
  ADD COLUMN IF NOT EXISTS seo_description       text,
  ADD COLUMN IF NOT EXISTS seo_keywords          text[],
  ADD COLUMN IF NOT EXISTS stripe_customer_id    text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS current_period_end    timestamptz,
  ADD COLUMN IF NOT EXISTS photo_limit           integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS visibility_level      integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS featured_until        timestamptz;

-- 1.1 Add verification_code to text_verifications
ALTER TABLE public.text_verifications
  ADD COLUMN IF NOT EXISTS verification_code    text;

-- 2. Create promotions table for better management (optional but requested for "manageable with smallest safe change")
-- The brief says: "If profiles.promotions json field already exists, use it."
-- It exists, so we will use the JSONB field for now to save credits and complexity, 
-- but we'll add a helper view or index if needed.

-- 3. Ensure site_settings has all required fields (already mostly there from previous migration)
-- Just adding any missing ones from the brief
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_analytics_id   text,
  ADD COLUMN IF NOT EXISTS facebook_pixel_id     text;

-- 4. Add audit log for promotions if we were using a table, but we'll use profiles audit.

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON public.profiles (stripe_subscription_id);
