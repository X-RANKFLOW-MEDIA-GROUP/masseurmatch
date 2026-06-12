export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type ProjectTable<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown> = Partial<Row>,
  Update extends Record<string, unknown> = Partial<Row>,
> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type FlexibleProjectTable = ProjectTable<Record<string, Json | undefined>>

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          action_type: string | null
          admin_id: string | null
          actor_profile_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          target_id: string | null
          target_profile_id: string | null
          target_table: string
          target_user_id: string | null
          reason: string | null
          metadata: Json | null
        }
        Insert: {
          action?: string
          action_type?: string | null
          admin_id?: string | null
          actor_profile_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_profile_id?: string | null
          target_table?: string
          target_user_id?: string | null
          reason?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          action_type?: string | null
          admin_id?: string | null
          actor_profile_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_profile_id?: string | null
          target_table?: string
          target_user_id?: string | null
          reason?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          city_slug: string | null
          created_at: string
          event_name: string
          event_source: string | null
          id: string
          ip_hash: string | null
          metadata: Json
          page_path: string | null
          therapist_profile_id: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          city_slug?: string | null
          created_at?: string
          event_name: string
          event_source?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          page_path?: string | null
          therapist_profile_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          city_slug?: string | null
          created_at?: string
          event_name?: string
          event_source?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          page_path?: string | null
          therapist_profile_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      background_jobs: {
        Row: {
          attempts: number
          created_at: string
          id: string
          job_type: string
          payload: Json
          processed_at: string | null
          scheduled_for: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          job_type: string
          payload?: Json
          processed_at?: string | null
          scheduled_for?: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          job_type?: string
          payload?: Json
          processed_at?: string | null
          scheduled_for?: string
          status?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: Json | null
          tags: string[] | null
          published_at: string | null
          updated_at: string | null
          created_at: string
          seo_description: string | null
          seo_title: string | null
          status: string | null
          author_name: string | null
          cover_image: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content?: Json | null
          tags?: string[] | null
          published_at?: string | null
          updated_at?: string | null
          created_at?: string
          seo_description?: string | null
          seo_title?: string | null
          status?: string | null
          author_name?: string | null
          cover_image?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: Json | null
          tags?: string[] | null
          published_at?: string | null
          updated_at?: string | null
          created_at?: string
          seo_description?: string | null
          seo_title?: string | null
          status?: string | null
          author_name?: string | null
          cover_image?: string | null
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          plan_id: string | null
          profile_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          therapist_profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          plan_id?: string | null
          profile_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          plan_id?: string | null
          profile_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          description: string | null
          hero: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          state: string | null
          state_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hero?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          slug?: string | null
          state?: string | null
          state_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hero?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          slug?: string | null
          state?: string | null
          state_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_events: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          method: string
          profile_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          method: string
          profile_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          method?: string
          profile_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          id: string
          message: string | null
          preferred_contact: string | null
          profile_id: string | null
          status: string | null
          therapist_id: string | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          preferred_contact?: string | null
          profile_id?: string | null
          status?: string | null
          therapist_id?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          preferred_contact?: string | null
          profile_id?: string | null
          status?: string | null
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_preferences: {
        Row: {
          allow_email: boolean | null
          allow_phone: boolean | null
          allow_whatsapp: boolean | null
          auto_reply_message: string | null
          created_at: string
          id: string
          therapist_id: string | null
          updated_at: string
        }
        Insert: {
          allow_email?: boolean | null
          allow_phone?: boolean | null
          allow_whatsapp?: boolean | null
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          therapist_id?: string | null
          updated_at?: string
        }
        Update: {
          allow_email?: boolean | null
          allow_phone?: boolean | null
          allow_whatsapp?: boolean | null
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          therapist_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      demand_scores: {
        Row: {
          city: string
          competition_index: number
          created_at: string
          id: string
          neighborhood: string | null
          score: number
          search_volume_index: number
          state: string
          trend: string
          week_start: string
        }
        Insert: {
          city: string
          competition_index?: number
          created_at?: string
          id?: string
          neighborhood?: string | null
          score: number
          search_volume_index?: number
          state: string
          trend?: string
          week_start: string
        }
        Update: {
          city?: string
          competition_index?: number
          created_at?: string
          id?: string
          neighborhood?: string | null
          score?: number
          search_volume_index?: number
          state?: string
          trend?: string
          week_start?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          payload: Json
          recipient_email: string
          scheduled_for: string
          sent_at: string | null
          status: string
          workflow_key: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          payload?: Json
          recipient_email: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          workflow_key?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          payload?: Json
          recipient_email?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          workflow_key?: string | null
        }
        Relationships: []
      }
      email_workflows: {
        Row: {
          body_html: string
          created_at: string
          id: string
          is_active: boolean
          subject: string
          updated_at: string
          workflow_key: string
        }
        Insert: {
          body_html: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject: string
          updated_at?: string
          workflow_key: string
        }
        Update: {
          body_html?: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject?: string
          updated_at?: string
          workflow_key?: string
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          metadata: Json | null
          profile_id: string | null
          provider: string | null
          status: string
          stripe_session_id: string | null
          stripe_verification_report_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          metadata?: Json | null
          profile_id?: string | null
          provider?: string | null
          status?: string
          stripe_session_id?: string | null
          stripe_verification_report_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          metadata?: Json | null
          profile_id?: string | null
          provider?: string | null
          status?: string
          stripe_session_id?: string | null
          stripe_verification_report_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          category: string | null
          created_at: string
          id: string
          keyword: string | null
          label: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          label?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          label?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lifecycle_email_log: {
        Row: {
          campaign_key: string | null
          created_at: string
          error_message: string | null
          flow_key: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_id: string | null
          queue_id: string | null
          recipient_email: string | null
          segment: string | null
          send_category: string | null
          status: string | null
          subject: string | null
          suppression_reason: string | null
          template_key: string | null
          user_id: string | null
        }
        Insert: {
          campaign_key?: string | null
          created_at?: string
          error_message?: string | null
          flow_key?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_id?: string | null
          queue_id?: string | null
          recipient_email?: string | null
          segment?: string | null
          send_category?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_key?: string | null
          created_at?: string
          error_message?: string | null
          flow_key?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_id?: string | null
          queue_id?: string | null
          recipient_email?: string | null
          segment?: string | null
          send_category?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lifecycle_email_queue: {
        Row: {
          body_html: string | null
          body_text: string | null
          campaign_key: string | null
          created_at: string
          error_message: string | null
          flow_key: string | null
          id: string
          idempotency_key: string | null
          provider_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          retry_count: number
          scheduled_for: string | null
          segment: string | null
          send_category: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          suppression_reason: string | null
          template_key: string | null
          user_id: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          campaign_key?: string | null
          created_at?: string
          error_message?: string | null
          flow_key?: string | null
          id?: string
          idempotency_key?: string | null
          provider_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          retry_count?: number
          scheduled_for?: string | null
          segment?: string | null
          send_category?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          campaign_key?: string | null
          created_at?: string
          error_message?: string | null
          flow_key?: string | null
          id?: string
          idempotency_key?: string | null
          provider_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          retry_count?: number
          scheduled_for?: string | null
          segment?: string | null
          send_category?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          admin_reason: string | null
          ai_response: Json | null
          content_id: string | null
          content_type: string | null
          created_at: string
          field_name: string | null
          id: string
          item_type: string | null
          moderation_provider: string | null
          moderation_notes: string | null
          content_hash: string | null
          resolved_at: string | null
          moderation_reason: string | null
          notes: string | null
          payload: Json | null
          photo_id: string | null
          priority: string | number | null
          profile_id: string | null
          queue_type: string | null
          resolved_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          snapshot: Json | null
          source: string | null
          status: string
          target_id: string | null
          therapist_profile_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reason?: string | null
          ai_response?: Json | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string | null
          moderation_provider?: string | null
          moderation_notes?: string | null
          content_hash?: string | null
          resolved_at?: string | null
          moderation_reason?: string | null
          notes?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: string | number | null
          profile_id?: string | null
          queue_type?: string | null
          resolved_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          snapshot?: Json | null
          source?: string | null
          status?: string
          target_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reason?: string | null
          ai_response?: Json | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string | null
          moderation_provider?: string | null
          moderation_notes?: string | null
          content_hash?: string | null
          resolved_at?: string | null
          moderation_reason?: string | null
          notes?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: string | number | null
          profile_id?: string | null
          queue_type?: string | null
          resolved_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          snapshot?: Json | null
          source?: string | null
          status?: string
          target_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: FlexibleProjectTable
      client_favorites: ProjectTable<{
        id: string
        user_id: string | null
        client_user_id: string | null
        profile_id: string | null
        therapist_id: string | null
        therapist_profile_id: string | null
        created_at: string | null
      }>
      complaints: FlexibleProjectTable
      conversations: FlexibleProjectTable
      favorites: FlexibleProjectTable
      featured_masters: ProjectTable<{
        id: string
        profile_id: string
        featured_by: string | null
        city: string | null
        is_active: boolean
        display_order: number | null
        created_at: string | null
        updated_at: string | null
      }>
      imported_profile_data: ProjectTable<{
        id: string
        profile_id: string | null
        source_url: string | null
        payload: Json | null
        created_at: string | null
      }>
      messages: FlexibleProjectTable
      notification_deliveries: FlexibleProjectTable
      payment_transactions: FlexibleProjectTable
      photo_moderations: FlexibleProjectTable
      profile_documents: FlexibleProjectTable
      push_subscriptions: FlexibleProjectTable
      ranking_events: ProjectTable<{
        id: string
        profile_id: string | null
        event_type: string | null
        event_name: string
        weight: number | null
        metadata: Json | null
        created_at: string | null
      }>
      segments: FlexibleProjectTable
      site_settings: FlexibleProjectTable
      subscriptions: FlexibleProjectTable
      therapist_availability: FlexibleProjectTable
      therapist_learning_scores: ProjectTable<{
        id: string
        profile_id: string | null
        therapist_id: string | null
        city: string | null
        intent: string | null
        score: number | null
        weighted_score: number | null
        impressions: number | null
        profile_clicks: number | null
        contact_clicks: number | null
        ctr: number | null
        contact_rate: number | null
        created_at: string | null
        updated_at: string | null
      }>
      user_notification_preferences: ProjectTable<{
        id: string
        user_id: string | null
        email_enabled: boolean | null
        sms_enabled: boolean | null
        push_enabled: boolean | null
        marketing_enabled: boolean | null
        phone_e164: string | null
        timezone: string | null
        quiet_hours_start: string | null
        quiet_hours_end: string | null
        created_at: string | null
        updated_at: string | null
      }>
      user_suspensions: FlexibleProjectTable
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          moderation_reason: string | null
          moderation_status: string | null
          status: string | null
          profile_id: string | null
          sort_order: number | null
          storage_path: string | null
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          moderation_reason?: string | null
          moderation_status?: string | null
          status?: string | null
          profile_id?: string | null
          sort_order?: number | null
          storage_path?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          moderation_reason?: string | null
          moderation_status?: string | null
          status?: string | null
          profile_id?: string | null
          sort_order?: number | null
          storage_path?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reviews: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          profile_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          moderation_notes: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          moderation_notes?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          moderation_notes?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_reviews: {
        Row: {
          id: string
          profile_id: string
          source_url: string | null
          reviewer_name: string | null
          review_text: string | null
          rating: number | null
          review_date: string | null
          source_platform: string | null
          imported_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id?: string
          source_url?: string | null
          reviewer_name?: string | null
          review_text?: string | null
          rating?: number | null
          review_date?: string | null
          source_platform?: string | null
          imported_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          source_url?: string | null
          reviewer_name?: string | null
          review_text?: string | null
          rating?: number | null
          review_date?: string | null
          source_platform?: string | null
          imported_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      profile_sections: {
        Row: {
          created_at: string
          id: string
          is_complete: boolean
          is_editable: boolean
          is_visible: boolean
          section_key: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_complete?: boolean
          is_editable?: boolean
          is_visible?: boolean
          section_key: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_complete?: boolean
          is_editable?: boolean
          is_visible?: boolean
          section_key?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_sections_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_sections_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_sections_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          _tier: string | null
          account_status: string
          add_ons: Json | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_platform: string | null
          booking_url: string | null
          business_trips: Json | null
          business_hours: Json | null
          custom_faq: Json | null
          current_status: string | null
          service_radius_km: number | null
          travel_destination: string | null
          certifications: string | null
          city: string | null
          contact_clicks: number
          created_at: string
          current_period_end: string | null
          day_of_week_discount: Json | null
          display_name: string | null
          education: string | null
          education_entries: Json | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          headline: string | null
          height_inches: number | null
          id: string
          incall_amenities: string[] | null
          incall_price: number | null
          is_active: boolean | null
          is_banned: boolean | null
          identity_verified_at: string | null
          is_demo: boolean | null
          is_featured: boolean | null
          is_suspended: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_seen_at: string | null
          lgbtq_affirming: boolean | null
          location_marker_type: string | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          modality: string | null
          mobile_extras: string[] | null
          moderation_notes: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: string[] | null
          phone: string | null
          phone_number: string | null
          whatsapp: string | null
          session_lengths: number[] | null
          photo_limit: number | null
          pricing_sessions: Json | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_status: string | null
          rejected_at: string | null
          rejected_by: string | null
          location_type: string | null
          sms_enabled: boolean | null
          promotions: Json | null
          regular_discounts: Json | null
          rejection_reason: string | null
          review_count: number
          role: string
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          slug: string | null
          specialties: string[] | null
          starting_price: number | null
          state: string | null
          status: string | null
          street_reference: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
          submitted_at: string | null
          subscription_tier: string | null
          suspension_reason: string | null
          tagline: string | null
          terms_accepted_at: string | null
          tier: string | null
          training: string | null
          travel_schedule: Json | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          visibility_level: number | null
          visibility_status: string | null
          website: string | null
          weekly_special: Json | null
          weight_lb: number | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          _tier?: string | null
          account_status?: string
          add_ons?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          business_trips?: Json | null
          business_hours?: Json | null
          custom_faq?: Json | null
          current_status?: string | null
          service_radius_km?: number | null
          travel_destination?: string | null
          certifications?: string | null
          city?: string | null
          contact_clicks?: number
          created_at?: string
          current_period_end?: string | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          headline?: string | null
          height_inches?: number | null
          id: string
          incall_amenities?: string[] | null
          incall_price?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          identity_verified_at?: string | null
          is_demo?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_seen_at?: string | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modality?: string | null
          mobile_extras?: string[] | null
          moderation_notes?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          whatsapp?: string | null
          session_lengths?: number[] | null
          photo_limit?: number | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          promotions?: Json | null
          regular_discounts?: Json | null
          rejection_reason?: string | null
          review_count?: number
          role?: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          submitted_at?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          training?: string | null
          travel_schedule?: Json | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          visibility_level?: number | null
          visibility_status?: string | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          _tier?: string | null
          account_status?: string
          add_ons?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          business_trips?: Json | null
          business_hours?: Json | null
          custom_faq?: Json | null
          current_status?: string | null
          service_radius_km?: number | null
          travel_destination?: string | null
          certifications?: string | null
          city?: string | null
          contact_clicks?: number
          created_at?: string
          current_period_end?: string | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string
          incall_amenities?: string[] | null
          incall_price?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          identity_verified_at?: string | null
          is_demo?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_seen_at?: string | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modality?: string | null
          mobile_extras?: string[] | null
          moderation_notes?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          whatsapp?: string | null
          session_lengths?: number[] | null
          photo_limit?: number | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          promotions?: Json | null
          regular_discounts?: Json | null
          rejection_reason?: string | null
          review_count?: number
          role?: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          submitted_at?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          training?: string | null
          travel_schedule?: Json | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          visibility_level?: number | null
          visibility_status?: string | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      public_therapists: {
        Row: {
          _tier: string | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          bio: string | null
          body_type: string | null
          booking_platform: string | null
          booking_url: string | null
          city: string | null
          display_name: string | null
          email_address: string | null
          full_name: string | null
          gallery_photos: string[] | null
          headline: string | null
          height_inches: number | null
          id: string
          incall_price: number | null
          is_featured: boolean
          is_verified_identity: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          languages: string[] | null
          lgbtq_affirming: boolean
          location_marker_type: string | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          modality: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          outcall_price: number | null
          payment_methods: string[] | null
          phone: string | null
          phone_number: string | null
          whatsapp: string | null
          session_lengths: number[] | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_photo: string | null
          profile_status: string | null
          rejected_at: string | null
          rejected_by: string | null
          location_type: string | null
          sms_enabled: boolean | null
          promotions: Json | null
          review_count: number | null
          service_categories: string[] | null
          slug: string | null
          specialties: string[] | null
          start_year: number | null
          starting_price: number | null
          state: string | null
          subscription_tier: string | null
          updated_at: string
          verification_status: string | null
          visibility_status: string | null
          website: string | null
          weight_lb: number | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          _tier?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          city?: string | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          gallery_photos?: string[] | null
          headline?: string | null
          height_inches?: number | null
          id: string
          incall_price?: number | null
          is_featured?: boolean
          is_verified_identity?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          lgbtq_affirming?: boolean
          location_marker_type?: string | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modality?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          whatsapp?: string | null
          session_lengths?: number[] | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_photo?: string | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          promotions?: Json | null
          review_count?: number | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          start_year?: number | null
          starting_price?: number | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          verification_status?: string | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          _tier?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          city?: string | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          gallery_photos?: string[] | null
          headline?: string | null
          height_inches?: number | null
          id?: string
          incall_price?: number | null
          is_featured?: boolean
          is_verified_identity?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          lgbtq_affirming?: boolean
          location_marker_type?: string | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modality?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          whatsapp?: string | null
          session_lengths?: number[] | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_photo?: string | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          promotions?: Json | null
          review_count?: number | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          start_year?: number | null
          starting_price?: number | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          verification_status?: string | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_therapists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_therapists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_email: string | null
          client_id: string | null
          content: string | null
          created_at: string
          helpful_count: number
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          profile_id: string | null
          rating: number | null
          review_date: string | null
          review_text: string | null
          reviewer_name: string | null
          status: string | null
          therapist_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      runtime_config: {
        Row: {
          is_secret: boolean
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          is_secret?: boolean
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          is_secret?: boolean
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string | null
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string | null
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string | null
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          event_type: string
          id: string
          payload: Json
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          can_feature: boolean
          can_publish: boolean
          code: string
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_photos: number
          name: string
          price_cents: number
          priority_rank: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          can_feature?: boolean
          can_publish?: boolean
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_photos?: number
          name: string
          price_cents?: number
          priority_rank?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          can_feature?: boolean
          can_publish?: boolean
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_photos?: number
          name?: string
          price_cents?: number
          priority_rank?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      text_verifications: {
        Row: {
          code: string | null
          verification_code: string | null
          phone: string | null
          provider: string | null
          attempt_count: number
          sent_at: string | null
          verified_at: string | null
          expires_at: string | null
          created_at: string
          id: string
          profile_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          moderation_notes: string | null
          status: string
          submitted_text: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          code?: string | null
          verification_code?: string | null
          phone?: string | null
          provider?: string | null
          attempt_count?: number
          sent_at?: string | null
          verified_at?: string | null
          expires_at?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          moderation_notes?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          code?: string | null
          verification_code?: string | null
          phone?: string | null
          provider?: string | null
          attempt_count?: number
          sent_at?: string | null
          verified_at?: string | null
          expires_at?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          moderation_notes?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_locations: {
        Row: {
          city: string
          city_slug: string
          country: string
          created_at: string
          id: string
          is_primary: boolean
          is_visible: boolean
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          state: string | null
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          city: string
          city_slug: string
          country?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          state?: string | null
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          city?: string
          city_slug?: string
          country?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          state?: string | null
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_locations_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_locations_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_locations_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_photos: {
        Row: {
          alt_text: string | null
          approval_status: string
          created_at: string
          file_size: number | null
          id: string
          is_primary: boolean
          mime_type: string | null
          photo_type: string | null
          profile_id: string | null
          public_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sort_order: number
          status: string | null
          storage_path: string
          therapist_profile_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alt_text?: string | null
          approval_status?: string
          created_at?: string
          file_size?: number | null
          id?: string
          is_primary?: boolean
          mime_type?: string | null
          photo_type?: string | null
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string | null
          storage_path: string
          therapist_profile_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alt_text?: string | null
          approval_status?: string
          created_at?: string
          file_size?: number | null
          id?: string
          is_primary?: boolean
          mime_type?: string | null
          photo_type?: string | null
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string | null
          storage_path?: string
          therapist_profile_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_photos_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_photos_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_photos_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_pricing: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_minutes: number
          id: string
          is_visible: boolean
          price_cents: number
          session_type: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_visible?: boolean
          price_cents: number
          session_type: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_visible?: boolean
          price_cents?: number
          session_type?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_pricing_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_pricing_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_pricing_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_profiles: {
        Row: {
          availability_note: string | null
          bio: string | null
          canonical_city_slug: string | null
          city: string
          contact_email: string | null
          country: string
          created_at: string
          display_name: string
          gender: string | null
          headline: string | null
          id: string
          incall_details: string | null
          is_published: boolean
          latitude: number | null
          lgbtq_affirming: boolean
          longitude: number | null
          moderation_status: string
          neighborhood: string | null
          offers_incall: boolean
          offers_outcall: boolean
          outcall_details: string | null
          phone: string | null
          phone_number: string | null
          whatsapp: string | null
          session_lengths: number[] | null
          profile_completion_score: number
          profile_id: string
          seo_description: string | null
          seo_title: string | null
          service_radius_miles: number | null
          slug: string
          state: string | null
          updated_at: string
          user_id: string | null
          verification_status: string
          website_url: string | null
        }
        Insert: {
          availability_note?: string | null
          bio?: string | null
          canonical_city_slug?: string | null
          city: string
          contact_email?: string | null
          country?: string
          created_at?: string
          display_name: string
          gender?: string | null
          headline?: string | null
          id?: string
          incall_details?: string | null
          is_published?: boolean
          latitude?: number | null
          lgbtq_affirming?: boolean
          longitude?: number | null
          moderation_status?: string
          neighborhood?: string | null
          offers_incall?: boolean
          offers_outcall?: boolean
          outcall_details?: string | null
          phone?: string | null
          phone_number?: string | null
          whatsapp?: string | null
          session_lengths?: number[] | null
          profile_completion_score?: number
          profile_id: string
          seo_description?: string | null
          seo_title?: string | null
          service_radius_miles?: number | null
          slug: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          website_url?: string | null
        }
        Update: {
          availability_note?: string | null
          bio?: string | null
          canonical_city_slug?: string | null
          city?: string
          contact_email?: string | null
          country?: string
          created_at?: string
          display_name?: string
          gender?: string | null
          headline?: string | null
          id?: string
          incall_details?: string | null
          is_published?: boolean
          latitude?: number | null
          lgbtq_affirming?: boolean
          longitude?: number | null
          moderation_status?: string
          neighborhood?: string | null
          offers_incall?: boolean
          offers_outcall?: boolean
          outcall_details?: string | null
          phone?: string | null
          phone_number?: string | null
          whatsapp?: string | null
          session_lengths?: number[] | null
          profile_completion_score?: number
          profile_id?: string
          seo_description?: string | null
          seo_title?: string | null
          service_radius_miles?: number | null
          slug?: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_therapists_api"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_visible: boolean
          service_name: string
          sort_order: number
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          service_name: string
          sort_order?: number
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          service_name?: string
          sort_order?: number
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_services_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          provider: string | null
          provider_subscription_id: string | null
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          city: string | null
          city_id: string | null
          contact_email: string | null
          created_at: string
          display_name: string | null
          id: string
          keyword_slugs: string[]
          modalities: string[]
          photo_url: string | null
          segments: string[]
          slug: string | null
          state: string | null
          status: string | null
          tier: string
          updated_at: string
          user_id: string | null
          view_count: number
        }
        Insert: {
          city?: string | null
          city_id?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          keyword_slugs?: string[]
          modalities?: string[]
          photo_url?: string | null
          segments?: string[]
          slug?: string | null
          state?: string | null
          status?: string | null
          tier?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
        }
        Update: {
          city?: string | null
          city_id?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          keyword_slugs?: string[]
          modalities?: string[]
          photo_url?: string | null
          segments?: string[]
          slug?: string | null
          state?: string | null
          status?: string | null
          tier?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "therapists_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      upgrade_opportunities: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          opportunity_type: string
          reason: string | null
          score: number
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          opportunity_type: string
          reason?: string | null
          score?: number
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          opportunity_type?: string
          reason?: string | null
          score?: number
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrade_opportunities_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upgrade_opportunities_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upgrade_opportunities_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      visibility_addons: {
        Row: {
          addon_type: string
          city_slug: string | null
          created_at: string
          ends_at: string | null
          id: string
          priority_rank: number
          starts_at: string
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          addon_type: string
          city_slug?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          priority_rank?: number
          starts_at?: string
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Update: {
          addon_type?: string
          city_slug?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          priority_rank?: number
          starts_at?: string
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_addons_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_addons_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_addons_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_inquiries: {
        Row: {
          id: string
          client_name: string | null
          client_phone: string | null
          client_email: string | null
          client_hotel: string | null
          service_type: string | null
          preferred_date: string | null
          preferred_time: string | null
          duration_minutes: number
          message: string | null
          source: string
          therapist_id: string | null
          status: string
          intelligence_status: string
          intelligence_report: Json
          ai_conversation: Json
          confirmed_date: string | null
          confirmed_time: string | null
          appointment_id: string | null
          sheets_row_id: string | null
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name?: string | null
          client_phone?: string | null
          client_email?: string | null
          client_hotel?: string | null
          service_type?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          duration_minutes?: number
          message?: string | null
          source?: string
          therapist_id?: string | null
          status?: string
          intelligence_status?: string
          intelligence_report?: Json
          ai_conversation?: Json
          confirmed_date?: string | null
          confirmed_time?: string | null
          appointment_id?: string | null
          sheets_row_id?: string | null
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string | null
          client_phone?: string | null
          client_email?: string | null
          client_hotel?: string | null
          service_type?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          duration_minutes?: number
          message?: string | null
          source?: string
          therapist_id?: string | null
          status?: string
          intelligence_status?: string
          intelligence_report?: Json
          ai_conversation?: Json
          confirmed_date?: string | null
          confirmed_time?: string | null
          appointment_id?: string | null
          sheets_row_id?: string | null
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_profiles: {
        Row: {
          id: string
          profile_id: string
          ready_to_reply: boolean
          availability_mode: string
          arrival_date: string | null
          departure_date: string | null
          pricing_60: string | null
          pricing_90: string | null
          pricing_couples: string | null
          outcall_available: boolean
          couples_available: boolean
          outcall_area: string | null
          alert_phone: string | null
          custom_instructions: string | null
          twilio_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          ready_to_reply?: boolean
          availability_mode?: string
          arrival_date?: string | null
          departure_date?: string | null
          pricing_60?: string | null
          pricing_90?: string | null
          pricing_couples?: string | null
          outcall_available?: boolean
          couples_available?: boolean
          outcall_area?: string | null
          alert_phone?: string | null
          custom_instructions?: string | null
          twilio_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          ready_to_reply?: boolean
          availability_mode?: string
          arrival_date?: string | null
          departure_date?: string | null
          pricing_60?: string | null
          pricing_90?: string | null
          pricing_couples?: string | null
          outcall_available?: boolean
          couples_available?: boolean
          outcall_area?: string | null
          alert_phone?: string | null
          custom_instructions?: string | null
          twilio_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          id: string
          profile_id: string | null
          from_number: string
          to_number: string
          direction: string
          body: string
          twilio_sid: string | null
          intent: string | null
          status: string
          is_manual: boolean
          booking_inquiry_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          from_number: string
          to_number: string
          direction: string
          body: string
          twilio_sid?: string | null
          intent?: string | null
          status?: string
          is_manual?: boolean
          booking_inquiry_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          from_number?: string
          to_number?: string
          direction?: string
          body?: string
          twilio_sid?: string | null
          intent?: string | null
          status?: string
          is_manual?: boolean
          booking_inquiry_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sms_follow_up_alerts: {
        Row: {
          id: string
          profile_id: string | null
          client_phone: string
          our_phone: string
          last_outbound_at: string
          last_inbound_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          client_phone: string
          our_phone: string
          last_outbound_at: string
          last_inbound_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          client_phone?: string
          our_phone?: string
          last_outbound_at?: string
          last_inbound_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_therapist_profiles: {
        Row: {
          availability_note: string | null
          bio: string | null
          canonical_city_slug: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          headline: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          profile_completion_score: number | null
          profile_status: string | null
          rejected_at: string | null
          rejected_by: string | null
          location_type: string | null
          sms_enabled: boolean | null
          seo_description: string | null
          seo_title: string | null
          service_radius_miles: number | null
          slug: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          visibility_status: string | null
        }
        Insert: {
          availability_note?: string | null
          bio?: string | null
          canonical_city_slug?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          headline?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          profile_completion_score?: number | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          service_radius_miles?: number | null
          slug?: string | null
          state?: string | null
          status?: never
          updated_at?: string | null
          visibility_status?: never
        }
        Update: {
          availability_note?: string | null
          bio?: string | null
          canonical_city_slug?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          headline?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          profile_completion_score?: number | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          service_radius_miles?: number | null
          slug?: string | null
          state?: string | null
          status?: never
          updated_at?: string | null
          visibility_status?: never
        }
        Relationships: []
      }
      public_therapist_profiles_safe: {
        Row: {
          availability_note: string | null
          bio: string | null
          canonical_city_slug: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          headline: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          profile_completion_score: number | null
          profile_status: string | null
          rejected_at: string | null
          rejected_by: string | null
          location_type: string | null
          sms_enabled: boolean | null
          seo_description: string | null
          seo_title: string | null
          service_radius_miles: number | null
          slug: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          visibility_status: string | null
        }
        Insert: {
          availability_note?: string | null
          bio?: string | null
          canonical_city_slug?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          headline?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          profile_completion_score?: number | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          service_radius_miles?: number | null
          slug?: string | null
          state?: string | null
          status?: never
          updated_at?: string | null
          visibility_status?: never
        }
        Update: {
          availability_note?: string | null
          bio?: string | null
          canonical_city_slug?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          headline?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          profile_completion_score?: number | null
          profile_status?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          location_type?: string | null
          sms_enabled?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          service_radius_miles?: number | null
          slug?: string | null
          state?: string | null
          status?: never
          updated_at?: string | null
          visibility_status?: never
        }
        Relationships: []
      }
      public_therapists_api: {
        Row: {
          _tier: string | null
          add_ons: Json | null
          areas_served: string[] | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          body_type: string | null
          certifications: string | null
          city: string | null
          contact_clicks: number | null
          display_name: string | null
          education: string | null
          email: string | null
          email_address: string | null
          full_name: string | null
          gallery_photos: string[] | null
          headline: string | null
          height_inches: number | null
          id: string | null
          incall_price: number | null
          is_active: boolean | null
          is_banned: boolean | null
          is_featured: boolean | null
          is_suspended: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          languages: string[] | null
          languages_spoken: string[] | null
          lgbtq_affirming: boolean | null
          massage_techniques: string[] | null
          modality: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          outcall_price: number | null
          outcall_radius_miles: number | null
          phone: string | null
          phone_number: string | null
          whatsapp: string | null
          session_lengths: number[] | null
          pricing_sessions: Json | null
          primary_area: string | null
          profile_photo: string | null
          profile_status: string | null
          rejected_at: string | null
          rejected_by: string | null
          location_type: string | null
          sms_enabled: boolean | null
          promotions: Json | null
          review_count: number | null
          service_categories: string[] | null
          slug: string | null
          specialties: string[] | null
          start_year: number | null
          starting_price: number | null
          state: string | null
          status: string | null
          subscription_tier: string | null
          tagline: string | null
          tier: string | null
          training: string | null
          travel_schedule: Json | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          visibility_status: string | null
          website: string | null
          weight_lb: number | null
          whatsapp_number: string | null
          years_experience: number | null
        }
        Relationships: []
      }
      therapist_analytics_daily: {
        Row: {
          event_count: number | null
          event_date: string | null
          event_name: string | null
          therapist_profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      ensure_therapist_profile_for_profile: {
        Args: { p_profile_id: string }
        Returns: string
      }
      get_ranking_event_counts: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, number>
      }
      increment_profile_contact_clicks: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      mm_column_exists: {
        Args: { target_column: string; target_table: string }
        Returns: boolean
      }
      mm_constraint_allows: {
        Args: {
          column_name: string
          table_name: string
          value_to_check: string
        }
        Returns: boolean
      }
      run_lifecycle_queue_worker: { Args: never; Returns: undefined }
      search_public_therapists: {
        Args: {
          radius_miles?: number
          result_limit?: number
          result_offset?: number
          search_city_slug?: string
          search_lat?: number
          search_lng?: number
        }
        Returns: {
          canonical_city_slug: string
          city: string
          country: string
          display_name: string
          distance_miles: number
          headline: string
          id: string
          latitude: number
          longitude: number
          offers_incall: boolean
          offers_outcall: boolean
          priority_rank: number
          slug: string
          state: string
        }[]
      }
      slugify: { Args: { value: string }; Returns: string }
      update_profile_completion_score: {
        Args: { profile_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
