-- Purge the legacy `public.therapists` seed data.
--
-- `public.therapists` is the OLD directory schema table. Nothing in the live
-- app reads or writes it — real provider signups go to `public.profiles`, and
-- the public site serves profiles from there (the `public_therapists` view is a
-- view over `profiles`, unrelated to this table). The only writer to
-- `public.therapists` is scripts/seed-supabase.mjs, so every row here is
-- fabricated seed/demo content (stock Unsplash photos, `555` placeholder
-- phones, `@masseurmatch.com` emails) that must never surface publicly.
--
-- This deletes all of that seed data. Rows in `public.reviews` that reference
-- these therapists are removed automatically via the existing
-- `reviews_therapist_id_fkey ... on delete cascade` constraint.
--
-- The table itself is left in place (it is still defined by earlier baseline
-- migrations); only the junk rows are removed. Re-running is a no-op.

do $$
declare
  deleted integer;
begin
  delete from public.therapists;
  get diagnostics deleted = row_count;
  raise notice 'purge_legacy_therapists_seed: deleted % legacy therapist row(s)', deleted;
end $$;
