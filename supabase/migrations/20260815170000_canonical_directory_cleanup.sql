-- Canonical directory cleanup
-- MasseurMatch is a directory platform. It does not own booking, appointment
-- scheduling, or session payment workflows.
--
-- This migration is intentionally defensive. It aborts instead of deleting
-- data if any legacy runtime table has received rows since the cleanup audit.

DO $$
DECLARE
  legacy_count bigint;
BEGIN
  IF to_regclass('public.appointments') IS NOT NULL THEN
    EXECUTE 'select count(*) from public.appointments' INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'canonical_directory_cleanup aborted: appointments contains % rows', legacy_count;
    END IF;
  END IF;

  IF to_regclass('public.booking_inquiries') IS NOT NULL THEN
    EXECUTE 'select count(*) from public.booking_inquiries' INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'canonical_directory_cleanup aborted: booking_inquiries contains % rows', legacy_count;
    END IF;
  END IF;

  IF to_regclass('public.booking_analytics') IS NOT NULL THEN
    EXECUTE 'select count(*) from public.booking_analytics' INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'canonical_directory_cleanup aborted: booking_analytics contains % rows', legacy_count;
    END IF;
  END IF;

  IF to_regclass('public.payment_transactions') IS NOT NULL THEN
    EXECUTE 'select count(*) from public.payment_transactions' INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'canonical_directory_cleanup aborted: payment_transactions contains % rows', legacy_count;
    END IF;
  END IF;

  IF to_regclass('public.therapist_availability') IS NOT NULL THEN
    EXECUTE 'select count(*) from public.therapist_availability' INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'canonical_directory_cleanup aborted: therapist_availability contains % rows', legacy_count;
    END IF;
  END IF;

  IF to_regclass('public.sms_logs') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'sms_logs'
         AND column_name = 'booking_inquiry_id'
     ) THEN
    EXECUTE 'select count(*) from public.sms_logs where booking_inquiry_id is not null' INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'canonical_directory_cleanup aborted: sms_logs still references % booking inquiries', legacy_count;
    END IF;
  END IF;
END
$$;

-- Session-payment RPCs are not used by the canonical subscription webhook.
DROP FUNCTION IF EXISTS public.process_stripe_payment_intent_failed(text);
DROP FUNCTION IF EXISTS public.process_stripe_payment_intent_succeeded(text, uuid);

-- SMS remains supported, but it no longer carries a booking foreign key.
ALTER TABLE IF EXISTS public.sms_logs
  DROP CONSTRAINT IF EXISTS sms_logs_booking_inquiry_id_fkey;
ALTER TABLE IF EXISTS public.sms_logs
  DROP COLUMN IF EXISTS booking_inquiry_id;

-- Drop child objects before parents. These tables are required to be empty by
-- the guard above, so no production records can be silently discarded.
DROP TABLE IF EXISTS public.payment_transactions;
DROP TABLE IF EXISTS public.booking_analytics;
DROP TABLE IF EXISTS public.booking_inquiries;
DROP TABLE IF EXISTS public.therapist_availability;
DROP TABLE IF EXISTS public.appointments;

COMMENT ON SCHEMA public IS
  'MasseurMatch canonical runtime: directory, profiles, direct contact, subscriptions, messaging, moderation, analytics, and SEO. No platform booking or session-payment tables.';
