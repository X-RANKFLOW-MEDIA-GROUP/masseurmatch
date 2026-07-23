-- Create profile audit log table for tracking all CMS edits
CREATE TABLE profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET
);

-- Create indexes for efficient querying
CREATE INDEX idx_profile_audit_log_profile ON profile_audit_log(profile_id);
CREATE INDEX idx_profile_audit_log_field ON profile_audit_log(field_name);
CREATE INDEX idx_profile_audit_log_created ON profile_audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read audit logs
CREATE POLICY audit_log_read ON profile_audit_log
  FOR SELECT
  TO authenticated
  USING (true);
