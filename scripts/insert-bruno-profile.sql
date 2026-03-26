-- First, ensure Dallas city exists
INSERT INTO public.cities (slug, name, state, state_code, description, latitude, longitude, hero)
VALUES (
  'dallas-tx',
  'Dallas',
  'Texas',
  'TX',
  'Find LGBTQ+-affirming massage therapists in Dallas',
  32.7767,
  -96.7970,
  'Dallas therapy'
)
ON CONFLICT (slug) DO NOTHING;

-- Now insert Bruno's profile
INSERT INTO public.therapists (
  slug,
  display_name,
  city_id,
  state,
  bio,
  photo_url,
  gallery,
  modalities,
  keyword_slugs,
  languages,
  contact_email,
  phone,
  website,
  incall,
  outcall,
  price_range,
  gay_friendly,
  inclusive,
  latitude,
  longitude,
  tier,
  status
) VALUES (
  'bruno-dallas-tx',
  'Bruno',
  (SELECT id FROM public.cities WHERE slug = 'dallas-tx'),
  'Texas',
  'Professional licensed massage therapist with 8 years experience. Specializing in deep tissue and therapeutic massage.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  '[]'::jsonb,
  ARRAY['Deep Tissue', 'Swedish', 'Therapeutic']::text[],
  ARRAY['deep-tissue', 'swedish']::text[],
  ARRAY['English', 'Spanish']::text[],
  'contact@masseurmatch.com',
  '214-555-0123',
  'https://masseurmatch.com/therapists/bruno-dallas-tx',
  true,
  true,
  '$120-$160',
  true,
  true,
  32.7800,
  -96.8000,
  'pro',
  'approved'
)
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  status = EXCLUDED.status,
  updated_at = NOW();
