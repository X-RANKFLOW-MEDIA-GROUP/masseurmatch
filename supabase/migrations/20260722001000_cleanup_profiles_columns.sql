-- ============================================================
-- MIGRATION: Cleanup Profiles Columns
-- Remove redundant/unused columns from profiles (87 cols)
-- ============================================================
-- WARNING: This removes columns with low usage
-- Backup before running on production!
--
-- Removed categories:
-- 1. Duplicate contact fields (phone_number, whatsapp, booking_link, etc)
-- 2. Duplicate location fields (primary_area, zip_code, street_reference)
-- 3. Unused/deprecated fields (traveling, visiting, tagline, etc)
-- 4. Redundant status/tier fields (will consolidate)
-- 5. Future-only fields (accessibility_features, studio_amenities, etc)
-- ============================================================

BEGIN;

-- ============================================================
-- BACKUP: Create shadow table to preserve deleted data
-- (Can be dropped after verification in 30 days)
-- ============================================================
CREATE TABLE public.profiles_backup_20260722 AS
SELECT * FROM public.profiles;

ALTER TABLE public.profiles_backup_20260722 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_only_read_backup" ON public.profiles_backup_20260722 FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- DROP UNUSED/REDUNDANT COLUMNS (87 total)
-- ============================================================

-- Duplicate Contact Fields (keep: phone, email_address, website, whatsapp_number, show_email)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_number;     -- duplicate of phone
ALTER TABLE public.profiles DROP COLUMN IF EXISTS whatsapp;         -- duplicate of whatsapp_number
ALTER TABLE public.profiles DROP COLUMN IF EXISTS booking_link;     -- use website instead
ALTER TABLE public.profiles DROP COLUMN IF EXISTS booking_url;      -- duplicate
ALTER TABLE public.profiles DROP COLUMN IF EXISTS contact_email;    -- duplicate of email_address

-- Duplicate Location Fields (keep: city, state, neighborhood, latitude, longitude, canonical_city_slug)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS primary_area;     -- rename of neighborhood
ALTER TABLE public.profiles DROP COLUMN IF EXISTS neighborhood_name; -- description of neighborhood
ALTER TABLE public.profiles DROP COLUMN IF EXISTS zip_code;         -- not used
ALTER TABLE public.profiles DROP COLUMN IF EXISTS street_reference; -- not used
ALTER TABLE public.profiles DROP COLUMN IF EXISTS country;          -- always Brazil, not needed
ALTER TABLE public.profiles DROP COLUMN IF EXISTS location_type;    -- redundant
ALTER TABLE public.profiles DROP COLUMN IF EXISTS map_enabled;      -- UI config, not data

-- Duplicate/Redundant Price Fields (keep: starting_price, pricing_sessions, add_ons)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS incall_price;     -- use pricing_sessions JSONB
ALTER TABLE public.profiles DROP COLUMN IF EXISTS outcall_price;    -- use pricing_sessions JSONB
ALTER TABLE public.profiles DROP COLUMN IF EXISTS starting_rate;    -- duplicate of starting_price
ALTER TABLE public.profiles DROP COLUMN IF EXISTS price_min;        -- use pricing_sessions
ALTER TABLE public.profiles DROP COLUMN IF EXISTS price_max;        -- use pricing_sessions
ALTER TABLE public.profiles DROP COLUMN IF EXISTS session_duration; -- use pricing_sessions
ALTER TABLE public.profiles DROP COLUMN IF EXISTS session_lengths;  -- use pricing_sessions
ALTER TABLE public.profiles DROP COLUMN IF EXISTS rates;            -- duplicate of pricing_sessions

-- Duplicate Hours/Schedule (keep: business_hours, travel_schedule)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS studio_hours;     -- use business_hours JSONB
ALTER TABLE public.profiles DROP COLUMN IF EXISTS mobile_hours;     -- use business_hours JSONB
ALTER TABLE public.profiles DROP COLUMN IF EXISTS incall_details;   -- use custom_faq instead
ALTER TABLE public.profiles DROP COLUMN IF EXISTS outcall_details;  -- use custom_faq instead
ALTER TABLE public.profiles DROP COLUMN IF EXISTS availability_note; -- use custom_faq instead

-- Duplicate Education/Training (keep: education, training, certifications)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS education_entries; -- JSONB, not needed

-- Redundant Verification Fields (consolidate to verification_status)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_verified_email;     -- check verification_status
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_verified_phone;     -- check verification_status
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_verified_photos;    -- check verification_status

