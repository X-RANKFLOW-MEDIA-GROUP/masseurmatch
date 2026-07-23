-- ========================================
-- FIX: Unindexed Foreign Keys
-- Create indexes only when both the target table and column exist.
-- ========================================

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('analytics_events','user_id','idx_analytics_events_user_id'),
      ('appointments','client_id','idx_appointments_client_id'),
      ('appointments','profile_id','idx_appointments_profile_id'),
      ('audit_log','admin_id','idx_audit_log_admin_id'),
      ('booking_inquiries','reviewed_by','idx_booking_inquiries_reviewed_by'),
      ('complaints','complainant_id','idx_complaints_complainant_id'),
      ('complaints','reviewed_by','idx_complaints_reviewed_by'),
      ('conversations','participant_a_id','idx_conversations_participant_a'),
      ('conversations','participant_b_id','idx_conversations_participant_b'),
      ('conversations','profile_id','idx_conversations_profile_id'),
      ('conversations','therapist_id','idx_conversations_therapist_id'),
      ('favorites','profile_id','idx_favorites_profile_id'),
      ('favorites','therapist_id','idx_favorites_therapist_id'),
      ('imported_reviews','reviewed_by','idx_imported_reviews_reviewed_by'),
      ('messages','sender_id','idx_messages_sender_id'),
      ('messages','sender_user_id','idx_messages_sender_user_id'),
      ('moderation_actions','actor_admin_id','idx_moderation_actions_actor_admin'),
      ('moderation_actions','target_profile_id','idx_moderation_actions_target_profile'),
      ('payment_transactions','appointment_id','idx_payment_transactions_appointment'),
      ('payment_transactions','therapist_id','idx_payment_transactions_therapist'),
      ('profile_migrations','verified_by','idx_profile_migrations_verified_by'),
      ('profile_reports','profile_id','idx_profile_reports_profile_id'),
      ('profiles','rejected_by','idx_profiles_rejected_by'),
      ('profiles','reviewed_by','idx_profiles_reviewed_by'),
      ('ranking_events','therapist_id','idx_ranking_events_therapist_id'),
      ('ranking_events','user_id','idx_ranking_events_user_id'),
      ('search_history','client_user_id','idx_search_history_client_user_id'),
      ('site_settings','updated_by','idx_site_settings_updated_by'),
      ('sms_follow_up_alerts','resolved_by','idx_sms_follow_up_alerts_resolved_by'),
      ('sms_logs','booking_inquiry_id','idx_sms_logs_booking_inquiry_id'),
      ('sms_profiles','profile_id','idx_sms_profiles_profile_id'),
      ('support_tickets','profile_id','idx_support_tickets_profile_id'),
      ('therapist_availability','profile_id','idx_therapist_availability_profile'),
      ('therapist_photos','main_profile_id','idx_therapist_photos_main_profile'),
      ('therapist_photos','reviewed_by','idx_therapist_photos_reviewed_by'),
      ('therapist_pricing','profile_id','idx_therapist_pricing_profile_id'),
      ('therapist_services','profile_id','idx_therapist_services_profile_id'),
      ('therapist_subscriptions','profile_id','idx_therapist_subscriptions_profile'),
      ('waitlist_voice_ai','profile_id','idx_waitlist_voice_ai_profile_id')
    ) AS values_list(table_name, column_name, index_name)
  LOOP
    IF to_regclass(format('public.%I', item.table_name)) IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema='public'
           AND table_name=item.table_name
           AND column_name=item.column_name
       ) THEN
      EXECUTE format(
        'create index if not exists %I on public.%I(%I)',
        item.index_name,
        item.table_name,
        item.column_name
      );
    END IF;
  END LOOP;
END
$$;
