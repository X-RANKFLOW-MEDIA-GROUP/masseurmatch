-- Several live tables have RLS enabled but zero policies, which blocks every
-- client query (anon and authenticated alike) — photos not loading, checkout
-- and subscription reads failing, admin moderation panel empty.
--
-- This migration adds explicit minimal policies for the launch-critical tables
-- and a safety-net service_role policy for any remaining RLS-on/zero-policy
-- table (service_role bypasses RLS in Supabase, but the explicit policy keeps
-- server flows working under linters/tools that flag policy-less tables and
-- under non-bypass configurations).
--
-- All blocks are guarded with to_regclass so the migration is safe on
-- databases where a given table does not exist.

-- ── therapist_photos ─────────────────────────────────────────────────────────
-- Owner + admin manage their rows; approved photos are publicly readable
-- (they are displayed on public profile pages).
DO $$
BEGIN
  IF to_regclass('public.therapist_photos') IS NULL THEN RETURN; END IF;

  EXECUTE 'DROP POLICY IF EXISTS "therapist_photos_select_own_or_admin" ON public.therapist_photos';
  EXECUTE $pol$CREATE POLICY "therapist_photos_select_own_or_admin"
    ON public.therapist_photos FOR SELECT
    USING (user_id = (SELECT auth.uid()) OR public.is_admin())$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "therapist_photos_select_approved_public" ON public.therapist_photos';
  EXECUTE $pol$CREATE POLICY "therapist_photos_select_approved_public"
    ON public.therapist_photos FOR SELECT
    TO anon, authenticated
    USING (status = 'approved')$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "therapist_photos_insert_own" ON public.therapist_photos';
  EXECUTE $pol$CREATE POLICY "therapist_photos_insert_own"
    ON public.therapist_photos FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin())$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "therapist_photos_update_own_or_admin" ON public.therapist_photos';
  EXECUTE $pol$CREATE POLICY "therapist_photos_update_own_or_admin"
    ON public.therapist_photos FOR UPDATE
    USING (user_id = (SELECT auth.uid()) OR public.is_admin())
    WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin())$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "therapist_photos_delete_own_or_admin" ON public.therapist_photos';
  EXECUTE $pol$CREATE POLICY "therapist_photos_delete_own_or_admin"
    ON public.therapist_photos FOR DELETE
    USING (user_id = (SELECT auth.uid()) OR public.is_admin())$pol$;
END $$;

-- ── therapist_subscriptions ──────────────────────────────────────────────────
-- Read-only for the owning therapist (via profiles / therapist_profiles) and
-- admins. Writes happen exclusively through service-role server flows.
DO $$
BEGIN
  IF to_regclass('public.therapist_subscriptions') IS NULL THEN RETURN; END IF;

  EXECUTE 'DROP POLICY IF EXISTS "therapist_subscriptions_select_own_or_admin" ON public.therapist_subscriptions';
  EXECUTE $pol$CREATE POLICY "therapist_subscriptions_select_own_or_admin"
    ON public.therapist_subscriptions FOR SELECT
    TO authenticated
    USING (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = therapist_subscriptions.profile_id
          AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
      )
      OR EXISTS (
        SELECT 1 FROM public.therapist_profiles tp
        WHERE tp.id = therapist_subscriptions.therapist_profile_id
          AND tp.user_id = (SELECT auth.uid())
      )
    )$pol$;
END $$;

-- ── checkout_sessions ────────────────────────────────────────────────────────
-- Read-only for the profile owner and admins; created/updated only by
-- service-role server flows (Stripe checkout + webhooks).
DO $$
BEGIN
  IF to_regclass('public.checkout_sessions') IS NULL THEN RETURN; END IF;

  EXECUTE 'DROP POLICY IF EXISTS "checkout_sessions_select_own_or_admin" ON public.checkout_sessions';
  EXECUTE $pol$CREATE POLICY "checkout_sessions_select_own_or_admin"
    ON public.checkout_sessions FOR SELECT
    TO authenticated
    USING (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = checkout_sessions.profile_id
          AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
      )
    )$pol$;
END $$;

-- ── moderation_queue ─────────────────────────────────────────────────────────
-- Re-assert the policies from 20260322113000_moderation_queue.sql (the live
-- database has the table with RLS on but no policies, so the admin panel and
-- provider self-views return nothing).
DO $$
BEGIN
  IF to_regclass('public.moderation_queue') IS NULL THEN RETURN; END IF;

  EXECUTE 'DROP POLICY IF EXISTS "moderation_queue_select_self_or_admin" ON public.moderation_queue';
  EXECUTE $pol$CREATE POLICY "moderation_queue_select_self_or_admin"
    ON public.moderation_queue FOR SELECT
    USING (user_id = (SELECT auth.uid()) OR public.is_admin())$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "moderation_queue_insert_self_or_admin" ON public.moderation_queue';
  EXECUTE $pol$CREATE POLICY "moderation_queue_insert_self_or_admin"
    ON public.moderation_queue FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin())$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "moderation_queue_update_admin_only" ON public.moderation_queue';
  EXECUTE $pol$CREATE POLICY "moderation_queue_update_admin_only"
    ON public.moderation_queue FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin())$pol$;

  EXECUTE 'DROP POLICY IF EXISTS "moderation_queue_delete_admin_only" ON public.moderation_queue';
  EXECUTE $pol$CREATE POLICY "moderation_queue_delete_admin_only"
    ON public.moderation_queue FOR DELETE
    USING (public.is_admin())$pol$;
END $$;

-- ── vapi_sms_sessions ────────────────────────────────────────────────────────
-- Backend-only table (VAPI/SMS webhook flows). No client access; explicit
-- service_role policy only.
DO $$
BEGIN
  IF to_regclass('public.vapi_sms_sessions') IS NULL THEN RETURN; END IF;

  EXECUTE 'DROP POLICY IF EXISTS "vapi_sms_sessions_service_role_all" ON public.vapi_sms_sessions';
  EXECUTE $pol$CREATE POLICY "vapi_sms_sessions_service_role_all"
    ON public.vapi_sms_sessions
    TO service_role
    USING (true) WITH CHECK (true)$pol$;
END $$;

-- ── Safety net: every remaining RLS-on table with zero policies ─────────────
-- Gives service_role an explicit full-access policy and logs the table so the
-- gap is visible in migration output. Client-facing access for these tables
-- must still be designed table-by-table — this intentionally does NOT open
-- them to anon/authenticated.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.oid::regclass AS tbl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity
      AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid)
  LOOP
    EXECUTE format(
      'CREATE POLICY "service_role_all" ON %s TO service_role USING (true) WITH CHECK (true)',
      r.tbl
    );
    RAISE NOTICE 'RLS table with no policies — added service_role policy, client policies still needed: %', r.tbl;
  END LOOP;
END $$;
