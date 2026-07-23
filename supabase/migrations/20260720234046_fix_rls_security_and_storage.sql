-- 1. contact_inquiries: restrict INSERT
DROP POLICY IF EXISTS "contact_inquiries_insert_public" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_insert_public" ON public.contact_inquiries
FOR INSERT WITH CHECK (
  profile_id IS NOT NULL
  AND char_length(COALESCE(message, '')) >= 10
  AND char_length(COALESCE(message, '')) <= 2000
);

-- 2. newsletter_subscribers: restrict INSERT with email validation
-- (production-only table; guard so its absence on a fresh/branch DB is skipped)
DO $$ BEGIN
  DROP POLICY IF EXISTS "newsletter_insert_anon" ON public.newsletter_subscribers;
  CREATE POLICY "newsletter_insert_anon" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (
    email IS NOT NULL
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
EXCEPTION WHEN undefined_table OR undefined_column OR undefined_object THEN
  RAISE NOTICE 'fix_rls_security_and_storage: skipped newsletter_subscribers policy (absent on this DB): %', SQLERRM;
END $$;

-- 3. support_tickets: restrict ALL to service_role only
DROP POLICY IF EXISTS "service_role_tickets_all" ON public.support_tickets;
CREATE POLICY "service_role_tickets_all" ON public.support_tickets
FOR ALL USING (auth.role() = 'service_role');

-- 4. support_ticket_messages: restrict ALL to service_role only
DROP POLICY IF EXISTS "service_role_messages_all" ON public.support_ticket_messages;
CREATE POLICY "service_role_messages_all" ON public.support_ticket_messages
FOR ALL USING (auth.role() = 'service_role');

-- 5. Storage: replace broad listing policy with path-restricted read
DROP POLICY IF EXISTS "Public can read therapist photos" ON storage.objects;
CREATE POLICY "Public read therapist photos by path" ON storage.objects
FOR SELECT USING (
  bucket_id = 'therapist-photos'
  AND (storage.foldername(name))[1] IS NOT NULL
);
