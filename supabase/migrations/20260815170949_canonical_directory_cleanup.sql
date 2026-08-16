-- Migration-history alignment marker.
--
-- Production recorded canonical_directory_cleanup a second time at
-- 20260815170949 after the canonical 20260815170000 migration had already run.
-- The cleanup SQL is idempotent, and production is already in the canonical
-- directory-only state. This file intentionally performs no schema mutation.
--
-- Keep this timestamp in source control so `supabase migration list` and
-- `supabase db push` match the real production ledger without deleting or
-- rewriting remote migration history.

select 1;
