
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- ══════════════════════════════════════════════════
-- Helper: Call send-notification-email edge function
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.notify_email(
  p_user_id uuid,
  p_template text,
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  _url := current_setting('app.settings.supabase_url', true);
  _anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  -- Fallback to hardcoded if settings not available
  IF _url IS NULL OR _url = '' THEN
    _url := 'https://cnycelkfbtzfnphbeurd.supabase.co';
  END IF;
  IF _anon_key IS NULL OR _anon_key = '' THEN
    _anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueWNlbGtmYnR6Zm5waGJldXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzE1OTEsImV4cCI6MjA4Njk0NzU5MX0.NTLP8YbvjNhZGIrJPFrijsb1UZr5qjlcCkSl-UhSfCU';
  END IF;

  PERFORM net.http_post(
    url := _url || '/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon_key
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'template', p_template,
      'data', p_data
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ══════════════════════════════════════════════════
-- Trigger: Profile status changes (approved/rejected)
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.on_profile_status_change()
RETURNS trigger AS $$
BEGIN
  -- Profile approved
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.is_active = true THEN
    PERFORM public.notify_email(NEW.user_id, 'profile_approved', '{}'::jsonb);
  END IF;

  -- Profile rejected
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    PERFORM public.notify_email(NEW.user_id, 'profile_rejected', '{}'::jsonb);
  END IF;

  -- Profile update confirmation (content re-submitted for approval)
  IF NEW.status = 'pending_approval' AND OLD.status = 'active' THEN
    PERFORM public.notify_email(NEW.user_id, 'profile_update_confirmation', 
      jsonb_build_object('changes', 'Your profile changes have been submitted for review.')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_profile_status_email ON public.profiles;
CREATE TRIGGER trg_profile_status_email
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.on_profile_status_change();

-- ══════════════════════════════════════════════════
-- Trigger: New profile created → welcome email
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.on_new_profile_created()
RETURNS trigger AS $$
BEGIN
  PERFORM public.notify_email(NEW.user_id, 'welcome', '{}'::jsonb);
  
  -- Admin notification
  PERFORM public.notify_email(
    NEW.user_id, 
    'admin_new_signup',
    jsonb_build_object('name', COALESCE(NEW.display_name, NEW.full_name, 'Unknown'))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_new_profile_welcome ON public.profiles;
CREATE TRIGGER trg_new_profile_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_new_profile_created();

-- ══════════════════════════════════════════════════
-- Trigger: Content flag created → report_received email
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.on_content_flag_created()
RETURNS trigger AS $$
BEGIN
  -- Notify reporter
  PERFORM public.notify_email(NEW.reporter_id, 'report_received',
    jsonb_build_object('report_id', NEW.id)
  );
  
  -- Admin urgent notification for serious reports
  IF NEW.reason IN ('illegal', 'harassment', 'underage', 'exploitation') THEN
    PERFORM public.notify_email(NEW.reporter_id, 'admin_urgent_report',
      jsonb_build_object('report_id', NEW.id, 'changes', NEW.reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_flag_report_email ON public.content_flags;
CREATE TRIGGER trg_flag_report_email
  AFTER INSERT ON public.content_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.on_content_flag_created();

-- ══════════════════════════════════════════════════
-- Trigger: Content flag resolved → report_action_taken email
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.on_content_flag_resolved()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    PERFORM public.notify_email(NEW.reporter_id, 'report_action_taken',
      jsonb_build_object(
        'report_id', NEW.id,
        'result', COALESCE(NEW.resolution_note, 'Appropriate action has been taken.')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_flag_resolved_email ON public.content_flags;
CREATE TRIGGER trg_flag_resolved_email
  AFTER UPDATE OF status ON public.content_flags
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.on_content_flag_resolved();
