export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          actor_profile_id: string | null
          admin_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          target_id: string | null
          target_profile_id: string | null
          target_table: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          actor_profile_id?: string | null
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_profile_id?: string | null
          target_table: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          actor_profile_id?: string | null
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_profile_id?: string | null
          target_table?: string
          target_user_id?: string | null
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
            referencedRelation: "public_therapists"
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
      appointments: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          notes: string | null
          profile_id: string | null
          starts_at: string | null
          status: string
          therapist_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          starts_at?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          starts_at?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          admin_id: string | null
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
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
          content: string
          created_at: string
          excerpt: string
          id: string
          published_at: string
          seo_description: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt: string
          id?: string
          published_at?: string
          seo_description: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string
          seo_description?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_inquiries: {
        Row: {
          admin_notes: string | null
          ai_conversation: Json | null
          appointment_id: string | null
          client_email: string | null
          client_hotel: string | null
          client_name: string | null
          client_phone: string | null
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          intelligence_report: Json | null
          intelligence_status: string
          message: string | null
          preferred_date: string | null
          preferred_time: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_type: string | null
          sheets_row_id: string | null
          source: string | null
          status: string
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          ai_conversation?: Json | null
          appointment_id?: string | null
          client_email?: string | null
          client_hotel?: string | null
          client_name?: string | null
          client_phone?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intelligence_report?: Json | null
          intelligence_status?: string
          message?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: string | null
          sheets_row_id?: string | null
          source?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          ai_conversation?: Json | null
          appointment_id?: string | null
          client_email?: string | null
          client_hotel?: string | null
          client_name?: string | null
          client_phone?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intelligence_report?: Json | null
          intelligence_status?: string
          message?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: string | null
          sheets_row_id?: string | null
          source?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "public_therapists"
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
      client_favorites: {
        Row: {
          client_user_id: string | null
          created_at: string | null
          id: string
          profile_id: string | null
          therapist_id: string | null
          therapist_profile_id: string | null
          user_id: string | null
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          therapist_profile_id?: string | null
          user_id?: string | null
        }
        Update: {
          client_user_id?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          therapist_profile_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_notes: string | null
          category: string | null
          complainant_id: string | null
          created_at: string | null
          description: string | null
          id: string
          message: string | null
          profile_id: string | null
          reported_profile_id: string | null
          reporter_email: string | null
          reporter_id: string | null
          resolved_at: string | null
          respondent_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          complainant_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          message?: string | null
          profile_id?: string | null
          reported_profile_id?: string | null
          reporter_email?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          respondent_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          complainant_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          message?: string | null
          profile_id?: string | null
          reported_profile_id?: string | null
          reporter_email?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          respondent_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "public_therapists"
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
      conversations: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          therapist_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
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
      favorites: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          therapist_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_masters: {
        Row: {
          city: string | null
          created_at: string | null
          display_order: number | null
          ends_at: string | null
          featured_by: string | null
          id: string
          is_active: boolean | null
          profile_id: string | null
          starts_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          display_order?: number | null
          ends_at?: string | null
          featured_by?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          starts_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          display_order?: number | null
          ends_at?: string | null
          featured_by?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          starts_at?: string | null
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
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_profile_data: {
        Row: {
          created_at: string | null
          id: string
          payload: Json | null
          profile_id: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json | null
          profile_id?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json | null
          profile_id?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      imported_reviews: {
        Row: {
          created_at: string | null
          id: string
          imported_at: string | null
          profile_id: string | null
          rating: number | null
          review_date: string | null
          review_text: string | null
          reviewer_name: string | null
          source_platform: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          imported_at?: string | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          source_platform?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          imported_at?: string | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          source_platform?: string | null
          source_url?: string | null
        }
        Relationships: []
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
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          read_at: string | null
          sender_user_id: string | null
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_user_id?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          actor_admin_id: string | null
          created_at: string
          detail: string | null
          id: string
          reason: string
          resolved_at: string | null
          target_profile_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          actor_admin_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          reason: string
          resolved_at?: string | null
          target_profile_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          actor_admin_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          reason?: string
          resolved_at?: string | null
          target_profile_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          admin_reason: string | null
          ai_response: Json | null
          content_id: string | null
          content_type: string
          created_at: string
          field_name: string | null
          id: string
          item_type: string | null
          moderation_provider: string | null
          moderation_reason: string | null
          notes: string | null
          payload: Json | null
          photo_id: string | null
          priority: number | null
          profile_id: string | null
          queue_type: string | null
          resolved_at: string | null
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
          content_type: string
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string | null
          moderation_provider?: string | null
          moderation_reason?: string | null
          notes?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: number | null
          profile_id?: string | null
          queue_type?: string | null
          resolved_at?: string | null
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
          content_type?: string
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string | null
          moderation_provider?: string | null
          moderation_reason?: string | null
          notes?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: number | null
          profile_id?: string | null
          queue_type?: string | null
          resolved_at?: string | null
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
            referencedRelation: "public_therapists"
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
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          channel: string | null
          created_at: string | null
          destination: string | null
          error_message: string | null
          id: string
          notification_id: string | null
          payload: Json | null
          provider: string | null
          provider_message_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          destination?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          payload?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          destination?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          payload?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          read_at: string | null
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
          metadata?: Json | null
          read_at?: string | null
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
          metadata?: Json | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_cents: number | null
          appointment_id: string | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_transaction_id: string | null
          status: string | null
          stripe_refund_id: string | null
          therapist_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          stripe_refund_id?: string | null
          therapist_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          stripe_refund_id?: string | null
          therapist_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_moderations: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          flagged_at: string | null
          id: string
          photo_id: string | null
          reason: string | null
          reviewed_at: string | null
          status: string | null
          therapist_id: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          flagged_at?: string | null
          id?: string
          photo_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          therapist_id?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          flagged_at?: string | null
          id?: string
          photo_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          therapist_id?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      profile_documents: {
        Row: {
          created_at: string | null
          document_type: string | null
          id: string
          profile_id: string | null
          status: string | null
          storage_path: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          id?: string
          profile_id?: string | null
          status?: string | null
          storage_path?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          id?: string
          profile_id?: string | null
          status?: string | null
          storage_path?: string | null
          type?: string | null
          url?: string | null
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
            referencedRelation: "public_therapists"
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
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
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
          therapist_profile_id: string
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
      profile_reports: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          id: string
          ip_hash: string | null
          profile_id: string
          profile_name: string | null
          profile_slug: string | null
          reason: string
          reporter_email: string | null
          reporter_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          profile_id: string
          profile_name?: string | null
          profile_slug?: string | null
          reason: string
          reporter_email?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          profile_id?: string
          profile_name?: string | null
          profile_slug?: string | null
          reason?: string
          reporter_email?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          _tier: string | null
          accepts_all_genders: boolean | null
          accessibility_features: string[] | null
          account_status: string
          add_ons: Json | null
          additional_services: string[] | null
          admin_notes: string | null
          affiliations: string[] | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          availability_note: string | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_link: string | null
          booking_platform: string | null
          booking_url: string | null
          business_hours: Json | null
          business_trips: Json | null
          canonical_city_slug: string | null
          certifications: string | null
          city: string | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number
          country: string | null
          created_at: string
          current_period_end: string | null
          current_status: string | null
          custom_faq: Json | null
          day_of_week_discount: Json | null
          display_name: string | null
          education: string | null
          education_entries: Json | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          gender: string | null
          headline: string | null
          height_inches: number | null
          id: string
          identity_verified_at: string | null
          incall: boolean | null
          incall_amenities: string[] | null
          incall_details: string | null
          incall_price: number | null
          inquiry_count: number | null
          is_active: boolean | null
          is_banned: boolean | null
          is_demo: boolean
          is_featured: boolean | null
          is_suspended: boolean | null
          is_verified_email: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          keyword_slugs: string[] | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_active_at: string | null
          last_seen_at: string | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          location_marker_type: string | null
          location_type: string | null
          longitude: number | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          mobile_extras: string[] | null
          mobile_hours: Json | null
          modalities: string[] | null
          modality: string | null
          moderation_notes: string | null
          moderation_status: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_details: string | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: string[] | null
          phone: string | null
          phone_number: string | null
          photo_limit: number | null
          photo_url: string | null
          presentation_video_url: string | null
          price_max: number | null
          price_min: number | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_completeness: number | null
          profile_completion_score: number | null
          profile_status: string | null
          profile_views: number | null
          promotions: Json | null
          rate_disclaimers: string[] | null
          rates: Json | null
          rating_average: number | null
          regular_discounts: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          segments: string[] | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          service_radius_km: number | null
          service_radius_miles: number | null
          session_duration: number | null
          session_lengths: number[] | null
          show_email: boolean
          slug: string | null
          social_media: Json | null
          specialties: string[] | null
          specialty: string | null
          start_date: string | null
          start_year: number | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          status: string | null
          street_reference: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
          studio_amenities: string[] | null
          studio_hours: Json | null
          submitted_at: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_current_period_end: string | null
          subscription_current_period_start: string | null
          subscription_plan: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspension_reason: string | null
          tagline: string | null
          terms_accepted_at: string | null
          training: string | null
          travel_destination: string | null
          travel_schedule: Json | null
          traveling: boolean | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          view_count: number | null
          visibility_level: number | null
          visibility_status: string | null
          visiting: boolean | null
          website: string | null
          weekly_special: Json | null
          weight_lb: number | null
          whatsapp: string | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          _tier?: string | null
          accepts_all_genders?: boolean | null
          accessibility_features?: string[] | null
          account_status?: string
          add_ons?: Json | null
          additional_services?: string[] | null
          admin_notes?: string | null
          affiliations?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          availability_note?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number
          country?: string | null
          created_at?: string
          current_period_end?: string | null
          current_status?: string | null
          custom_faq?: Json | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id: string
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_details?: string | null
          incall_price?: number | null
          inquiry_count?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_demo?: boolean
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          location_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_details?: string | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rate_disclaimers?: string[] | null
          rates?: Json | null
          rating_average?: number | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          segments?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_km?: number | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean
          slug?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_date?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          studio_amenities?: string[] | null
          studio_hours?: Json | null
          submitted_at?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          training?: string | null
          travel_destination?: string | null
          travel_schedule?: Json | null
          traveling?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_level?: number | null
          visibility_status?: string | null
          visiting?: boolean | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          _tier?: string | null
          accepts_all_genders?: boolean | null
          accessibility_features?: string[] | null
          account_status?: string
          add_ons?: Json | null
          additional_services?: string[] | null
          admin_notes?: string | null
          affiliations?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          availability_note?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number
          country?: string | null
          created_at?: string
          current_period_end?: string | null
          current_status?: string | null
          custom_faq?: Json | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_details?: string | null
          incall_price?: number | null
          inquiry_count?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_demo?: boolean
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          location_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_details?: string | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rate_disclaimers?: string[] | null
          rates?: Json | null
          rating_average?: number | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          segments?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_km?: number | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean
          slug?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_date?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          studio_amenities?: string[] | null
          studio_hours?: Json | null
          submitted_at?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          training?: string | null
          travel_destination?: string | null
          travel_schedule?: Json | null
          traveling?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_level?: number | null
          visibility_status?: string | null
          visiting?: boolean | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      provider_travel: {
        Row: {
          created_at: string | null
          destination_city: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          profile_id: string | null
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          destination_city?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          destination_city?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string | null
          created_at: string | null
          endpoint: string | null
          id: string
          is_active: boolean | null
          keys: Json | null
          p256dh: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          keys?: Json | null
          p256dh?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          keys?: Json | null
          p256dh?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ranking_events: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          therapist_id: string | null
          event_name: string
          city: string | null
          neighborhood: string | null
          intent: string
          device_type: string | null
          position_in_results: number | null
          recommendation_source: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          therapist_id?: string | null
          event_name: string
          city?: string | null
          neighborhood?: string | null
          intent?: string
          device_type?: string | null
          position_in_results?: number | null
          recommendation_source?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          therapist_id?: string | null
          event_name?: string
          city?: string | null
          neighborhood?: string | null
          intent?: string
          device_type?: string | null
          position_in_results?: number | null
          recommendation_source?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "public_therapists"
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
      site_settings: {
        Row: {
          allow_public_profiles: boolean
          billing_email: string
          id: string
          key: string | null
          legal_email: string
          maintenance_mode: boolean
          max_elite_photos: number
          max_free_photos: number
          max_pro_photos: number
          max_standard_photos: number
          require_identity_verification: boolean
          require_manual_profile_review: boolean
          require_photo_review: boolean
          require_text_verification: boolean
          signup_enabled: boolean
          support_email: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          allow_public_profiles?: boolean
          billing_email?: string
          id?: string
          key?: string | null
          legal_email?: string
          maintenance_mode?: boolean
          max_elite_photos?: number
          max_free_photos?: number
          max_pro_photos?: number
          max_standard_photos?: number
          require_identity_verification?: boolean
          require_manual_profile_review?: boolean
          require_photo_review?: boolean
          require_text_verification?: boolean
          signup_enabled?: boolean
          support_email?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          allow_public_profiles?: boolean
          billing_email?: string
          id?: string
          key?: string | null
          legal_email?: string
          maintenance_mode?: boolean
          max_elite_photos?: number
          max_free_photos?: number
          max_pro_photos?: number
          max_standard_photos?: number
          require_identity_verification?: boolean
          require_manual_profile_review?: boolean
          require_photo_review?: boolean
          require_text_verification?: boolean
          signup_enabled?: boolean
          support_email?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      sms_follow_up_alerts: {
        Row: {
          client_phone: string
          created_at: string | null
          id: string
          last_inbound_at: string | null
          last_outbound_at: string
          our_phone: string
          profile_id: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          client_phone: string
          created_at?: string | null
          id?: string
          last_inbound_at?: string | null
          last_outbound_at: string
          our_phone: string
          profile_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          client_phone?: string
          created_at?: string | null
          id?: string
          last_inbound_at?: string | null
          last_outbound_at?: string
          our_phone?: string
          profile_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_follow_up_alerts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sms_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          body: string
          booking_inquiry_id: string | null
          created_at: string | null
          direction: string
          from_number: string
          id: string
          intent: string | null
          is_manual: boolean
          profile_id: string | null
          status: string | null
          to_number: string
          twilio_sid: string | null
        }
        Insert: {
          body: string
          booking_inquiry_id?: string | null
          created_at?: string | null
          direction: string
          from_number: string
          id?: string
          intent?: string | null
          is_manual?: boolean
          profile_id?: string | null
          status?: string | null
          to_number: string
          twilio_sid?: string | null
        }
        Update: {
          body?: string
          booking_inquiry_id?: string | null
          created_at?: string | null
          direction?: string
          from_number?: string
          id?: string
          intent?: string | null
          is_manual?: boolean
          profile_id?: string | null
          status?: string | null
          to_number?: string
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_booking_inquiry_id_fkey"
            columns: ["booking_inquiry_id"]
            isOneToOne: false
            referencedRelation: "booking_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sms_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_profiles: {
        Row: {
          alert_phone: string | null
          arrival_date: string | null
          availability_mode: string
          couples_available: boolean
          created_at: string | null
          custom_instructions: string | null
          departure_date: string | null
          id: string
          outcall_area: string | null
          outcall_available: boolean
          pricing_60: string | null
          pricing_90: string | null
          pricing_couples: string | null
          profile_id: string
          ready_to_reply: boolean
          twilio_number: string | null
          updated_at: string | null
        }
        Insert: {
          alert_phone?: string | null
          arrival_date?: string | null
          availability_mode?: string
          couples_available?: boolean
          created_at?: string | null
          custom_instructions?: string | null
          departure_date?: string | null
          id?: string
          outcall_area?: string | null
          outcall_available?: boolean
          pricing_60?: string | null
          pricing_90?: string | null
          pricing_couples?: string | null
          profile_id: string
          ready_to_reply?: boolean
          twilio_number?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_phone?: string | null
          arrival_date?: string | null
          availability_mode?: string
          couples_available?: boolean
          created_at?: string | null
          custom_instructions?: string | null
          departure_date?: string | null
          id?: string
          outcall_area?: string | null
          outcall_available?: boolean
          pricing_60?: string | null
          pricing_90?: string | null
          pricing_couples?: string | null
          profile_id?: string
          ready_to_reply?: boolean
          twilio_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          event_type: string
          failed_at: string | null
          id: string
          payload: Json
          processed_at: string
          processing_error: string | null
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          failed_at?: string | null
          id?: string
          payload: Json
          processed_at?: string
          processing_error?: string | null
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          failed_at?: string | null
          id?: string
          payload?: Json
          processed_at?: string
          processing_error?: string | null
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
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          priority: string
          profile_id: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          profile_id?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          profile_id?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      text_verifications: {
        Row: {
          attempt_count: number
          code: string | null
          created_at: string
          expires_at: string | null
          id: string
          phone: string
          provider: string | null
          sent_at: string | null
          status: string
          submitted_text: string | null
          updated_at: string
          user_id: string
          verification_code: string | null
          verified_at: string | null
        }
        Insert: {
          attempt_count?: number
          code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          phone: string
          provider?: string | null
          sent_at?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Update: {
          attempt_count?: number
          code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          phone?: string
          provider?: string | null
          sent_at?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id?: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "text_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string | null
          id: string
          is_available: boolean
          profile_id: string | null
          start_time: string | null
          therapist_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_available?: boolean
          profile_id?: string | null
          start_time?: string | null
          therapist_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_available?: boolean
          profile_id?: string | null
          start_time?: string | null
          therapist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_availability_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_learning_scores: {
        Row: {
          city: string | null
          contact_clicks: number | null
          contact_rate: number | null
          created_at: string | null
          ctr: number | null
          id: string
          impressions: number | null
          intent: string | null
          profile_clicks: number | null
          profile_id: string | null
          score: number | null
          therapist_id: string | null
          updated_at: string | null
          weighted_score: number | null
        }
        Insert: {
          city?: string | null
          contact_clicks?: number | null
          contact_rate?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          intent?: string | null
          profile_clicks?: number | null
          profile_id?: string | null
          score?: number | null
          therapist_id?: string | null
          updated_at?: string | null
          weighted_score?: number | null
        }
        Update: {
          city?: string | null
          contact_clicks?: number | null
          contact_rate?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          intent?: string | null
          profile_clicks?: number | null
          profile_id?: string | null
          score?: number | null
          therapist_id?: string | null
          updated_at?: string | null
          weighted_score?: number | null
        }
        Relationships: []
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
          therapist_profile_id: string
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
          main_profile_id: string | null
          mime_type: string | null
          moderation_confidence: number | null
          moderation_notes: string | null
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
          main_profile_id?: string | null
          mime_type?: string | null
          moderation_confidence?: number | null
          moderation_notes?: string | null
          photo_type?: string | null
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string | null
          storage_path: string
          therapist_profile_id: string
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
          main_profile_id?: string | null
          mime_type?: string | null
          moderation_confidence?: number | null
          moderation_notes?: string | null
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
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
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
          profile_id: string | null
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
          profile_id?: string | null
          session_type: string
          therapist_profile_id: string
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
          profile_id?: string | null
          session_type?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "public_therapists"
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
          profile_id: string | null
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
          profile_id?: string | null
          service_name: string
          sort_order?: number
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          profile_id?: string | null
          service_name?: string
          sort_order?: number
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
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
          profile_id: string | null
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
          profile_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          profile_id?: string | null
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
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
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
          therapist_profile_id: string
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
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          marketing_enabled: boolean | null
          phone_e164: string | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_enabled?: boolean | null
          phone_e164?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_enabled?: boolean | null
          phone_e164?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_suspensions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          duration_days: number | null
          ends_at: string | null
          id: string
          reason: string | null
          reason_detail: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          reason?: string | null
          reason_detail?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          reason?: string | null
          reason_detail?: string | null
          type?: string | null
          user_id?: string | null
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
          therapist_profile_id: string
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
      waitlist_events: {
        Row: {
          created_at: string
          email: string | null
          event_name: string
          id: string
          metadata: Json
          normalized_email: string | null
          page_path: string | null
          referrer: string | null
          source: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_name: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          source?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_name?: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      waitlist_rate_limits: {
        Row: {
          blocked_until: string | null
          fingerprint: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          fingerprint: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          fingerprint?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          campaign: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          metadata: Json
          normalized_email: string | null
          page_path: string | null
          referrer: string | null
          role: string
          source: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          campaign?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          role?: string
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          campaign?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          role?: string
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      waitlist_voice_ai: {
        Row: {
          created_at: string
          id: string
          plan_tier: string
          profile_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_tier?: string
          profile_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_tier?: string
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
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
      public_therapists: {
        Row: {
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          body_type: string | null
          booking_platform: string | null
          booking_url: string | null
          city: string | null
          country: string | null
          display_name: string | null
          email_address: string | null
          full_name: string | null
          gender: string | null
          headline: string | null
          height_inches: number | null
          id: string | null
          incall_price: number | null
          is_featured: boolean | null
          is_verified_identity: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          keyword_slugs: string[] | null
          languages: string[] | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          location_marker_type: string | null
          longitude: number | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          modalities: string[] | null
          moderation_status: string | null
          neighborhood: string | null
          outcall_price: number | null
          payment_methods: string[] | null
          phone: string | null
          photo_url: string | null
          pricing_sessions: Json | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_completion_score: number | null
          profile_status: string | null
          promotions: Json | null
          review_count: number | null
          segments: string[] | null
          service_categories: string[] | null
          slug: string | null
          specialties: string[] | null
          starting_price: number | null
          state: string | null
          subscription_tier: string | null
          tagline: string | null
          updated_at: string | null
          verification_status: string | null
          view_count: number | null
          visibility_status: string | null
          website: string | null
          weight_lb: number | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          city?: string | null
          country?: string | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_featured?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          moderation_status?: string | null
          neighborhood?: string | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completion_score?: number | null
          profile_status?: string | null
          promotions?: Json | null
          review_count?: number | null
          segments?: string[] | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          state?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          city?: string | null
          country?: string | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_featured?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          moderation_status?: string | null
          neighborhood?: string | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completion_score?: number | null
          profile_status?: string | null
          promotions?: Json | null
          review_count?: number | null
          segments?: string[] | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          state?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
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
      process_stripe_payment_intent_succeeded: {
        Args: { p_provider_transaction_id: string; p_appointment_id?: string | null }
        Returns: undefined
      }
      process_stripe_payment_intent_failed: {
        Args: { p_provider_transaction_id: string }
        Returns: undefined
      }
      sync_stripe_subscription: {
        Args: {
          p_user_id: string | null
          p_stripe_customer_id: string | null
          p_stripe_subscription_id: string
          p_tier: string
          p_photo_limit: number
          p_visibility_level: number
          p_current_period_end: string | null
          p_subscription_status?: string | null
        }
        Returns: undefined
      }
      process_stripe_identity_verified: {
        Args: { p_stripe_session_id: string; p_user_id: string }
        Returns: undefined
      }
      process_stripe_identity_requires_input: {
        Args: { p_stripe_session_id: string; p_last_error_reason?: string | null }
        Returns: undefined
      }
      current_user_role: { Args: never; Returns: string }
      ensure_therapist_profile_for_profile: {
        Args: { p_profile_id: string }
        Returns: string
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
