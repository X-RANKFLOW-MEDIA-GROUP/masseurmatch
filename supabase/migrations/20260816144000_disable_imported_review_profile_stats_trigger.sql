-- Public reviews and ratings are no longer part of the MasseurMatch product contract.
-- Remove the legacy imported-review stats trigger before the privacy migration
-- updates historical imported_reviews rows. Without this, each visibility update
-- attempts to write profiles.review_count / average_rating and can be rejected by
-- the verified-phone guard on legacy public provider profiles.

DROP TRIGGER IF EXISTS imported_reviews_refresh_profile_stats
ON public.imported_reviews;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c ON c.oid = tg.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT tg.tgisinternal
      AND n.nspname = 'public'
      AND c.relname = 'imported_reviews'
      AND tg.tgname = 'imported_reviews_refresh_profile_stats'
  ) THEN
    RAISE EXCEPTION 'Legacy imported review profile stats trigger must be disabled';
  END IF;
END
$$;
