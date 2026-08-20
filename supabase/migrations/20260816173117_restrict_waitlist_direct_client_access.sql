-- The application writes waitlist data exclusively through the server-side admin client.
-- Remove legacy direct browser access so validation/rate limiting cannot be bypassed.
drop policy if exists "Allow public waitlist event insert" on public.waitlist_events;
drop policy if exists anon_insert_waitlist_events on public.waitlist_events;

drop policy if exists "Allow public waitlist signup insert" on public.waitlist_signups;
drop policy if exists anon_insert_waitlist_signups on public.waitlist_signups;
drop policy if exists anon_select_waitlist_signups on public.waitlist_signups;
drop policy if exists anon_update_waitlist_signups on public.waitlist_signups;

-- Keep the explicit service-role policies as the sole RLS path for these tables.
