-- Migration: Add geo-engine fields + nearby therapists RPC
-- Required by PRD: Homepage Geo Engine + Results Engine

-- Add missing columns to profiles if they don't exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'boost_score') THEN
    ALTER TABLE public.profiles ADD COLUMN boost_score integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'featured_until') THEN
    ALTER TABLE public.profiles ADD COLUMN featured_until timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'latitude') THEN
    ALTER TABLE public.profiles ADD COLUMN latitude double precision;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'longitude') THEN
    ALTER TABLE public.profiles ADD COLUMN longitude double precision;
  END IF;
END
$$;

-- Create index for geo queries
CREATE INDEX IF NOT EXISTS idx_profiles_geo
  ON public.profiles (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for available_now queries
CREATE INDEX IF NOT EXISTS idx_profiles_available_now
  ON public.profiles (available_now)
  WHERE available_now = true;

-- Create index for featured queries
CREATE INDEX IF NOT EXISTS idx_profiles_featured_until
  ON public.profiles (featured_until)
  WHERE featured_until IS NOT NULL;

-- Create index for boost_score sorting
CREATE INDEX IF NOT EXISTS idx_profiles_boost_score
  ON public.profiles (boost_score DESC);

-- RPC: get_nearby_therapists
-- Returns therapists near a given lat/lng with distance calculation
CREATE OR REPLACE FUNCTION public.get_nearby_therapists(
  p_lat double precision,
  p_lng double precision,
  p_radius_miles double precision DEFAULT 50,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  city text,
  neighborhood text,
  starting_price numeric,
  available_now boolean,
  distance_miles double precision,
  profile_photo text,
  boost_score integer,
  featured_until timestamptz,
  modality text,
  specialties text[],
  bio text,
  incall_price numeric,
  outcall_price numeric,
  tier text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    COALESCE(p.display_name, p.full_name, 'Therapist') AS name,
    p.slug,
    p.city,
    COALESCE(p.neighborhood_name, p.primary_area) AS neighborhood,
    LEAST(
      NULLIF(p.incall_price, 0),
      NULLIF(p.outcall_price, 0)
    ) AS starting_price,
    COALESCE(p.available_now, false) AS available_now,
    -- Haversine distance in miles
    3958.8 * 2 * ASIN(SQRT(
      SIN(RADIANS(p.latitude - p_lat) / 2) ^ 2 +
      COS(RADIANS(p_lat)) * COS(RADIANS(p.latitude)) *
      SIN(RADIANS(p.longitude - p_lng) / 2) ^ 2
    )) AS distance_miles,
    p.avatar_url AS profile_photo,
    COALESCE(p.boost_score, 0) AS boost_score,
    p.featured_until,
    p.modality,
    p.specialties,
    p.bio,
    p.incall_price,
    p.outcall_price,
    p._tier AS tier
  FROM public.profiles p
  WHERE
    p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND (p.is_active = true OR p.is_active IS NULL)
    AND p.status IN ('active', 'approved')
    AND 3958.8 * 2 * ASIN(SQRT(
      SIN(RADIANS(p.latitude - p_lat) / 2) ^ 2 +
      COS(RADIANS(p_lat)) * COS(RADIANS(p.latitude)) *
      SIN(RADIANS(p.longitude - p_lng) / 2) ^ 2
    )) <= p_radius_miles
  ORDER BY
    COALESCE(p.available_now, false) DESC,
    distance_miles ASC,
    COALESCE(p.boost_score, 0) DESC
  LIMIT p_limit;
$$;
