-- The live database contains a search_public_therapists() function that
-- computes distances with the earthdistance `<@>` operator, but the cube and
-- earthdistance extensions were never enabled in production, so every call
-- fails with: `operator does not exist: point <@> point`.
--
-- Enabling the extensions makes the existing function work as written.
-- Both live in the `extensions` schema per Supabase convention, which is on
-- the default search_path for database functions.

create extension if not exists cube with schema extensions;
create extension if not exists earthdistance with schema extensions;
