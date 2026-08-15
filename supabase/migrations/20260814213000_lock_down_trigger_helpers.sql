-- Trigger helpers must never be exposed as RPC endpoints.
-- PostgreSQL triggers continue to execute their functions without client EXECUTE grants.

revoke all on function public.identity_verification_sync_profile_trigger() from public, anon, authenticated;
revoke all on function public.repair_profile_photo_primary() from public, anon, authenticated;
revoke all on function public.sync_profile_photo_moderation_queue() from public, anon, authenticated;
revoke all on function public.sync_profile_view_counters() from public, anon, authenticated;
