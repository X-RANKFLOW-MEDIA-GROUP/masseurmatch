-- Migration history alignment marker.
-- Production already records version 20260816075841 with the same migration name.
-- The actual verified-phone enforcement is implemented by
-- 20260816075500_enforce_verified_phone_for_public_profiles.sql.
-- Keep this file as a no-op so repository and production migration ledgers stay aligned.

select 1;
