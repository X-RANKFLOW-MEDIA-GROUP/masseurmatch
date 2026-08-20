-- Safe RLS performance cleanup.
-- Scope is intentionally limited to policies with equivalent effective access
-- plus auth function wrappers recommended by the Supabase advisor.
-- No table data, billing, subscription, profile publication, or admin semantics
-- are changed by this migration.

-- contact_events: retain one owner-read policy and avoid per-row auth.uid() calls.
drop policy if exists "Users can view their own contact events" on public.contact_events;
alter policy "Users can read their own contact events"
  on public.contact_events
  using ((select auth.uid()) = user_id);

-- keyword_trends: public read already grants SELECT to all roles, so the
-- authenticated-only read policy is redundant. Preserve public access.
drop policy if exists allow_read_keyword_trends on public.keyword_trends;
alter policy "Service role write keyword_trends"
  on public.keyword_trends
  with check ((select auth.role()) = 'service_role'::text);

-- waitlist service-read policies: semantics unchanged; only cache auth.role().
alter policy service_read_events
  on public.waitlist_events
  using ((select auth.role()) = 'service_role'::text);

alter policy service_read_waitlist
  on public.waitlist_signups
  using ((select auth.role()) = 'service_role'::text);

notify pgrst, 'reload schema';
