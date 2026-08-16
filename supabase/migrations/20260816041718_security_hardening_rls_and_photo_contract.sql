-- Security hardening for browser-facing grants and legacy public policies.
-- Canonical application access to these datasets is server-side via service_role
-- or through narrowly scoped RLS on active tables such as profile_photos.

-- Legacy / backend-only tables must not be queryable directly from browser roles.
REVOKE ALL PRIVILEGES ON TABLE public.analytics_events FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.profile_sections FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.therapist_locations FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.therapist_photos FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.therapist_pricing FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.therapist_services FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.upgrade_opportunities FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.visibility_addons FROM anon, authenticated;

-- Bruno agent configuration contains operational details such as exact_address.
-- It is server-only; public clients must never query the table directly.
DROP POLICY IF EXISTS "anon read bruno config" ON public.bruno_agent_config;
DROP POLICY IF EXISTS "anon read bruno_agent_config" ON public.bruno_agent_config;
REVOKE ALL PRIVILEGES ON TABLE public.bruno_agent_config FROM anon, authenticated;

-- Remove broad legacy read policies. Current application access is mediated by
-- server routes, while narrower owner/admin/subscriber policies remain intact.
DROP POLICY IF EXISTS "demand_scores_public_read" ON public.demand_scores;
DROP POLICY IF EXISTS "imported_reviews_public_read" ON public.imported_reviews;
DROP POLICY IF EXISTS "contact_preferences_public_read" ON public.contact_preferences;

-- Canonical photo contract:
--   profile_photos.storage_path = Supabase Storage object key when applicable
--   profile_photos.url          = display/public URL
-- Preserve external Cloudinary URLs as legacy storage_path values because no
-- Supabase object key can be reconstructed for those assets.
UPDATE public.profile_photos
SET url = storage_path,
    updated_at = timezone('utc'::text, now())
WHERE (url IS NULL OR btrim(url) = '')
  AND storage_path ~* '^https?://';

UPDATE public.profile_photos
SET storage_path = regexp_replace(
      storage_path,
      '^https?://[^/]+/storage/v1/object/public/therapist-photos/',
      '',
      'i'
    ),
    updated_at = timezone('utc'::text, now())
WHERE storage_path ~* '^https?://[^/]+/storage/v1/object/public/therapist-photos/';

COMMENT ON TABLE public.therapist_photos IS
  'Legacy photo table. Active provider and admin photo workflows use public.profile_photos.';

COMMENT ON COLUMN public.profile_photos.storage_path IS
  'Supabase Storage object key for newly uploaded assets; legacy external assets may retain an absolute URL.';

COMMENT ON COLUMN public.profile_photos.url IS
  'Display URL for the photo, including legacy external Cloudinary assets.';
