-- Schedule lifecycle worker and campaign orchestration jobs via pg_cron + pg_net

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.invoke_edge_function(
  p_function_name text,
  p_body jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  _url := current_setting('app.settings.supabase_url', true);
  _anon_key := current_setting('app.settings.supabase_anon_key', true);

  IF _url IS NULL OR _url = '' OR _anon_key IS NULL OR _anon_key = '' THEN
    RAISE EXCEPTION 'Set app.settings.supabase_url and app.settings.supabase_anon_key before scheduling lifecycle edge function jobs.';
  END IF;

  PERFORM net.http_post(
    url := _url || '/functions/v1/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon_key,
      'apikey', _anon_key
    ),
    body := COALESCE(p_body, '{}'::jsonb)
  );
END;
$$;


CREATE OR REPLACE FUNCTION public.run_lifecycle_queue_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.invoke_edge_function('process-lifecycle-email-queue', jsonb_build_object('limit', 100));
END;
$$;


CREATE OR REPLACE FUNCTION public.run_lifecycle_campaign_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Core segment automation flow from lifecycle plan
  PERFORM public.invoke_edge_function('run-lifecycle-campaigns', '{}'::jsonb);

  -- Keep existing trial ending cadence (billing-focused reminders)
  PERFORM public.invoke_edge_function('trial-reminder-emails', '{}'::jsonb);
END;
$$;


DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'lifecycle_email_queue_worker_q15';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  PERFORM cron.schedule(
    'lifecycle_email_queue_worker_q15',
    '*/15 * * * *',
    'SELECT public.run_lifecycle_queue_worker();'
  );
END $$;


DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'lifecycle_campaign_jobs_daily';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  -- Daily run for inactive/profile-completion/travel/trial-based segmentation
  PERFORM cron.schedule(
    'lifecycle_campaign_jobs_daily',
    '10 14 * * *',
    'SELECT public.run_lifecycle_campaign_jobs();'
  );
END $$;


DO $$
DECLARE
  _job_id bigint;
BEGIN
  SELECT jobid INTO _job_id FROM cron.job WHERE jobname = 'lifecycle_campaign_jobs_weekly';
  IF _job_id IS NOT NULL THEN
    PERFORM cron.unschedule(_job_id);
  END IF;

  -- Weekly digest/newsletter oriented run
  PERFORM cron.schedule(
    'lifecycle_campaign_jobs_weekly',
    '0 15 * * 1',
    'SELECT public.run_lifecycle_campaign_jobs();'
  );
END $$;
