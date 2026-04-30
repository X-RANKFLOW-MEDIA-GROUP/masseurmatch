-- Ensure cron-triggered Edge Function invocations never fall back to hardcoded project credentials.

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
