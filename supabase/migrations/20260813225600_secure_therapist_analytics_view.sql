DO $$
BEGIN
  IF to_regclass('public.therapist_analytics_daily') IS NOT NULL THEN
    ALTER VIEW public.therapist_analytics_daily SET (security_invoker = true);
  END IF;
END $$;
