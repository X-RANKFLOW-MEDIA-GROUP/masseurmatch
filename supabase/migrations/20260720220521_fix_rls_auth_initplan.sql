-- ========================================
-- FIX: RLS Auth Init Plan
-- Branch-safe policy replacements.
-- ========================================

DO $$
BEGIN
  IF to_regclass('public.client_favorites') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='client_favorites' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='client_favorites' AND column_name='client_user_id') THEN
    DROP POLICY IF EXISTS client_favorites_own ON public.client_favorites;
    CREATE POLICY client_favorites_own ON public.client_favorites
      USING ((select auth.uid()) = user_id OR (select auth.uid()) = client_user_id)
      WITH CHECK ((select auth.uid()) = user_id OR (select auth.uid()) = client_user_id);
  END IF;

  IF to_regclass('public.notification_deliveries') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_deliveries' AND column_name='user_id') THEN
    DROP POLICY IF EXISTS notification_deliveries_own_read ON public.notification_deliveries;
    CREATE POLICY notification_deliveries_own_read ON public.notification_deliveries
      FOR SELECT USING ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.push_subscriptions') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='push_subscriptions' AND column_name='user_id') THEN
    DROP POLICY IF EXISTS push_subscriptions_own ON public.push_subscriptions;
    CREATE POLICY push_subscriptions_own ON public.push_subscriptions
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.user_notification_preferences') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_notification_preferences' AND column_name='user_id') THEN
    DROP POLICY IF EXISTS user_notification_prefs_own ON public.user_notification_preferences;
    CREATE POLICY user_notification_prefs_own ON public.user_notification_preferences
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.provider_travel') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='provider_travel' AND column_name='profile_id') THEN
    DROP POLICY IF EXISTS provider_travel_own ON public.provider_travel;
    CREATE POLICY provider_travel_own ON public.provider_travel
      USING ((select auth.uid()) = (
        SELECT profiles.user_id FROM public.profiles
        WHERE profiles.id = provider_travel.profile_id
        LIMIT 1
      ))
      WITH CHECK ((select auth.uid()) = (
        SELECT profiles.user_id FROM public.profiles
        WHERE profiles.id = provider_travel.profile_id
        LIMIT 1
      ));
  END IF;

  IF to_regclass('public.contact_inquiries') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_inquiries' AND column_name='profile_id') THEN
    DROP POLICY IF EXISTS "providers can view own inquiries" ON public.contact_inquiries;
    CREATE POLICY "providers can view own inquiries" ON public.contact_inquiries
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = contact_inquiries.profile_id
          AND profiles.user_id = (select auth.uid())
      ));

    DROP POLICY IF EXISTS "providers can update own inquiries" ON public.contact_inquiries;
    CREATE POLICY "providers can update own inquiries" ON public.contact_inquiries
      FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = contact_inquiries.profile_id
          AND profiles.user_id = (select auth.uid())
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = contact_inquiries.profile_id
          AND profiles.user_id = (select auth.uid())
      ));

    DROP POLICY IF EXISTS contact_inquiries_select_own ON public.contact_inquiries;
    CREATE POLICY contact_inquiries_select_own ON public.contact_inquiries
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = contact_inquiries.profile_id
          AND profiles.user_id = (select auth.uid())
      ));

    DROP POLICY IF EXISTS contact_inquiries_update_own ON public.contact_inquiries;
    CREATE POLICY contact_inquiries_update_own ON public.contact_inquiries
      FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = contact_inquiries.profile_id
          AND profiles.user_id = (select auth.uid())
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = contact_inquiries.profile_id
          AND profiles.user_id = (select auth.uid())
      ));
  END IF;

  IF to_regclass('public.ranking_events') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ranking_events' AND column_name='therapist_id') THEN
    DROP POLICY IF EXISTS ranking_events_owner_select ON public.ranking_events;
    CREATE POLICY ranking_events_owner_select ON public.ranking_events
      FOR SELECT USING (therapist_id IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = (select auth.uid())
      ));

    DROP POLICY IF EXISTS ranking_events_owner_insert ON public.ranking_events;
    CREATE POLICY ranking_events_owner_insert ON public.ranking_events
      FOR INSERT WITH CHECK (therapist_id IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = (select auth.uid())
      ));

    DROP POLICY IF EXISTS ranking_events_owner_update ON public.ranking_events;
    CREATE POLICY ranking_events_owner_update ON public.ranking_events
      FOR UPDATE USING (therapist_id IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = (select auth.uid())
      ))
      WITH CHECK (therapist_id IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = (select auth.uid())
      ));

    DROP POLICY IF EXISTS ranking_events_owner_delete ON public.ranking_events;
    CREATE POLICY ranking_events_owner_delete ON public.ranking_events
      FOR DELETE USING (therapist_id IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = (select auth.uid())
      ));
  END IF;
END
$$;
