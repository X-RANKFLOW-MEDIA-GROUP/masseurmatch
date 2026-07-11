-- Add profile_migrations table for tracking profile imports from other platforms
CREATE TABLE IF NOT EXISTS profile_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'rubmaps', '4corners', 'nuru', 'custom'
  source_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
  imported_reviews INTEGER DEFAULT 0,
  imported_rating NUMERIC(3,2),
  migration_notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_profile_migrations_email ON profile_migrations(email);
CREATE INDEX idx_profile_migrations_profile_id ON profile_migrations(profile_id);
CREATE INDEX idx_profile_migrations_status ON profile_migrations(status);
CREATE INDEX idx_profile_migrations_created_at ON profile_migrations(created_at DESC);

-- Add RLS policy for security
ALTER TABLE profile_migrations ENABLE ROW LEVEL SECURITY;

-- Allow admins to view/manage all migrations
CREATE POLICY "Admins can manage migrations" ON profile_migrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow users to view their own migrations
CREATE POLICY "Users can view their own migrations" ON profile_migrations
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_profile_migrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_migrations_updated_at
  BEFORE UPDATE ON profile_migrations
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_migrations_updated_at();
