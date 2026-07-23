begin;

-- Production was logging a steady stream of:
--   42501  permission denied for table blog_posts
-- on every blog page view. The public blog reader (src/app/_lib/blog-data.ts)
-- queries public.blog_posts through the anon key and falls back to bundled
-- content when the query fails, so the site keeps working — but PostgREST logs
-- a table-level permission error each time.
--
-- The table already has RLS enabled with a `USING (true)` public-read policy
-- (20260314000000_directory_schema.sql), so this is NOT an RLS problem: the
-- anon/authenticated roles are simply missing the table-level SELECT privilege
-- that RLS is evaluated on top of. Re-assert it explicitly and idempotently so
-- the grant survives regardless of migration-history drift.
grant select on public.blog_posts to anon, authenticated;

commit;
