-- Add imported_reviews table to store reviews migrated from other platforms
CREATE TABLE IF NOT EXISTS imported_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  migration_id UUID REFERENCES profile_migrations(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL, -- 'rubmaps', '4corners', 'nuru', 'custom'
  source_url TEXT, -- URL where review was scraped from
  reviewer_name TEXT,
  reviewer_anonymized BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMP,
  is_public BOOLEAN DEFAULT false, -- Hidden until admin reviews
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who approved
  reviewed_at TIMESTAMP,
  review_notes TEXT, -- Admin notes during review
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_imported_reviews_profile_id ON imported_reviews(profile_id);
CREATE INDEX idx_imported_reviews_migration_id ON imported_reviews(migration_id);
CREATE INDEX idx_imported_reviews_is_public ON imported_reviews(is_public);
CREATE INDEX idx_imported_reviews_reviewed_at ON imported_reviews(reviewed_at);
CREATE INDEX idx_imported_reviews_created_at ON imported_reviews(created_at DESC);

-- Add RLS policy for security
ALTER TABLE imported_reviews ENABLE ROW LEVEL SECURITY;

-- Allow therapists to view their own imported reviews
CREATE POLICY "Therapists can view their own imported reviews" ON imported_reviews
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Allow public to view only public approved reviews
CREATE POLICY "Public can view approved imported reviews" ON imported_reviews
  FOR SELECT USING (is_public = true);

-- Allow admins to manage all imported reviews
CREATE POLICY "Admins can manage imported reviews" ON imported_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_imported_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER imported_reviews_updated_at
  BEFORE UPDATE ON imported_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_imported_reviews_updated_at();

-- Update profile_migrations table to track imported review count
ALTER TABLE profile_migrations
ADD COLUMN IF NOT EXISTS imported_review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