-- Unused Preference Fields (low adoption)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS accepts_all_genders;   -- not used by app
ALTER TABLE public.profiles DROP COLUMN IF EXISTS accessibility_features; -- future feature
ALTER TABLE public.profiles DROP COLUMN IF EXISTS affiliations;          -- not populated
ALTER TABLE public.profiles DROP COLUMN IF EXISTS studio_amenities;      -- not populated
ALTER TABLE public.profiles DROP COLUMN IF EXISTS massage_setup;         -- not populated
ALTER TABLE public.profiles DROP COLUMN IF EXISTS incall_amenities;      -- not populated
ALTER TABLE public.profiles DROP COLUMN IF EXISTS mobile_extras;         -- not populated
ALTER TABLE public.profiles DROP COLUMN IF EXISTS products_used;         -- not populated
ALTER TABLE public.profiles DROP COLUMN IF EXISTS products_sold;         -- not populated

-- Duplicate Discount Fields (not used)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS regular_discounts;     -- JSONB, not implemented
ALTER TABLE public.profiles DROP COLUMN IF EXISTS day_of_week_discount;  -- JSONB, not implemented
ALTER TABLE public.profiles DROP COLUMN IF EXISTS weekly_special;        -- JSONB, not implemented

-- Unused Status/Tier Fields (consolidate to status, subscription_tier)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;               -- use from auth.users or user_roles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS current_status;     -- use status
ALTER TABLE public.profiles DROP COLUMN IF EXISTS profile_status;     -- use status
ALTER TABLE public.profiles DROP COLUMN IF EXISTS account_status;     -- use status
ALTER TABLE public.profiles DROP COLUMN IF EXISTS _tier;              -- use subscription_tier
ALTER TABLE public.profiles DROP COLUMN IF EXISTS tier;               -- use subscription_tier

-- Duplicate View/Analytics Fields (consolidate)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS profile_views;      -- use view_count
ALTER TABLE public.profiles DROP COLUMN IF EXISTS view_count;         -- duplicate
ALTER TABLE public.profiles DROP COLUMN IF EXISTS rating_average;     -- use average_rating
ALTER TABLE public.profiles DROP COLUMN IF EXISTS inquiry_count;      -- not reliably tracked

-- Redundant Completion Fields (consolidate to profile_completeness %)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS profile_completion_score; -- use profile_completeness
ALTER TABLE public.profiles DROP COLUMN IF EXISTS completion_score;   -- duplicate
ALTER TABLE public.profiles DROP COLUMN IF EXISTS completion_percentage; -- duplicate

-- Removed/Deprecated Fields
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;              -- use email_address or auth.users.email
ALTER TABLE public.profiles DROP COLUMN IF EXISTS tagline;            -- rename of headline, not used
ALTER TABLE public.profiles DROP COLUMN IF EXISTS traveling;          -- vague, use travel_schedule JSONB
ALTER TABLE public.profiles DROP COLUMN IF EXISTS visiting;           -- vague, use travel_schedule JSONB
ALTER TABLE public.profiles DROP COLUMN IF EXISTS business_trips;     -- JSONB, not used
ALTER TABLE public.profiles DROP COLUMN IF EXISTS presentation_video_url; -- not implemented

-- Service Radius Duplicates (keep: outcall_radius_miles)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS service_radius_miles;   -- duplicate
ALTER TABLE public.profiles DROP COLUMN IF EXISTS service_radius_km;      -- duplicate
ALTER TABLE public.profiles DROP COLUMN IF EXISTS travel_destination;     -- not used

-- Social/Marketing (not used for core profile)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS social_media;       -- JSONB, not used
ALTER TABLE public.profiles DROP COLUMN IF EXISTS booking_platform;   -- string, not used

-- Old Subscription Fields (keep: subscription_tier, subscription_status, stripe_customer_id)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS current_period_end;       -- use subscription_current_period_end
ALTER TABLE public.profiles DROP COLUMN IF EXISTS photo_limit;             -- use subscription tier
ALTER TABLE public.profiles DROP COLUMN IF EXISTS visibility_level;        -- use visibility_status
ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription_plan;       -- use subscription_tier name
ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription_current_period_start;  -- not needed
ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription_current_period_end;    -- not needed
ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription_cancel_at_period_end;  -- not needed

-- Unused Identifiers (keep: seo_title, seo_description if SEO still active)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS location_marker_type;    -- map UI config, not data

-- Unused Old Fields
ALTER TABLE public.profiles DROP COLUMN IF EXISTS featured_until;     -- use is_featured + feature expiry
ALTER TABLE public.profiles DROP COLUMN IF EXISTS boost_score;        -- ranking algorithm detail

-- ============================================================
-- VERIFY & SUMMARY
-- ============================================================
DO $$
DECLARE
  col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles';

  RAISE NOTICE 'Profiles table cleanup complete:';
  RAISE NOTICE '  - Remaining columns: %', col_count;
  RAISE NOTICE '  - Backup created: profiles_backup_20260722';
  RAISE NOTICE '  - Can delete backup after 30 days of verification';
END $$;

COMMIT;
