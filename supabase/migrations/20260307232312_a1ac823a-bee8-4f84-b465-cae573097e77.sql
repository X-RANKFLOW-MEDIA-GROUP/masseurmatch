
CREATE OR REPLACE FUNCTION public.on_ticket_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.notify_email(
    NEW.user_id,
    'ticket_created',
    jsonb_build_object(
      'ticket_subject', NEW.subject,
      'ticket_message', LEFT(NEW.message, 500)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_ticket_created_trigger
AFTER INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.on_ticket_created();
