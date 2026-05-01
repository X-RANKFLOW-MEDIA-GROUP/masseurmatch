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
