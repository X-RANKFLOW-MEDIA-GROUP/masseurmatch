-- ============================================================
-- MIGRATION: Cleanup Profiles Columns — superseded
-- ============================================================
--
-- This historical migration attempted to remove a large set of profile fields.
-- Those fields remain part of the canonical production schema and are actively
-- used by provider editing, verification, subscriptions, analytics, SEO, and the
-- AI Profile Coach. Production never recorded the destructive cleanup migration.
--
-- Keep this version as an explicit, non-destructive compatibility marker so a
-- clean Supabase preview branch can replay the repository history without
-- diverging from production or deleting live application contracts.
--
-- Any future schema cleanup must be introduced as a new migration after a
-- verified application/data migration, deprecation window, and rollback plan.

begin;

do $$
begin
  raise notice 'Skipping superseded destructive profiles cleanup; canonical production columns are retained.';
end
$$;

commit;
