-- Create profile A/B testing table for experimentation
CREATE TABLE profile_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  field_name TEXT NOT NULL,
  test_value JSONB,
  control_value JSONB,
  test_segment_percent INTEGER CHECK (test_segment_percent BETWEEN 0 AND 100),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  results JSONB,
  status TEXT CHECK (status IN ('draft', 'running', 'completed', 'rolled_back')) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_ab_tests_status ON profile_ab_tests(status);
CREATE INDEX idx_ab_tests_created ON profile_ab_tests(created_at DESC);
CREATE INDEX idx_ab_tests_field_name ON profile_ab_tests(field_name);

-- Enable Row Level Security
ALTER TABLE profile_ab_tests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read A/B test configs
CREATE POLICY ab_tests_read ON profile_ab_tests
  FOR SELECT
  TO authenticated
  USING (true);
