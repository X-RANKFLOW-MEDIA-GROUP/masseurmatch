-- Add identity_verified_at to profiles for public display in the verified badge.
-- Set retroactively for any profile already marked verified.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS identity_verified_at timestamptz;

UPDATE profiles
SET identity_verified_at = updated_at
WHERE verification_status = 'verified'
  AND is_verified_identity = true
  AND identity_verified_at IS NULL;
