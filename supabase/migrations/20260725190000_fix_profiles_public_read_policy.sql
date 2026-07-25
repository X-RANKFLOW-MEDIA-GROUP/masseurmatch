-- Realign the public-read RLS policy on profiles with the app's approval model.
--
-- The previous policy (20260322000000_rls_audit_fix.sql) gated anonymous reads
-- on the legacy columns `status IN ('active','approved')` — but the approval
-- flow sets `profile_status` / `visibility_status`, and every live profile
-- carries status='pending'. Result: the anon key could read zero profiles and
-- public reads only worked through the service-role client. The directory's
-- documented anon fallback (env-less builds, sitemap prerender) silently
-- returned no rows.
--
-- The app's own public filters (src/app/_lib/directory.ts) are:
--   visibility_status = 'public' AND profile_status = 'approved'
--   AND is_suspended = false
-- This policy mirrors them, plus bans, plus self/admin access.

DROP POLICY IF EXISTS "profiles_public_read_active" ON public.profiles;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_public_read_active" ON public.profiles FOR SELECT USING (
      (
        profile_status = ''approved''
        AND visibility_status = ''public''
        AND COALESCE(is_suspended, false) = false
        AND COALESCE(is_banned, false) = false
      )
      OR user_id = auth.uid()
      OR public.is_admin()
    )';
  END IF;
END $$;
