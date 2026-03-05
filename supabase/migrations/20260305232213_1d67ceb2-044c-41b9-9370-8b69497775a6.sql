
CREATE OR REPLACE FUNCTION public.on_admin_ticket_reply()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _ticket_user_id uuid;
  _ticket_subject text;
  _reply_preview text;
BEGIN
  -- Only fire for admin replies
  IF NEW.is_admin = false THEN
    RETURN NEW;
  END IF;

  -- Get ticket owner and subject
  SELECT user_id, subject INTO _ticket_user_id, _ticket_subject
  FROM public.support_tickets
  WHERE id = NEW.ticket_id;

  IF _ticket_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Truncate reply for email preview
  _reply_preview := LEFT(NEW.message, 500);

  PERFORM public.notify_email(
    _ticket_user_id,
    'ticket_reply',
    jsonb_build_object(
      'ticket_subject', _ticket_subject,
      'reply_message', _reply_preview
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_admin_ticket_reply
  AFTER INSERT ON public.ticket_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.on_admin_ticket_reply();
