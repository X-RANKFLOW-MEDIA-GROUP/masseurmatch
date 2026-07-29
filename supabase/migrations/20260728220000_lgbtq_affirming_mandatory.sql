-- MasseurMatch is an LGBTQ+-affirming directory: affirmation is a platform
-- commitment every provider accepts with the Therapist Agreement, not an
-- opt-in flag. The signup flow never set the column, so every new provider
-- landed as false and was excluded from affirming-first placement.
--
-- Backfill all existing profiles, then make the column default true and
-- NOT NULL so a profile can never silently land as non-affirming again.
-- (The signup routes also set it explicitly on submit/resubmit.)

UPDATE public.profiles
SET lgbtq_affirming = true
WHERE lgbtq_affirming IS DISTINCT FROM true;

ALTER TABLE public.profiles
  ALTER COLUMN lgbtq_affirming SET DEFAULT true;

ALTER TABLE public.profiles
  ALTER COLUMN lgbtq_affirming SET NOT NULL;
