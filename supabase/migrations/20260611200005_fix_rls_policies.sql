-- Fix 1: demand_scores RLS — restrict reads to Elite subscribers only.
-- Previously: USING (auth.role() = 'authenticated') allowed any logged-in user to
-- bypass the UI gate and read demand data directly via the SDK.

DROP POLICY IF EXISTS "Authenticated users can read demand scores" ON demand_scores;

-- Elite check: user has an active subscription with plan_key matching 'elite*'
CREATE POLICY "Elite subscribers can read demand scores"
  ON demand_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
        AND s.status = 'active'
        AND s.plan_key ILIKE 'elite%'
    )
  );


-- Fix 2: contact_events RLS — anonymous events (user_id IS NULL) were unreadable
-- by admins because NULL = NULL evaluates to NULL (not TRUE) in SQL.
-- Admins need to read all events; regular users can only see their own.

DROP POLICY IF EXISTS "Users can view their own contact events" ON contact_events;

-- Users see only their own (non-anonymous) events
CREATE POLICY "Users can view their own contact events"
  ON contact_events
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Service role (used by admin routes) bypasses RLS entirely — no extra policy needed.
-- Anonymous events are intentionally invisible to client-side queries.
