export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          actor_profile_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: []
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
          action: string
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
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
        Relationships: []
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
        Relationships: []
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
          photo_limit: number | null
          pricing_sessions: Json | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_status: string | null
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
          photo_limit?: number | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_status?: string | null
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
          photo_limit?: number | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_status?: string | null
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
      subscription_plans: {
        Row: {
          billing_period: string | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          photo_limit: number | null
          price: number
          stripe_price_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          billing_period?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_limit?: number | null
          price: number
          stripe_price_id?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          billing_period?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_limit?: number | null
          price?: number
          stripe_price_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

type PublicSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
