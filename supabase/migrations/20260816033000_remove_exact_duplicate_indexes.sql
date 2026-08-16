-- Remove only exact duplicate indexes reported by the Supabase performance advisor.
-- Preserve the equivalent index for every access path, and preserve all
-- constraint-backed indexes. No table data, RLS policy, constraint, or billing
-- behavior is changed by this migration.

-- email_provider_events: preserve idx_email_provider_events_recipient.
drop index if exists public.email_provider_events_recipient_created_idx;

-- messaging_messages: preserve messaging_messages_conversation_idx.
drop index if exists public.idx_messaging_messages_conversation_created;

-- profiles: preserve idx_profiles_user_id.
drop index if exists public.idx_profiles_user_id_runtime;

-- profiles: preserve constraint-backed profiles_user_id_unique.
drop index if exists public.idx_profiles_user_id_unique;

-- text_verifications: preserve idx_text_verifications_user.
drop index if exists public.idx_text_verifications_user_status;

-- therapist_photos: preserve idx_therapist_photos_user.
drop index if exists public.idx_therapist_photos_user_status;

-- user_notification_preferences: preserve constraint-backed
-- user_notification_preferences_user_id_key.
drop index if exists public.uq_user_notification_preferences_user_id;
