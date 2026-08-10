-- Demand Radar v2 collection pipeline: city signals, spike metrics, and run logs.

ALTER TABLE public.demand_scores
  ADD COLUMN IF NOT EXISTS region_code text,
  ADD COLUMN IF NOT EXISTS region_name text,
  ADD COLUMN IF NOT EXISTS spike_score int NOT NULL DEFAULT 0 CHECK (spike_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS baseline_index int NOT NULL DEFAULT 0 CHECK (baseline_index BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS growth_pct numeric(8, 2),
  ADD COLUMN IF NOT EXISTS velocity_score int NOT NULL DEFAULT 0 CHECK (velocity_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS persistence_score int NOT NULL DEFAULT 0 CHECK (persistence_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS sample_size int NOT NULL DEFAULT 0 CHECK (sample_size BETWEEN 0 AND 500),
  ADD COLUMN IF NOT EXISTS score_components jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS run_id text;

CREATE INDEX IF NOT EXISTS demand_scores_spike_latest_idx
  ON public.demand_scores (spike_score DESC, collected_at DESC)
  WHERE is_sample = false;

CREATE INDEX IF NOT EXISTS demand_scores_run_id_idx
  ON public.demand_scores (run_id)
  WHERE run_id IS NOT NULL;

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

-- The table may already exist from an earlier/partial deployment. CREATE TABLE IF NOT EXISTS
-- does not reconcile missing columns, so repair the contract explicitly before indexes are created.
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

-- Backfill only the compatibility fields needed by this migration. A legacy table can have
-- rows without started_at; created_at is the safest available historical fallback.
UPDATE public.demand_collection_runs
SET started_at = COALESCE(started_at, created_at, now())
WHERE started_at IS NULL;

ALTER TABLE public.demand_collection_runs
  ALTER COLUMN started_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS demand_collection_runs_run_id_uidx
  ON public.demand_collection_runs (run_id)
  WHERE run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS demand_collection_runs_started_at_idx
  ON public.demand_collection_runs (started_at DESC);

CREATE INDEX IF NOT EXISTS demand_collection_runs_status_idx
  ON public.demand_collection_runs (status, started_at DESC);

ALTER TABLE public.demand_collection_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.demand_collection_runs FROM anon, authenticated;
GRANT ALL ON TABLE public.demand_collection_runs TO service_role;

COMMENT ON TABLE public.demand_collection_runs IS
  'Private audit log for each automated Demand Radar collection and ingestion run.';
COMMENT ON COLUMN public.demand_scores.spike_score IS
  '0-100 multi-signal anomaly score using growth, velocity, persistence, and confidence.';
COMMENT ON COLUMN public.demand_scores.score_components IS
  'Auditable component values used to calculate the displayed demand and spike scores.';
