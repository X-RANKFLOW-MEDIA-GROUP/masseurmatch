-- Fix complaints table: add columns that were defined in 20250501000000_admin_moderation_system.sql
-- but never applied because the table already existed with a different schema.
-- Also adds profiles.regular_discounts used by the admin upgrade route.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS regular_discounts JSONB;


ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS complainant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS respondent_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title          TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by   UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at   TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Indexes (the ones from the original migration that failed)
CREATE INDEX IF NOT EXISTS idx_complaints_respondent_id ON complaints(respondent_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status        ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at   ON complaints(created_at DESC);

-- RLS policies (CREATE POLICY errors if the policy already exists, so guard with DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'complaints'
      AND policyname = 'Users can view their own complaints'
  ) THEN
    CREATE POLICY "Users can view their own complaints" ON complaints
      FOR SELECT USING (auth.uid() = complainant_id OR auth.uid() = respondent_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'complaints'
      AND policyname = 'Users can file complaints'
  ) THEN
    CREATE POLICY "Users can file complaints" ON complaints
      FOR INSERT WITH CHECK (auth.uid() = complainant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'complaints'
      AND policyname = 'Admins can update complaint status'
  ) THEN
    CREATE POLICY "Admins can update complaint status" ON complaints
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
