-- Demand scores for Demand Radar (Elite-gated feature).
-- Rows are ingested weekly via POST /api/internal/demand-scores.

CREATE TABLE IF NOT EXISTS demand_scores (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  city                text        NOT NULL,
  state               text        NOT NULL,
  neighborhood        text,
  score               int         NOT NULL CHECK (score BETWEEN 0 AND 100),
  trend               text        NOT NULL DEFAULT 'stable'
                                  CHECK (trend IN ('rising', 'stable', 'falling')),
  search_volume_index int         NOT NULL DEFAULT 0 CHECK (search_volume_index BETWEEN 0 AND 100),
  competition_index   int         NOT NULL DEFAULT 0 CHECK (competition_index BETWEEN 0 AND 100),
  week_start          date        NOT NULL,
  created_at          timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS demand_scores_city_state_neighborhood_week_start_idx
  ON demand_scores (city, state, COALESCE(neighborhood, ''), week_start);

ALTER TABLE demand_scores ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read scores; the UI gates display to Elite.
-- This avoids a cross-table subscription join inside RLS which can be slow.
CREATE POLICY "Authenticated users can read demand scores"
  ON demand_scores FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seed data: 5 cities × 3–5 neighborhoods, week starting 2026-06-08
INSERT INTO demand_scores (city, state, neighborhood, score, trend, search_volume_index, competition_index, week_start) VALUES
  ('New York',     'NY', NULL,                 91, 'rising',  95, 72, '2026-06-08'),
  ('New York',     'NY', 'Hell''s Kitchen',    88, 'rising',  92, 68, '2026-06-08'),
  ('New York',     'NY', 'Chelsea',            82, 'stable',  85, 64, '2026-06-08'),
  ('New York',     'NY', 'Lower East Side',    74, 'stable',  78, 60, '2026-06-08'),
  ('New York',     'NY', 'Astoria',            61, 'falling', 65, 52, '2026-06-08'),

  ('Los Angeles',  'CA', NULL,                 85, 'rising',  88, 62, '2026-06-08'),
  ('Los Angeles',  'CA', 'West Hollywood',     94, 'rising',  97, 58, '2026-06-08'),
  ('Los Angeles',  'CA', 'Silver Lake',        79, 'rising',  83, 55, '2026-06-08'),
  ('Los Angeles',  'CA', 'Downtown',           68, 'stable',  72, 58, '2026-06-08'),

  ('Miami',        'FL', NULL,                 88, 'rising',  91, 60, '2026-06-08'),
  ('Miami',        'FL', 'South Beach',        96, 'rising',  99, 62, '2026-06-08'),
  ('Miami',        'FL', 'Wynwood',            81, 'stable',  84, 56, '2026-06-08'),
  ('Miami',        'FL', 'Brickell',           73, 'stable',  76, 58, '2026-06-08'),

  ('Chicago',      'IL', NULL,                 76, 'stable',  79, 58, '2026-06-08'),
  ('Chicago',      'IL', 'Boystown',           89, 'rising',  92, 54, '2026-06-08'),
  ('Chicago',      'IL', 'River North',        72, 'stable',  75, 60, '2026-06-08'),
  ('Chicago',      'IL', 'Lincoln Park',       65, 'falling', 68, 56, '2026-06-08'),

  ('Dallas',       'TX', NULL,                 71, 'stable',  74, 56, '2026-06-08'),
  ('Dallas',       'TX', 'Oak Lawn',           86, 'rising',  89, 52, '2026-06-08'),
  ('Dallas',       'TX', 'Uptown',             78, 'stable',  81, 58, '2026-06-08'),
  ('Dallas',       'TX', 'Deep Ellum',         63, 'falling', 66, 54, '2026-06-08')
ON CONFLICT (city, state, COALESCE(neighborhood, ''), week_start) DO NOTHING;
