-- ============================================================
-- MIGRATION: fix_rls_policies_launch_v3
-- RLS policies with correct column names + performance indexes
-- ============================================================
--
-- Several tables below (appointments, favorites, conversations, messages,
-- payment_transactions, user_mfa, mfa_pending, user_suspensions, …) and a few
-- profiles columns used by the indexes (boost_score, canonical_city_slug,
-- is_demo) are production-only objects that no committed migration creates. On
-- production they exist and every statement applies; on a fresh database (the
-- Supabase branch preview, local `db reset`) they don't, which made this whole
-- migration abort with 42703/42P01 and blocked every migration after it.
--
-- Each section is wrapped so a missing table/column is skipped with a NOTICE
-- instead of aborting. Where the schema is correct nothing changes; where an
-- object is absent that section is simply not applied. `undefined_object`
-- covers a missing policy target; all handlers also catch `undefined_column`
-- and `undefined_table`.

DO $$ BEGIN

-- 1. APPOINTMENTS (has: user_id, profile_id, therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Users can view own appointments') THEN
  CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Users can insert own appointments') THEN
  CREATE POLICY "Users can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF;

-- 2. FAVORITES (has: user_id, profile_id, therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='Users can manage own favorites') THEN
  CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
END IF;

-- 3. CONVERSATIONS (has: user_id, profile_id, therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='Users can view own conversations') THEN
  CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id OR auth.uid() = therapist_id);
END IF;

-- 4. MESSAGES (has: id only — no user/profile col, link via conversation)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can view own messages') THEN
  CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.id
        AND (c.user_id = auth.uid() OR c.therapist_id = auth.uid())
    ));
END IF;

-- 5. PAYMENT_TRANSACTIONS (has: user_id, therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_transactions' AND policyname='Users can view own payment transactions') THEN
  CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = therapist_id);
END IF;

-- 6. THERAPIST_AVAILABILITY (has: profile_id, therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='therapist_availability' AND policyname='Public can read availability') THEN
  CREATE POLICY "Public can read availability" ON public.therapist_availability FOR SELECT USING (true);
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='therapist_availability' AND policyname='Provider can manage own availability') THEN
  CREATE POLICY "Provider can manage own availability" ON public.therapist_availability FOR ALL
    USING (auth.uid() = therapist_id);
END IF;

-- 7. SITE_SETTINGS (no user col — admin only via profiles)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='Admins can manage site settings') THEN
  CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

