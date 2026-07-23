-- ============================================================
-- MIGRATION: fix_rls_policies_launch_v3
-- Branch-safe RLS policies and performance indexes.
-- Optional legacy tables are not present on every clean preview branch, so
-- every policy and index is guarded by relation and column checks.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.appointments') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='user_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Users can view own appointments') THEN
    CREATE POLICY "Users can view own appointments" ON public.appointments
      FOR SELECT USING ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.appointments') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='user_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Users can insert own appointments') THEN
    CREATE POLICY "Users can insert own appointments" ON public.appointments
      FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.favorites') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='favorites' AND column_name='user_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='Users can manage own favorites') THEN
    CREATE POLICY "Users can manage own favorites" ON public.favorites
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.conversations') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='therapist_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='Users can view own conversations') THEN
    CREATE POLICY "Users can view own conversations" ON public.conversations
      FOR SELECT USING ((select auth.uid()) = user_id OR (select auth.uid()) = therapist_id);
  END IF;

  IF to_regclass('public.messages') IS NOT NULL
     AND to_regclass('public.conversations') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='conversation_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='therapist_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can view own messages') THEN
    CREATE POLICY "Users can view own messages" ON public.messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = messages.conversation_id
            AND (c.user_id = (select auth.uid()) OR c.therapist_id = (select auth.uid()))
        )
      );
  END IF;

  IF to_regclass('public.payment_transactions') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payment_transactions' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payment_transactions' AND column_name='therapist_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_transactions' AND policyname='Users can view own payment transactions') THEN
    CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
      FOR SELECT USING ((select auth.uid()) = user_id OR (select auth.uid()) = therapist_id);
  END IF;

  IF to_regclass('public.therapist_availability') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='therapist_availability' AND policyname='Public can read availability') THEN
    CREATE POLICY "Public can read availability" ON public.therapist_availability
      FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.therapist_availability') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='therapist_availability' AND column_name='therapist_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='therapist_availability' AND policyname='Provider can manage own availability') THEN
    CREATE POLICY "Provider can manage own availability" ON public.therapist_availability
      FOR ALL USING ((select auth.uid()) = therapist_id)
      WITH CHECK ((select auth.uid()) = therapist_id);
  END IF;

  IF to_regclass('public.site_settings') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='Admins can manage site settings') THEN
    CREATE POLICY "Admins can manage site settings" ON public.site_settings
      FOR ALL USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin')
      WITH CHECK ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.user_mfa') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_mfa' AND column_name='user_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_mfa' AND policyname='Users can manage own MFA') THEN
    CREATE POLICY "Users can manage own MFA" ON public.user_mfa
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.mfa_pending') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='mfa_pending' AND column_name='user_id')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mfa_pending' AND policyname='Users can manage own MFA pending') THEN
    CREATE POLICY "Users can manage own MFA pending" ON public.mfa_pending
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.user_suspensions') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_suspensions' AND policyname='Admins can manage suspensions') THEN
    CREATE POLICY "Admins can manage suspensions" ON public.user_suspensions
      FOR ALL USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin')
      WITH CHECK ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.photo_moderations') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_moderations' AND policyname='Admins can manage photo moderations') THEN
    CREATE POLICY "Admins can manage photo moderations" ON public.photo_moderations
      FOR ALL USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin')
      WITH CHECK ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.profile_reports') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_reports' AND policyname='Admins can manage profile reports') THEN
    CREATE POLICY "Admins can manage profile reports" ON public.profile_reports
      FOR ALL USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin')
      WITH CHECK ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.profile_status_debug_log') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_status_debug_log' AND policyname='Admins can view debug logs') THEN
    CREATE POLICY "Admins can view debug logs" ON public.profile_status_debug_log
      FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.profile_status_invalid_log') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_status_invalid_log' AND policyname='Admins can view invalid status logs') THEN
    CREATE POLICY "Admins can view invalid status logs" ON public.profile_status_invalid_log
      FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.imported_profile_data') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='imported_profile_data' AND policyname='Admins can manage imported profile data') THEN
    CREATE POLICY "Admins can manage imported profile data" ON public.imported_profile_data
      FOR ALL USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin')
      WITH CHECK ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;

  IF to_regclass('public.therapist_learning_scores') IS NOT NULL
     AND to_regclass('public.profiles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='therapist_learning_scores' AND policyname='Admins can manage learning scores') THEN
    CREATE POLICY "Admins can manage learning scores" ON public.therapist_learning_scores
      FOR ALL USING ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin')
      WITH CHECK ((SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin');
  END IF;
END
$$;

-- Replace overly permissive keyword-trend policies when the table exists.
DO $$
BEGIN
  IF to_regclass('public.keyword_trends') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can read and write keyword_trends" ON public.keyword_trends;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='keyword_trends' AND policyname='Public read keyword_trends') THEN
      CREATE POLICY "Public read keyword_trends" ON public.keyword_trends FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='keyword_trends' AND policyname='Service role write keyword_trends') THEN
      CREATE POLICY "Service role write keyword_trends" ON public.keyword_trends
        FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');
    END IF;
  END IF;
END
$$;

-- Profile documents are optional on a clean branch.
DO $$
BEGIN
  IF to_regclass('public.profile_documents') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profile_documents' AND column_name='profile_id') THEN
    DROP POLICY IF EXISTS "Users can delete their own documents" ON public.profile_documents;
    DROP POLICY IF EXISTS "Users can insert their own documents" ON public.profile_documents;
    DROP POLICY IF EXISTS "Users can update their own documents" ON public.profile_documents;
    CREATE POLICY "Users can delete their own documents" ON public.profile_documents FOR DELETE
      USING ((select auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id));
    CREATE POLICY "Users can insert their own documents" ON public.profile_documents FOR INSERT
      WITH CHECK ((select auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id));
    CREATE POLICY "Users can update their own documents" ON public.profile_documents FOR UPDATE
      USING ((select auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id))
      WITH CHECK ((select auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL THEN
    DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Authenticated users insert own reviews') THEN
      CREATE POLICY "Authenticated users insert own reviews" ON public.reviews
        FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);
    END IF;
  END IF;
END
$$;

-- Performance indexes are created only when their target relation exists.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'create index if not exists idx_profiles_directory on public.profiles(city, visibility_status, profile_status) where visibility_status=''public'' and profile_status=''approved''';
    EXECUTE 'create index if not exists idx_profiles_ranking on public.profiles(is_featured desc, boost_score desc) where visibility_status=''public'' and is_demo=false';
    EXECUTE 'create index if not exists idx_profiles_slug on public.profiles(slug) where slug is not null';
    EXECUTE 'create index if not exists idx_profiles_canonical_city on public.profiles(canonical_city_slug) where canonical_city_slug is not null and visibility_status=''public''';
  END IF;
END
$$;
