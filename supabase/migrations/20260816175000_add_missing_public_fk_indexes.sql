do $$
declare
  idx record;
begin
  for idx in
    select * from (values
      ('public', 'admin_email_campaigns', 'cancelled_by', 'idx_admin_email_campaigns_cancelled_by_fk'),
      ('public', 'admin_email_campaigns', 'created_by', 'idx_admin_email_campaigns_created_by_fk'),
      ('public', 'admin_email_campaigns', 'template_id', 'idx_admin_email_campaigns_template_id_fk'),
      ('public', 'admin_email_templates', 'created_by', 'idx_admin_email_templates_created_by_fk'),
      ('public', 'admin_email_templates', 'updated_by', 'idx_admin_email_templates_updated_by_fk'),
      ('public', 'ai_profile_photo_scores', 'photo_id', 'idx_ai_profile_photo_scores_photo_id_fk'),
      ('public', 'demand_radar_spike_alert_deliveries', 'demand_score_id', 'idx_demand_radar_spike_alert_deliveries_demand_score_id_fk'),
      ('public', 'email_deliveries', 'profile_id', 'idx_email_deliveries_profile_id_fk'),
      ('public', 'email_deliveries', 'queue_id', 'idx_email_deliveries_queue_id_fk'),
      ('public', 'messaging_campaign_contacts', 'contact_id', 'idx_messaging_campaign_contacts_contact_id_fk'),
      ('public', 'messaging_campaigns', 'created_by', 'idx_messaging_campaigns_created_by_fk'),
      ('public', 'messaging_messages', 'campaign_id', 'idx_messaging_messages_campaign_id_fk'),
      ('public', 'messaging_profile_audit_log', 'contact_id', 'idx_messaging_profile_audit_log_contact_id_fk'),
      ('public', 'messaging_profile_audit_log', 'conversation_id', 'idx_messaging_profile_audit_log_conversation_id_fk'),
      ('public', 'messaging_profile_audit_log', 'session_id', 'idx_messaging_profile_audit_log_session_id_fk'),
      ('public', 'messaging_profile_audit_log', 'user_id', 'idx_messaging_profile_audit_log_user_id_fk'),
      ('public', 'messaging_profile_sessions', 'contact_id', 'idx_messaging_profile_sessions_contact_id_fk'),
      ('public', 'messaging_profile_sessions', 'last_inbound_message_id', 'idx_messaging_profile_sessions_last_inbound_message_id_fk'),
      ('public', 'messaging_profile_sessions', 'last_outbound_message_id', 'idx_messaging_profile_sessions_last_outbound_message_id_fk'),
      ('public', 'messaging_profile_sessions', 'user_id', 'idx_messaging_profile_sessions_user_id_fk'),
      ('public', 'messaging_queue', 'campaign_id', 'idx_messaging_queue_campaign_id_fk'),
      ('public', 'messaging_queue', 'conversation_id', 'idx_messaging_queue_conversation_id_fk'),
      ('public', 'messaging_queue', 'message_id', 'idx_messaging_queue_message_id_fk')
    ) as v(schema_name, table_name, column_name, index_name)
  loop
    if exists (
      select 1
      from information_schema.columns c
      where c.table_schema = idx.schema_name
        and c.table_name = idx.table_name
        and c.column_name = idx.column_name
    ) then
      execute format(
        'create index if not exists %I on %I.%I (%I)',
        idx.index_name,
        idx.schema_name,
        idx.table_name,
        idx.column_name
      );
    end if;
  end loop;
end $$;
