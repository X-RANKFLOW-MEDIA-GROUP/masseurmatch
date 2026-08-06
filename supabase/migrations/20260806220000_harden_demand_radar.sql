-- Harden Demand Radar for server-side Elite access and auditable freshness.

ALTER TABLE public.demand_scores
  ADD COLUMN IF NOT EXISTS neighborhood_key text
    GENERATED ALWAYS AS (COALESCE(lower(trim(neighborhood)), '')) STORED,
  ADD COLUMN IF NOT EXISTS confidence int CHECK (confidence BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS methodology_version text NOT NULL DEFAULT 'mvp-v1',
  ADD COLUMN IF NOT EXISTS collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false;

UPDATE public.demand_scores
SET
  source = COALESCE(source, 'legacy-seed'),
  confidence = COALESCE(confidence, 30),
  collected_at = COALESCE(collected_at, created_at),
  expires_at = COALESCE(expires_at, created_at + interval '7 days'),
  is_sample = true
WHERE week_start = DATE '2026-06-08'
  AND source IS NULL;

DROP INDEX IF EXISTS demand_scores_city_state_neighborhood_week_start_idx;
CREATE UNIQUE INDEX IF NOT EXISTS demand_scores_market_week_method_idx
  ON public.demand_scores (lower(trim(city)), upper(trim(state)), neighborhood_key, week_start, methodology_version);

CREATE INDEX IF NOT EXISTS demand_scores_latest_market_idx
  ON public.demand_scores (upper(trim(state)), lower(trim(city)), week_start DESC);

DROP POLICY IF EXISTS "Authenticated users can read demand scores" ON public.demand_scores;
REVOKE ALL ON TABLE public.demand_scores FROM anon, authenticated;
GRANT ALL ON TABLE public.demand_scores TO service_role;

COMMENT ON TABLE public.demand_scores IS
  'Private Demand Radar market intelligence. Read through authenticated server APIs only.';
COMMENT ON COLUMN public.demand_scores.score IS
  'Relative demand index from 0 to 100. It is not absolute search volume or a booking forecast.';
COMMENT ON COLUMN public.demand_scores.confidence IS
  'Data confidence from 0 to 100 based on source coverage and freshness.';
