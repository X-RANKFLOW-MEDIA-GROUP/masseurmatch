
-- Drop all triggers first to avoid conflicts, then recreate

-- auth.users trigger already exists, skip it

-- profiles triggers
DROP TRIGGER IF EXISTS on_profile_status_change ON public.profiles;
DROP TRIGGER IF EXISTS on_new_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

CREATE TRIGGER on_profile_status_change
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.on_profile_status_change();

CREATE TRIGGER on_new_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_new_profile_created();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- content_flags triggers
DROP TRIGGER IF EXISTS on_content_flag_created ON public.content_flags;
DROP TRIGGER IF EXISTS on_content_flag_resolved ON public.content_flags;
DROP TRIGGER IF EXISTS update_content_flags_updated_at ON public.content_flags;

CREATE TRIGGER on_content_flag_created
  AFTER INSERT ON public.content_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.on_content_flag_created();

CREATE TRIGGER on_content_flag_resolved
  AFTER UPDATE OF status ON public.content_flags
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.on_content_flag_resolved();

CREATE TRIGGER update_content_flags_updated_at
  BEFORE UPDATE ON public.content_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- provider_travel triggers
DROP TRIGGER IF EXISTS validate_travel_dates ON public.provider_travel;
DROP TRIGGER IF EXISTS update_provider_travel_updated_at ON public.provider_travel;

CREATE TRIGGER validate_travel_dates
  BEFORE INSERT OR UPDATE ON public.provider_travel
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_travel_dates();

CREATE TRIGGER update_provider_travel_updated_at
  BEFORE UPDATE ON public.provider_travel
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- support_tickets trigger
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- phone_verifications trigger
DROP TRIGGER IF EXISTS check_phone_otp_rate_limit ON public.phone_verifications;

CREATE TRIGGER check_phone_otp_rate_limit
  BEFORE INSERT ON public.phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_phone_otp_rate_limit();
