-- Fix Demand Radar schema to match API expectations.
-- The current demand_scores table is missing columns and indexes needed by the collection pipeline.

-- Ensure all demand_scores columns exist with correct types
ALTER TABLE public.demand_scores
  ADD COLUMN IF NOT EXISTS region_code text,
  ADD COLUMN IF NOT EXISTS region_name text,
  ADD COLUMN IF NOT EXISTS spike_score int NOT NULL DEFAULT 0 CHECK (spike_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS baseline_index int NOT NULL DEFAULT 0 CHECK (baseline_index BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS growth_pct numeric(8, 2),
  ADD COLUMN IF NOT EXISTS velocity_score int NOT NULL DEFAULT 0 CHECK (velocity_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS persistence_score int NOT NULL DEFAULT 0 CHECK (persistence_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS confidence int CHECK (confidence BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS sample_size int NOT NULL DEFAULT 0 CHECK (sample_size BETWEEN 0 AND 500),
  ADD COLUMN IF NOT EXISTS score_components jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'internal-ingestion',
  ADD COLUMN IF NOT EXISTS methodology_version text DEFAULT 'mvp-v1',
  ADD COLUMN IF NOT EXISTS collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS run_id text,
  ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false;

-- Drop the old index that doesn't include methodology_version
DROP INDEX IF EXISTS public.demand_scores_city_state_neighborhood_week_start_idx;

-- Create new unique index that matches the API's onConflict specification
CREATE UNIQUE INDEX IF NOT EXISTS demand_scores_city_state_neighborhood_week_start_methodology_uidx
  ON public.demand_scores (city, state, COALESCE(neighborhood, ''), week_start, COALESCE(methodology_version, 'mvp-v1'))
  WHERE is_sample = false;

-- Ensure RLS is enabled
ALTER TABLE public.demand_scores ENABLE ROW LEVEL SECURITY;

-- Drop old RLS policy if it exists
DROP POLICY IF EXISTS "Authenticated users can read demand scores" ON public.demand_scores;

-- Create new RLS policy: read through authenticated server APIs only
REVOKE ALL ON TABLE public.demand_scores FROM anon, authenticated;
GRANT ALL ON TABLE public.demand_scores TO service_role;

-- Create demand_collection_runs table
CREATE TABLE IF NOT EXISTS public.demand_collection_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  markets_requested int NOT NULL DEFAULT 0 CHECK (markets_requested >= 0),
  markets_succeeded int NOT NULL DEFAULT 0 CHECK (markets_succeeded >= 0),
  markets_failed int NOT NULL DEFAULT 0 CHECK (markets_failed >= 0),
  rows_ingested int NOT NULL DEFAULT 0 CHECK (rows_ingested >= 0),
  error_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed
ALTER TABLE public.demand_collection_runs
  ADD COLUMN IF NOT EXISTS run_id text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS markets_requested int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS markets_succeeded int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS markets_failed int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rows_ingested int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Ensure started_at is not null (backfill if needed)
UPDATE public.demand_collection_runs
SET started_at = COALESCE(started_at, created_at, now())
WHERE started_at IS NULL;

ALTER TABLE public.demand_collection_runs
  ALTER COLUMN started_at SET NOT NULL;

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS demand_collection_runs_run_id_uidx
  ON public.demand_collection_runs (run_id)
  WHERE run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS demand_collection_runs_started_at_idx
  ON public.demand_collection_runs (started_at DESC);

CREATE INDEX IF NOT EXISTS demand_collection_runs_status_idx
  ON public.demand_collection_runs (status, started_at DESC);

-- Create indexes on demand_scores for performance
CREATE INDEX IF NOT EXISTS demand_scores_spike_latest_idx
  ON public.demand_scores (spike_score DESC, collected_at DESC)
  WHERE is_sample = false;

CREATE INDEX IF NOT EXISTS demand_scores_run_id_idx
  ON public.demand_scores (run_id)
  WHERE run_id IS NOT NULL;

-- Enable RLS on demand_collection_runs
ALTER TABLE public.demand_collection_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.demand_collection_runs FROM anon, authenticated;
GRANT ALL ON TABLE public.demand_collection_runs TO service_role;

COMMENT ON TABLE public.demand_collection_runs IS
  'Private audit log for each automated Demand Radar collection and ingestion run.';
COMMENT ON COLUMN public.demand_scores.spike_score IS
  '0-100 multi-signal anomaly score using growth, velocity, persistence, and confidence.';
COMMENT ON COLUMN public.demand_scores.score_components IS
  'Auditable component values used to calculate the displayed demand and spike scores.';
