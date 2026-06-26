-- Add is_demo flag to profiles table.
-- Demo/seed profiles are excluded from all public-facing pages when
-- SHOW_DEMO_PROFILES env var is not set to 'true'. They remain visible
-- in the admin panel and on staging environments.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Flag known seed profiles so they are handled correctly at launch.
UPDATE profiles
SET is_demo = true
WHERE slug IN (
  'ethan-cole',
  'nico-hayes',
  'leo-martinez',
  'mason-ellis',
  'adrian-cole',
  'blake-vance',
  'owen-parker',
  'jordan-brooks',
  'kevin-os',
  'bruno-dallas-tx',
  'bruno-santos'
);

COMMENT ON COLUMN profiles.is_demo IS
  'When true, this profile is a seed/demo entry and is excluded from '
  'public directory pages unless SHOW_DEMO_PROFILES=true.';
