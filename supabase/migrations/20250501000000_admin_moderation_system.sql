-- ============================================================================
-- MasseurMatch Admin & Moderation System Database Migration
-- ============================================================================
-- Adds approval workflow, moderation tables, and analytics support
-- Run this migration in Supabase SQL Editor

-- ============================================================================
-- 1. ALTER PROFILES TABLE - Add Approval Workflow Columns
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'changes_requested', 'suspended'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_reviewed_at ON profiles(reviewed_at DESC);

-- ============================================================================
-- 2. CREATE PHOTO_VERIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS photo_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('profile', 'gallery', 'id_document')) DEFAULT 'profile',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_verifications_therapist_id ON photo_verifications(therapist_id);
CREATE INDEX IF NOT EXISTS idx_photo_verifications_status ON photo_verifications(status);
CREATE INDEX IF NOT EXISTS idx_photo_verifications_created_at ON photo_verifications(created_at DESC);

-- RLS Policies for photo_verifications
ALTER TABLE photo_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own photo verifications" ON photo_verifications
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Admins can view all photo verifications" ON photo_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own photos" ON photo_verifications
  FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Admins can update photo status" ON photo_verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. CREATE COMPLAINTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complainant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  respondent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('conduct', 'safety', 'fraud', 'inappropriate_content', 'other')) DEFAULT 'other',
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')) DEFAULT 'open',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_respondent_id ON complaints(respondent_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- RLS Policies for complaints
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own complaints" ON complaints
  FOR SELECT USING (auth.uid() = complainant_id OR auth.uid() = respondent_id);

CREATE POLICY "Admins can view all complaints" ON complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can file complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid() = complainant_id);

CREATE POLICY "Admins can update complaint status" ON complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. CREATE THERAPIST_AVAILABILITY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_day ON therapist_availability(day_of_week);

-- RLS Policies for therapist_availability
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own availability" ON therapist_availability
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Admins can view all availability" ON therapist_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage their own availability" ON therapist_availability
  FOR ALL USING (auth.uid() = therapist_id);

-- ============================================================================
-- 5. CREATE ADMIN_AUDIT_LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);

-- RLS Policies for admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 6. CREATE FUNCTION FOR UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS update_photo_verifications_updated_at ON photo_verifications;
CREATE TRIGGER update_photo_verifications_updated_at
  BEFORE UPDATE ON photo_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_therapist_availability_updated_at ON therapist_availability;
CREATE TRIGGER update_therapist_availability_updated_at
  BEFORE UPDATE ON therapist_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON photo_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON complaints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON therapist_availability TO authenticated;
GRANT SELECT ON admin_audit_log TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary of changes:
-- 1. Added approval workflow to profiles (status, admin_notes, reviewed_by, reviewed_at)
-- 2. Created photo_verifications table for photo/document moderation
-- 3. Created complaints table for user complaints
-- 4. Created therapist_availability table for scheduling
-- 5. Created admin_audit_log table for admin actions
-- 6. Added RLS policies for security
-- 7. Added indexes for performance
