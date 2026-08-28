-- Restore the intended caller-context security for therapist analytics.
alter view public.therapist_analytics_daily set (security_invoker = true);

-- Pin search_path for a generic trigger function to prevent object-shadowing.
alter function public.set_updated_at() set search_path = pg_catalog, public;
