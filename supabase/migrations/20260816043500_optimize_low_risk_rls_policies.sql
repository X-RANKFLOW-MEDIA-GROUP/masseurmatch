-- Optimize only low-risk RLS policies whose effective access semantics are preserved.
-- Remove redundant permissive policies and wrap retained auth helpers in scalar
-- SELECTs so PostgreSQL can evaluate them as initplans instead of once per row.

-- contact_events: the two public SELECT policies are semantically equivalent.
-- Keep one owner-only policy and optimize auth.uid() evaluation.
DROP POLICY IF EXISTS "Users can view their own contact events"
  ON public.contact_events;

ALTER POLICY "Users can read their own contact events"
  ON public.contact_events
  USING ((SELECT auth.uid()) = user_id);

-- keyword_trends: authenticated-only read is redundant because the existing
-- public read policy already grants SELECT for every row to every caller.
DROP POLICY IF EXISTS allow_read_keyword_trends
  ON public.keyword_trends;

-- Preserve the existing service-role-only write behavior while avoiding
-- per-row auth.role() evaluation.
ALTER POLICY "Service role write keyword_trends"
  ON public.keyword_trends
  WITH CHECK ((SELECT auth.role()) = 'service_role'::text);

-- waitlist_events: service_role already has an ALL policy with USING/CHECK true.
-- The public SELECT policy below only ever evaluates true for service_role, so it
-- adds no effective access and can be removed without touching public INSERT rules.
DROP POLICY IF EXISTS service_read_events
  ON public.waitlist_events;

-- waitlist_signups: same redundancy as waitlist_events. Preserve the service_role
-- ALL policy plus the existing anonymous/public signup policies unchanged.
DROP POLICY IF EXISTS service_read_waitlist
  ON public.waitlist_signups;
