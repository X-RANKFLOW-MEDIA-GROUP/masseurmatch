-- Security policy hardening. Optional relations are guarded so clean preview
-- branches can replay the complete migration history.

DO $$
BEGIN
  IF to_regclass('public.contact_inquiries') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_inquiries' AND column_name='profile_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_inquiries' AND column_name='message') THEN
    DROP POLICY IF EXISTS "contact_inquiries_insert_public" ON public.contact_inquiries;
    CREATE POLICY "contact_inquiries_insert_public" ON public.contact_inquiries
      FOR INSERT WITH CHECK (
        profile_id IS NOT NULL
        AND char_length(coalesce(message, '')) >= 10
        AND char_length(coalesce(message, '')) <= 2000
      );
  END IF;

  IF to_regclass('public.newsletter_subscribers') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='newsletter_subscribers' AND column_name='email') THEN
    DROP POLICY IF EXISTS "newsletter_insert_anon" ON public.newsletter_subscribers;
    CREATE POLICY "newsletter_insert_anon" ON public.newsletter_subscribers
      FOR INSERT WITH CHECK (
        email IS NOT NULL
        AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
      );
  END IF;

  IF to_regclass('public.support_tickets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "service_role_tickets_all" ON public.support_tickets;
    CREATE POLICY "service_role_tickets_all" ON public.support_tickets
      FOR ALL USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
  END IF;

  IF to_regclass('public.support_ticket_messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "service_role_messages_all" ON public.support_ticket_messages;
    CREATE POLICY "service_role_messages_all" ON public.support_ticket_messages
      FOR ALL USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public can read therapist photos" ON storage.objects;
    DROP POLICY IF EXISTS "Public read therapist photos by path" ON storage.objects;
    CREATE POLICY "Public read therapist photos by path" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'therapist-photos'
        AND (storage.foldername(name))[1] IS NOT NULL
      );
  END IF;
END
$$;