-- 8. USER_MFA (has: user_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_mfa' AND policyname='Users can manage own MFA') THEN
  CREATE POLICY "Users can manage own MFA" ON public.user_mfa FOR ALL USING (auth.uid() = user_id);
END IF;

-- 9. MFA_PENDING (has: user_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mfa_pending' AND policyname='Users can manage own MFA pending') THEN
  CREATE POLICY "Users can manage own MFA pending" ON public.mfa_pending FOR ALL USING (auth.uid() = user_id);
END IF;

-- 10. USER_SUSPENSIONS (has: user_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_suspensions' AND policyname='Admins can manage suspensions') THEN
  CREATE POLICY "Admins can manage suspensions" ON public.user_suspensions FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

-- 11. PHOTO_MODERATIONS (has: therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_moderations' AND policyname='Admins can manage photo moderations') THEN
  CREATE POLICY "Admins can manage photo moderations" ON public.photo_moderations FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

-- 12. PROFILE_REPORTS (has: profile_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_reports' AND policyname='Admins can manage profile reports') THEN
  CREATE POLICY "Admins can manage profile reports" ON public.profile_reports FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

-- 13. LOG TABLES (have: profile_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_status_debug_log' AND policyname='Admins can view debug logs') THEN
  CREATE POLICY "Admins can view debug logs" ON public.profile_status_debug_log FOR SELECT
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_status_invalid_log' AND policyname='Admins can view invalid status logs') THEN
  CREATE POLICY "Admins can view invalid status logs" ON public.profile_status_invalid_log FOR SELECT
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

-- 14. IMPORTED_PROFILE_DATA (has: profile_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='imported_profile_data' AND policyname='Admins can manage imported profile data') THEN
  CREATE POLICY "Admins can manage imported profile data" ON public.imported_profile_data FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

-- 15. THERAPIST_LEARNING_SCORES (has: profile_id, therapist_id)
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='therapist_learning_scores' AND policyname='Admins can manage learning scores') THEN
  CREATE POLICY "Admins can manage learning scores" ON public.therapist_learning_scores FOR ALL
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
END IF;

EXCEPTION
  WHEN undefined_column OR undefined_table OR undefined_object THEN
    RAISE NOTICE 'fix_rls_policies_launch_v3: skipped RLS policies for an absent production-only table/column (fresh/branch DB): %', SQLERRM;
END $$;

-- ============================================================
-- FIX OVERLY PERMISSIVE POLICIES
-- ============================================================

-- KEYWORD_TRENDS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read and write keyword_trends" ON public.keyword_trends;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='keyword_trends' AND policyname='Public read keyword_trends') THEN
    CREATE POLICY "Public read keyword_trends" ON public.keyword_trends FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='keyword_trends' AND policyname='Service role write keyword_trends') THEN
    CREATE POLICY "Service role write keyword_trends" ON public.keyword_trends FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
EXCEPTION
  WHEN undefined_column OR undefined_table OR undefined_object THEN
    RAISE NOTICE 'fix_rls_policies_launch_v3: skipped keyword_trends policies (absent on this DB): %', SQLERRM;
END $$;

-- PROFILE_DOCUMENTS (has: profile_id — use that)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their own documents" ON public.profile_documents;
  DROP POLICY IF EXISTS "Users can insert their own documents" ON public.profile_documents;
  DROP POLICY IF EXISTS "Users can update their own documents" ON public.profile_documents;
  CREATE POLICY "Users can delete their own documents" ON public.profile_documents FOR DELETE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
  CREATE POLICY "Users can insert their own documents" ON public.profile_documents FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
  CREATE POLICY "Users can update their own documents" ON public.profile_documents FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
EXCEPTION
  WHEN undefined_column OR undefined_table OR undefined_object THEN
    RAISE NOTICE 'fix_rls_policies_launch_v3: skipped profile_documents policies (absent on this DB): %', SQLERRM;
END $$;

-- REVIEWS
DO $$ BEGIN
  DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Authenticated users insert own reviews') THEN
    CREATE POLICY "Authenticated users insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
EXCEPTION
  WHEN undefined_column OR undefined_table OR undefined_object THEN
    RAISE NOTICE 'fix_rls_policies_launch_v3: skipped reviews policies (absent on this DB): %', SQLERRM;
END $$;

-- ============================================================
-- PERFORMANCE INDEXES
-- Wrapped so an index on a profiles column that is absent on a fresh DB
-- (boost_score / canonical_city_slug / is_demo are production-only) is skipped
-- rather than aborting the migration.
-- ============================================================

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_directory
    ON profiles(city, visibility_status, profile_status)
    WHERE visibility_status = 'public' AND profile_status = 'approved';
EXCEPTION WHEN undefined_column OR undefined_table THEN
  RAISE NOTICE 'fix_rls_policies_launch_v3: skipped idx_profiles_directory: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_ranking
    ON profiles(is_featured DESC, boost_score DESC)
    WHERE visibility_status = 'public' AND is_demo = false;
EXCEPTION WHEN undefined_column OR undefined_table THEN
  RAISE NOTICE 'fix_rls_policies_launch_v3: skipped idx_profiles_ranking: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_slug
    ON profiles(slug)
    WHERE slug IS NOT NULL;
EXCEPTION WHEN undefined_column OR undefined_table THEN
  RAISE NOTICE 'fix_rls_policies_launch_v3: skipped idx_profiles_slug: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_canonical_city
    ON profiles(canonical_city_slug)
    WHERE canonical_city_slug IS NOT NULL AND visibility_status = 'public';
EXCEPTION WHEN undefined_column OR undefined_table THEN
  RAISE NOTICE 'fix_rls_policies_launch_v3: skipped idx_profiles_canonical_city: %', SQLERRM;
END $$;
