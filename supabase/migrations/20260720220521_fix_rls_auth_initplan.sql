-- ========================================
-- FIX: RLS Auth Init Plan
-- Replace auth.uid() with (select auth.uid())
-- ========================================

-- client_favorites
DROP POLICY IF EXISTS client_favorites_own ON public.client_favorites;
CREATE POLICY client_favorites_own ON public.client_favorites
  USING ((select auth.uid()) = user_id OR (select auth.uid()) = client_user_id);

-- notification_deliveries
DROP POLICY IF EXISTS notification_deliveries_own_read ON public.notification_deliveries;
CREATE POLICY notification_deliveries_own_read ON public.notification_deliveries
  FOR SELECT USING ((select auth.uid()) = user_id);

-- push_subscriptions
DROP POLICY IF EXISTS push_subscriptions_own ON public.push_subscriptions;
CREATE POLICY push_subscriptions_own ON public.push_subscriptions
  USING ((select auth.uid()) = user_id);

-- user_notification_preferences
DROP POLICY IF EXISTS user_notification_prefs_own ON public.user_notification_preferences;
CREATE POLICY user_notification_prefs_own ON public.user_notification_preferences
  USING ((select auth.uid()) = user_id);

-- provider_travel (production-only table; absent on a fresh/branch DB, so guard
-- so its absence skips rather than aborts the migration chain)
DO $$ BEGIN
  DROP POLICY IF EXISTS provider_travel_own ON public.provider_travel;
  CREATE POLICY provider_travel_own ON public.provider_travel
    USING ((select auth.uid()) = ( SELECT profiles.user_id FROM profiles WHERE profiles.id = provider_travel.profile_id LIMIT 1));
EXCEPTION WHEN undefined_table OR undefined_column OR undefined_object THEN
  RAISE NOTICE 'fix_rls_auth_initplan: skipped provider_travel policy (absent on this DB): %', SQLERRM;
END $$;

-- contact_inquiries
DROP POLICY IF EXISTS "providers can view own inquiries" ON public.contact_inquiries;
CREATE POLICY "providers can view own inquiries" ON public.contact_inquiries
  FOR SELECT USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = contact_inquiries.profile_id AND profiles.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "providers can update own inquiries" ON public.contact_inquiries;
CREATE POLICY "providers can update own inquiries" ON public.contact_inquiries
  FOR UPDATE USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = contact_inquiries.profile_id AND profiles.user_id = (select auth.uid())))
  WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = contact_inquiries.profile_id AND profiles.user_id = (select auth.uid())));

DROP POLICY IF EXISTS contact_inquiries_select_own ON public.contact_inquiries;
CREATE POLICY contact_inquiries_select_own ON public.contact_inquiries
  FOR SELECT USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = contact_inquiries.profile_id AND profiles.user_id = (select auth.uid())));

DROP POLICY IF EXISTS contact_inquiries_update_own ON public.contact_inquiries;
CREATE POLICY contact_inquiries_update_own ON public.contact_inquiries
  FOR UPDATE USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = contact_inquiries.profile_id AND profiles.user_id = (select auth.uid())));

-- ranking_events
DROP POLICY IF EXISTS ranking_events_owner_select ON public.ranking_events;
CREATE POLICY ranking_events_owner_select ON public.ranking_events
  FOR SELECT USING (profile_id IN ( SELECT p.id FROM profiles p WHERE p.user_id = (select auth.uid())));

DROP POLICY IF EXISTS ranking_events_owner_insert ON public.ranking_events;
CREATE POLICY ranking_events_owner_insert ON public.ranking_events
  FOR INSERT WITH CHECK (profile_id IN ( SELECT p.id FROM profiles p WHERE p.user_id = (select auth.uid())));

DROP POLICY IF EXISTS ranking_events_owner_update ON public.ranking_events;
CREATE POLICY ranking_events_owner_update ON public.ranking_events
  FOR UPDATE USING (profile_id IN ( SELECT p.id FROM profiles p WHERE p.user_id = (select auth.uid())))
  WITH CHECK (profile_id IN ( SELECT p.id FROM profiles p WHERE p.user_id = (select auth.uid())));

DROP POLICY IF EXISTS ranking_events_owner_delete ON public.ranking_events;
CREATE POLICY ranking_events_owner_delete ON public.ranking_events
  FOR DELETE USING (profile_id IN ( SELECT p.id FROM profiles p WHERE p.user_id = (select auth.uid())));
