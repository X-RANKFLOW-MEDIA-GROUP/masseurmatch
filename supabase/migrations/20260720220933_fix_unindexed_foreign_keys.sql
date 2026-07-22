-- ========================================
-- FIX: Unindexed Foreign Keys
-- ========================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_profile_id ON public.appointments(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_reviewed_by ON public.booking_inquiries(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_complaints_complainant_id ON public.complaints(complainant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_reviewed_by ON public.complaints(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_a ON public.conversations(participant_a_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_b ON public.conversations(participant_b_id);
CREATE INDEX IF NOT EXISTS idx_conversations_profile_id ON public.conversations(profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_therapist_id ON public.conversations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_favorites_profile_id ON public.favorites(profile_id);
CREATE INDEX IF NOT EXISTS idx_favorites_therapist_id ON public.favorites(therapist_id);
CREATE INDEX IF NOT EXISTS idx_imported_reviews_reviewed_by ON public.imported_reviews(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_user_id ON public.messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_actor_admin ON public.moderation_actions(actor_admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_profile ON public.moderation_actions(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_appointment ON public.payment_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_therapist ON public.payment_transactions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_profile_migrations_verified_by ON public.profile_migrations(verified_by);
CREATE INDEX IF NOT EXISTS idx_profile_reports_profile_id ON public.profile_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rejected_by ON public.profiles(rejected_by);
CREATE INDEX IF NOT EXISTS idx_profiles_reviewed_by ON public.profiles(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_ranking_events_therapist_id ON public.ranking_events(therapist_id);
CREATE INDEX IF NOT EXISTS idx_ranking_events_user_id ON public.ranking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_client_user_id ON public.search_history(client_user_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON public.site_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_sms_follow_up_alerts_resolved_by ON public.sms_follow_up_alerts(resolved_by);
CREATE INDEX IF NOT EXISTS idx_sms_logs_booking_inquiry_id ON public.sms_logs(booking_inquiry_id);
CREATE INDEX IF NOT EXISTS idx_sms_profiles_profile_id ON public.sms_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_profile_id ON public.support_tickets(profile_id);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_profile ON public.therapist_availability(profile_id);
CREATE INDEX IF NOT EXISTS idx_therapist_photos_main_profile ON public.therapist_photos(main_profile_id);
CREATE INDEX IF NOT EXISTS idx_therapist_photos_reviewed_by ON public.therapist_photos(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_therapist_pricing_profile_id ON public.therapist_pricing(profile_id);
CREATE INDEX IF NOT EXISTS idx_therapist_services_profile_id ON public.therapist_services(profile_id);
CREATE INDEX IF NOT EXISTS idx_therapist_subscriptions_profile ON public.therapist_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_voice_ai_profile_id ON public.waitlist_voice_ai(profile_id);
