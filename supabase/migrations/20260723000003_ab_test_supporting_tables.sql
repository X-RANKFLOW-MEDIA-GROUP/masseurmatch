-- Create table for tracking which segment each profile is assigned to in a test
CREATE TABLE ab_test_segment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES profile_ab_tests(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  segment TEXT NOT NULL CHECK (segment IN ('test', 'control')),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_profile_per_test UNIQUE (test_id, profile_id)
);

-- Create index for efficient querying
CREATE INDEX idx_ab_test_segment_test_id ON ab_test_segment_assignments(test_id);
CREATE INDEX idx_ab_test_segment_profile_id ON ab_test_segment_assignments(profile_id);
CREATE INDEX idx_ab_test_segment_segment ON ab_test_segment_assignments(segment);

-- Create audit log table for tracking A/B test operations
CREATE TABLE ab_test_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES profile_ab_tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'started', 'finalized', 'rolled_out', 'reverted', 'deleted')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET
);

-- Create indexes for efficient querying
CREATE INDEX idx_ab_test_audit_test_id ON ab_test_audit_log(test_id);
CREATE INDEX idx_ab_test_audit_created ON ab_test_audit_log(created_at DESC);
CREATE INDEX idx_ab_test_audit_action ON ab_test_audit_log(action);

-- Create table for storing daily metrics snapshots
CREATE TABLE ab_test_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES profile_ab_tests(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  segment TEXT NOT NULL CHECK (segment IN ('test', 'control')),
  profile_views INTEGER DEFAULT 0,
  contact_clicks INTEGER DEFAULT 0,
  profile_completeness DECIMAL(5,2) DEFAULT 0,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_ab_test_metrics_test_id ON ab_test_metrics_snapshots(test_id);
CREATE INDEX idx_ab_test_metrics_profile_id ON ab_test_metrics_snapshots(profile_id);
CREATE INDEX idx_ab_test_metrics_snapshot_date ON ab_test_metrics_snapshots(snapshot_date);
CREATE INDEX idx_ab_test_metrics_segment ON ab_test_metrics_snapshots(segment);

-- Enable Row Level Security
ALTER TABLE ab_test_segment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to read
CREATE POLICY ab_test_segments_read ON ab_test_segment_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY ab_test_audit_read ON ab_test_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY ab_test_metrics_read ON ab_test_metrics_snapshots
  FOR SELECT
  TO authenticated
  USING (true);
