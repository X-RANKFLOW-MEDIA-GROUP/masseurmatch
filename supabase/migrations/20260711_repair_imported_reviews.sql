-- Repair for 20250710_add_imported_reviews.sql, which only partially applied:
-- an older imported_reviews table already existed, so CREATE TABLE IF NOT
-- EXISTS skipped it and the script aborted on a duplicate index before the
-- ALTER TABLE statements ran. Every statement below is idempotent — safe to
-- run repeatedly in the Supabase SQL editor.

-- 1. Moderation columns missing from the pre-existing imported_reviews table
ALTER TABLE imported_reviews
  ADD COLUMN IF NOT EXISTS reviewer_anonymized BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 1b. The legacy table stored rating as INTEGER; reviews use half-star
-- precision (e.g. 4.5), matching the intended NUMERIC(2,1) definition
ALTER TABLE imported_reviews ALTER COLUMN rating TYPE NUMERIC(2,1);

ALTER TABLE imported_reviews DROP CONSTRAINT IF EXISTS imported_reviews_rating_check;
ALTER TABLE imported_reviews ADD CONSTRAINT imported_reviews_rating_check
  CHECK (rating >= 1 AND rating <= 5);

-- 2. Verification tracking columns on profile_migrations
ALTER TABLE profile_migrations
  ADD COLUMN IF NOT EXISTS imported_review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_imported_reviews_profile_id ON imported_reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_imported_reviews_migration_id ON imported_reviews(migration_id);
CREATE INDEX IF NOT EXISTS idx_imported_reviews_is_public ON imported_reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_imported_reviews_reviewed_at ON imported_reviews(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_imported_reviews_created_at ON imported_reviews(created_at DESC);

-- 4. Row Level Security
ALTER TABLE imported_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Therapists can view their own imported reviews" ON imported_reviews;
CREATE POLICY "Therapists can view their own imported reviews" ON imported_reviews
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view approved imported reviews" ON imported_reviews;
CREATE POLICY "Public can view approved imported reviews" ON imported_reviews
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Admins can manage imported reviews" ON imported_reviews;
CREATE POLICY "Admins can manage imported reviews" ON imported_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION update_imported_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS imported_reviews_updated_at ON imported_reviews;
CREATE TRIGGER imported_reviews_updated_at
  BEFORE UPDATE ON imported_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_imported_reviews_updated_at();
