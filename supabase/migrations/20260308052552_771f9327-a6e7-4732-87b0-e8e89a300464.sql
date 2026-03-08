-- Add slug column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug (partial - only non-null)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_unique ON public.profiles (slug) WHERE slug IS NOT NULL;

-- Function to generate a unique slug from display_name or full_name
CREATE OR REPLACE FUNCTION public.generate_profile_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Only generate if slug is null or empty
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;

  -- Build base slug from display_name or full_name
  base_slug := COALESCE(NULLIF(NEW.display_name, ''), NULLIF(NEW.full_name, ''), 'therapist');
  base_slug := lower(trim(base_slug));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  -- If empty after processing, use fallback
  IF base_slug = '' THEN
    base_slug := 'therapist';
  END IF;

  -- Find unique slug
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS generate_slug_on_profile ON public.profiles;
CREATE TRIGGER generate_slug_on_profile
  BEFORE INSERT OR UPDATE OF display_name, full_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_profile_slug();

-- Backfill existing profiles with slugs
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  counter integer;
BEGIN
  FOR r IN SELECT id, display_name, full_name FROM public.profiles WHERE slug IS NULL ORDER BY created_at LOOP
    base_slug := COALESCE(NULLIF(r.display_name, ''), NULLIF(r.full_name, ''), 'therapist');
    base_slug := lower(trim(base_slug));
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    IF base_slug = '' THEN base_slug := 'therapist'; END IF;
    
    final_slug := base_slug;
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND id != r.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    UPDATE public.profiles SET slug = final_slug WHERE id = r.id;
  END LOOP;
END;
$$;