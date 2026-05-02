-- Schedule the City Digest email via pg_cron + pg_net
-- Runs every Friday at 9:00 AM UTC
-- Calls the Supabase Edge Function: send-city-digest

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the cron job
SELECT cron.schedule(
  'send-city-digest-weekly',         -- unique job name
  '0 9 * * 5',                       -- every Friday at 09:00 UTC
  $$
  SELECT extensions.http_post(
    url    := current_setting('app.settings.supabase_url') || '/functions/v1/send-city-digest',
    body   := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
