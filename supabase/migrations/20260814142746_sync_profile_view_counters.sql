BEGIN;

LOCK TABLE public.profile_view_analytics IN SHARE ROW EXCLUSIVE MODE;

CREATE OR REPLACE FUNCTION public.sync_profile_view_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET profile_views = COALESCE(profile_views, 0) + 1,
        view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.profile_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET profile_views = GREATEST(COALESCE(profile_views, 0) - 1, 0),
        view_count = GREATEST(COALESCE(view_count, 0) - 1, 0)
    WHERE id = OLD.profile_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    UPDATE public.profiles
    SET profile_views = GREATEST(COALESCE(profile_views, 0) - 1, 0),
        view_count = GREATEST(COALESCE(view_count, 0) - 1, 0)
    WHERE id = OLD.profile_id;

    UPDATE public.profiles
    SET profile_views = COALESCE(profile_views, 0) + 1,
        view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.profile_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_view_counters ON public.profile_view_analytics;
CREATE TRIGGER trg_sync_profile_view_counters
AFTER INSERT OR DELETE OR UPDATE OF profile_id ON public.profile_view_analytics
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_view_counters();

WITH counts AS (
  SELECT profile_id, COUNT(*)::integer AS total
  FROM public.profile_view_analytics
  WHERE profile_id IS NOT NULL
  GROUP BY profile_id
), normalized AS (
  SELECT p.id, COALESCE(c.total, 0) AS total
  FROM public.profiles p
  LEFT JOIN counts c ON c.profile_id = p.id
)
UPDATE public.profiles p
SET profile_views = n.total,
    view_count = n.total
FROM normalized n
WHERE p.id = n.id
  AND (p.profile_views IS DISTINCT FROM n.total OR p.view_count IS DISTINCT FROM n.total);

COMMIT;
