-- Demand Radar dashboard preview reads through authenticated server APIs only.

ALTER TABLE public.demand_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read demand scores" ON public.demand_scores;
REVOKE ALL ON TABLE public.demand_scores FROM anon, authenticated;
GRANT ALL ON TABLE public.demand_scores TO service_role;

COMMENT ON TABLE public.demand_scores IS
  'Demand Radar market signals. Client access is blocked; read through authenticated server APIs only.';
