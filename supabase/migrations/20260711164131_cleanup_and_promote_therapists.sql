-- ============================================================
-- STEP 1: DELETE test/debug therapists
-- ============================================================
DELETE FROM public.therapists
WHERE id IN (
  -- Therapist (example.com)
  'df95c47b-8659-4522-8ffa-49b32a5fafb8',
  '5177898d-796d-4e65-bab6-9153446a58ac',
  '022d5d71-7020-41d7-8da3-0662165534e6',
  -- Debug Identity
  'e4bf7145-2c3c-4304-b7b0-1ea3c3d68edc',
  'cb9dab61-56b4-4107-9c1c-b615366cb278',
  'eeab53db-cd8d-4a3d-a4fe-15a8443e483c',
  '9c15e5df-3dde-461b-af5d-28f658c2c601',
  -- Debug Register
  '416b7a59-3b66-476d-a63f-6a059549eb32',
  'd26a3170-64d9-4eea-84e9-a9e4942b7ec8',
  -- Debug User
  '60217646-ddbf-43b9-9686-41236b0ec621',
  'cda7bb62-c614-46ca-83ee-44c6b0610a4a',
  -- Diag User
  '38297ff4-e1bb-4320-9e14-21c8790a34a7',
  '55637c92-f740-412c-ba75-0ad531372e2d',
  -- Provider Sweep
  'bea5a012-2e07-4e0f-811d-62a49915410d',
  '04d3ba89-5222-4090-8bf2-440e0de40a3e',
  -- Stripe Verify User
  'b3eda195-3027-4d11-ac87-df24dc726557',
  -- test-webhook
  '5308db6a-b5c0-446c-8fbb-21c666146112'
);

-- ============================================================
-- STEP 2: UPDATE remaining therapists -> approved, featured, elite
-- ============================================================
UPDATE public.therapists
SET
  status    = 'approved',
  tier      = 'elite'
WHERE id NOT IN (
  'df95c47b-8659-4522-8ffa-49b32a5fafb8',
  '5177898d-796d-4e65-bab6-9153446a58ac',
  '022d5d71-7020-41d7-8da3-0662165534e6',
  'e4bf7145-2c3c-4304-b7b0-1ea3c3d68edc',
  'cb9dab61-56b4-4107-9c1c-b615366cb278',
  'eeab53db-cd8d-4a3d-a4fe-15a8443e483c',
  '9c15e5df-3dde-461b-af5d-28f658c2c601',
  '416b7a59-3b66-476d-a63f-6a059549eb32',
  'd26a3170-64d9-4eea-84e9-a9e4942b7ec8',
  '60217646-ddbf-43b9-9686-41236b0ec621',
  'cda7bb62-c614-46ca-83ee-44c6b0610a4a',
  '38297ff4-e1bb-4320-9e14-21c8790a34a7',
  '55637c92-f740-412c-ba75-0ad531372e2d',
  'bea5a012-2e07-4e0f-811d-62a49915410d',
  '04d3ba89-5222-4090-8bf2-440e0de40a3e',
  'b3eda195-3027-4d11-ac87-df24dc726557',
  '5308db6a-b5c0-446c-8fbb-21c666146112'
);

-- ============================================================
-- STEP 3: UPSERT remaining therapists -> profiles table
-- ============================================================
INSERT INTO public.profiles (
  id,
  user_id,
  slug,
  display_name,
  email,
  photo_url,
  city,
  state,
  status,
  profile_status,
  tier,
  subscription_tier,
  is_featured,
  modalities,
  keyword_slugs,
  segments,
  bio,
  phone,
  website,
  incall,
  outcall,
  latitude,
  longitude,
  profile_completeness,
  created_at,
  updated_at
)
SELECT
  t.id,
  t.user_id,
  t.slug,
  t.display_name,
  t.contact_email,
  t.photo_url,
  t.city,
  t.state,
  'approved',
  'approved',
  'elite',
  'elite',
  true,
  t.modalities,
  t.keyword_slugs,
  t.segments,
  t.bio,
  t.phone,
  t.website,
  t.incall,
  t.outcall,
  t.latitude::numeric,
  t.longitude::numeric,
  t.profile_completeness,
  t.created_at,
  t.updated_at
FROM public.therapists t
WHERE t.id NOT IN (
  'df95c47b-8659-4522-8ffa-49b32a5fafb8',
  '5177898d-796d-4e65-bab6-9153446a58ac',
  '022d5d71-7020-41d7-8da3-0662165534e6',
  'e4bf7145-2c3c-4304-b7b0-1ea3c3d68edc',
  'cb9dab61-56b4-4107-9c1c-b615366cb278',
  'eeab53db-cd8d-4a3d-a4fe-15a8443e483c',
  '9c15e5df-3dde-461b-af5d-28f658c2c601',
  '416b7a59-3b66-476d-a63f-6a059549eb32',
  'd26a3170-64d9-4eea-84e9-a9e4942b7ec8',
  '60217646-ddbf-43b9-9686-41236b0ec621',
  'cda7bb62-c614-46ca-83ee-44c6b0610a4a',
  '38297ff4-e1bb-4320-9e14-21c8790a34a7',
  '55637c92-f740-412c-ba75-0ad531372e2d',
  'bea5a012-2e07-4e0f-811d-62a49915410d',
  '04d3ba89-5222-4090-8bf2-440e0de40a3e',
  'b3eda195-3027-4d11-ac87-df24dc726557',
  '5308db6a-b5c0-446c-8fbb-21c666146112'
)
ON CONFLICT (id) DO UPDATE SET
  slug                = EXCLUDED.slug,
  display_name        = EXCLUDED.display_name,
  email               = EXCLUDED.email,
  photo_url           = EXCLUDED.photo_url,
  city                = EXCLUDED.city,
  state               = EXCLUDED.state,
  status              = 'approved',
  profile_status      = 'approved',
  tier                = 'elite',
  subscription_tier   = 'elite',
  is_featured         = true,
  modalities          = EXCLUDED.modalities,
  keyword_slugs       = EXCLUDED.keyword_slugs,
  segments            = EXCLUDED.segments,
  bio                 = EXCLUDED.bio,
  phone               = EXCLUDED.phone,
  website             = EXCLUDED.website,
  incall              = EXCLUDED.incall,
  outcall             = EXCLUDED.outcall,
  latitude            = EXCLUDED.latitude,
  longitude           = EXCLUDED.longitude,
  profile_completeness = EXCLUDED.profile_completeness,
  updated_at          = now();
