-- Remove incomplete placeholder listings and enforce completeness on publishable profiles

DELETE FROM public.profiles
WHERE COALESCE(status, 'draft') IN ('active', 'approved')
  AND (
    COALESCE(NULLIF(TRIM(neighborhood_name), ''), NULLIF(TRIM(primary_area), ''), NULLIF(TRIM(city), '')) IS NULL
    OR years_experience IS NULL
    OR (incall_price IS NULL AND outcall_price IS NULL)
  );

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_publishable_fields_required;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_publishable_fields_required CHECK (
    COALESCE(status, 'draft') NOT IN ('active', 'approved')
    OR (
      COALESCE(NULLIF(TRIM(neighborhood_name), ''), NULLIF(TRIM(primary_area), ''), NULLIF(TRIM(city), '')) IS NOT NULL
      AND years_experience IS NOT NULL
      AND (incall_price IS NOT NULL OR outcall_price IS NOT NULL)
    )
  );
