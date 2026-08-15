export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_test_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          test_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          test_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          test_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_audit_log_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "profile_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_metrics_snapshots: {
        Row: {
          contact_clicks: number | null
          created_at: string | null
          id: string
          profile_completeness: number | null
          profile_id: string
          profile_views: number | null
          segment: string
          snapshot_date: string
          test_id: string
        }
        Insert: {
          contact_clicks?: number | null
          created_at?: string | null
          id?: string
          profile_completeness?: number | null
          profile_id: string
          profile_views?: number | null
          segment: string
          snapshot_date: string
          test_id: string
        }
        Update: {
          contact_clicks?: number | null
          created_at?: string | null
          id?: string
          profile_completeness?: number | null
          profile_id?: string
          profile_views?: number | null
          segment?: string
          snapshot_date?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_metrics_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ab_test_metrics_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_metrics_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_metrics_snapshots_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "profile_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_segment_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          profile_id: string
          segment: string
          test_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          profile_id: string
          segment: string
          test_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          profile_id?: string
          segment?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_segment_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ab_test_segment_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_segment_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_segment_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "profile_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action: string | null
          action_type: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          target_profile_id: string | null
          target_table: string | null
          target_user_id: string | null
        }
        Insert: {
          action?: string | null
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_profile_id?: string | null
          target_table?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string | null
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_profile_id?: string | null
          target_table?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: []
      }
      admin_content: {
        Row: {
          blog_posts: Json
          cities: Json
          id: string
          keywords: Json
          updated_at: string
        }
        Insert: {
          blog_posts?: Json
          cities?: Json
          id?: string
          keywords?: Json
          updated_at?: string
        }
        Update: {
          blog_posts?: Json
          cities?: Json
          id?: string
          keywords?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_profile_analysis_runs: {
        Row: {
          analysis_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_summary: Json
          model: string | null
          profile_id: string
          provider: string | null
          result: Json
          status: string
        }
        Insert: {
          analysis_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_summary?: Json
          model?: string | null
          profile_id: string
          provider?: string | null
          result?: Json
          status?: string
        }
        Update: {
          analysis_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_summary?: Json
          model?: string | null
          profile_id?: string
          provider?: string | null
          result?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_coach_daily_snapshots: {
        Row: {
          average_search_position: number | null
          completed_fields: Json
          contact_clicks_1d: number
          contact_clicks_30d: number
          contact_clicks_7d: number
          contact_rate_pct: number | null
          content_analysis: Json
          content_score: number
          conversion_score: number
          created_at: string
          email_payload: Json
          email_preheader: string | null
          email_subject: string | null
          favorites_7d: number
          generated_at: string
          id: string
          inquiries_7d: number
          local_demand_score: number | null
          local_demand_trend: string | null
          market_analysis: Json
          missing_fields: Json
          photo_analysis: Json
          previous_profile_score: number | null
          profile_id: string
          profile_score: number
          profile_views_1d: number
          profile_views_30d: number
          profile_views_7d: number
          profile_views_change_pct: number | null
          recommendation_list: Json
          recommended_headline: string | null
          score_change: number
          snapshot_date: string
          strongest_keyword: string | null
          subscription_tier: string | null
          top_recommendation_action: string | null
          top_recommendation_impact: string | null
          top_recommendation_key: string | null
          top_recommendation_reason: string | null
          top_recommendation_title: string | null
          trial_day: number | null
          trial_days_remaining: number | null
          trial_status: string | null
          trust_score: number
          trust_signals: Json
          visibility_score: number
          weakest_section: string | null
        }
        Insert: {
          average_search_position?: number | null
          completed_fields?: Json
          contact_clicks_1d?: number
          contact_clicks_30d?: number
          contact_clicks_7d?: number
          contact_rate_pct?: number | null
          content_analysis?: Json
          content_score?: number
          conversion_score?: number
          created_at?: string
          email_payload?: Json
          email_preheader?: string | null
          email_subject?: string | null
          favorites_7d?: number
          generated_at?: string
          id?: string
          inquiries_7d?: number
          local_demand_score?: number | null
          local_demand_trend?: string | null
          market_analysis?: Json
          missing_fields?: Json
          photo_analysis?: Json
          previous_profile_score?: number | null
          profile_id: string
          profile_score?: number
          profile_views_1d?: number
          profile_views_30d?: number
          profile_views_7d?: number
          profile_views_change_pct?: number | null
          recommendation_list?: Json
          recommended_headline?: string | null
          score_change?: number
          snapshot_date?: string
          strongest_keyword?: string | null
          subscription_tier?: string | null
          top_recommendation_action?: string | null
          top_recommendation_impact?: string | null
          top_recommendation_key?: string | null
          top_recommendation_reason?: string | null
          top_recommendation_title?: string | null
          trial_day?: number | null
          trial_days_remaining?: number | null
          trial_status?: string | null
          trust_score?: number
          trust_signals?: Json
          visibility_score?: number
          weakest_section?: string | null
        }
        Update: {
          average_search_position?: number | null
          completed_fields?: Json
          contact_clicks_1d?: number
          contact_clicks_30d?: number
          contact_clicks_7d?: number
          contact_rate_pct?: number | null
          content_analysis?: Json
          content_score?: number
          conversion_score?: number
          created_at?: string
          email_payload?: Json
          email_preheader?: string | null
          email_subject?: string | null
          favorites_7d?: number
          generated_at?: string
          id?: string
          inquiries_7d?: number
          local_demand_score?: number | null
          local_demand_trend?: string | null
          market_analysis?: Json
          missing_fields?: Json
          photo_analysis?: Json
          previous_profile_score?: number | null
          profile_id?: string
          profile_score?: number
          profile_views_1d?: number
          profile_views_30d?: number
          profile_views_7d?: number
          profile_views_change_pct?: number | null
          recommendation_list?: Json
          recommended_headline?: string | null
          score_change?: number
          snapshot_date?: string
          strongest_keyword?: string | null
          subscription_tier?: string | null
          top_recommendation_action?: string | null
          top_recommendation_impact?: string | null
          top_recommendation_key?: string | null
          top_recommendation_reason?: string | null
          top_recommendation_title?: string | null
          trial_day?: number | null
          trial_days_remaining?: number | null
          trial_status?: string | null
          trust_score?: number
          trust_signals?: Json
          visibility_score?: number
          weakest_section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_coach_email_preferences: {
        Row: {
          created_at: string
          daily_email_enabled: boolean
          include_ai_rewrite: boolean
          include_market_insights: boolean
          include_performance: boolean
          include_trial_status: boolean
          last_queued_at: string | null
          last_sent_at: string | null
          profile_id: string
          send_time_local: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_email_enabled?: boolean
          include_ai_rewrite?: boolean
          include_market_insights?: boolean
          include_performance?: boolean
          include_trial_status?: boolean
          last_queued_at?: string | null
          last_sent_at?: string | null
          profile_id: string
          send_time_local?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_email_enabled?: boolean
          include_ai_rewrite?: boolean
          include_market_insights?: boolean
          include_performance?: boolean
          include_trial_status?: boolean
          last_queued_at?: string | null
          last_sent_at?: string | null
          profile_id?: string
          send_time_local?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_content_drafts: {
        Row: {
          accepted_at: string | null
          created_at: string
          field: string
          id: string
          model: string | null
          profile_id: string
          provider: string | null
          rationale: string | null
          source_text: string | null
          status: string
          suggested_keywords: string[]
          suggested_text: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          field: string
          id?: string
          model?: string | null
          profile_id: string
          provider?: string | null
          rationale?: string | null
          source_text?: string | null
          status?: string
          suggested_keywords?: string[]
          suggested_text: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          field?: string
          id?: string
          model?: string | null
          profile_id?: string
          provider?: string | null
          rationale?: string | null
          source_text?: string | null
          status?: string
          suggested_keywords?: string[]
          suggested_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_optimization_runs: {
        Row: {
          after_state: Json
          applied_at: string | null
          applied_fields: string[]
          before_state: Json
          created_at: string
          error_message: string | null
          estimated_impact: Json
          id: string
          model: string | null
          profile_id: string
          provider: string | null
          status: string
        }
        Insert: {
          after_state?: Json
          applied_at?: string | null
          applied_fields?: string[]
          before_state?: Json
          created_at?: string
          error_message?: string | null
          estimated_impact?: Json
          id?: string
          model?: string | null
          profile_id: string
          provider?: string | null
          status?: string
        }
        Update: {
          after_state?: Json
          applied_at?: string | null
          applied_fields?: string[]
          before_state?: Json
          created_at?: string
          error_message?: string | null
          estimated_impact?: Json
          id?: string
          model?: string | null
          profile_id?: string
          provider?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_photo_scores: {
        Row: {
          analysis_mode: string
          analyzed_at: string
          background_score: number
          composition_score: number
          created_at: string
          id: string
          improvements: Json
          lighting_score: number
          model: string | null
          overall_score: number
          photo_id: string
          pose_score: number
          predicted_ctr_lift_pct: number | null
          professionalism_score: number
          profile_id: string
          provider: string | null
          recommendation: string | null
          recommended_primary: boolean
          sharpness_score: number
          smile_score: number
          strengths: Json
          thumbnail_score: number
          updated_at: string
        }
        Insert: {
          analysis_mode?: string
          analyzed_at?: string
          background_score?: number
          composition_score?: number
          created_at?: string
          id?: string
          improvements?: Json
          lighting_score?: number
          model?: string | null
          overall_score?: number
          photo_id: string
          pose_score?: number
          predicted_ctr_lift_pct?: number | null
          professionalism_score?: number
          profile_id: string
          provider?: string | null
          recommendation?: string | null
          recommended_primary?: boolean
          sharpness_score?: number
          smile_score?: number
          strengths?: Json
          thumbnail_score?: number
          updated_at?: string
        }
        Update: {
          analysis_mode?: string
          analyzed_at?: string
          background_score?: number
          composition_score?: number
          created_at?: string
          id?: string
          improvements?: Json
          lighting_score?: number
          model?: string | null
          overall_score?: number
          photo_id?: string
          pose_score?: number
          predicted_ctr_lift_pct?: number | null
          professionalism_score?: number
          profile_id?: string
          provider?: string | null
          recommendation?: string | null
          recommended_primary?: boolean
          sharpness_score?: number
          smile_score?: number
          strengths?: Json
          thumbnail_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_photo_scores_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "profile_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_reports: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          model: string | null
          narrative: string | null
          period_end: string
          period_start: string
          period_type: string
          profile_id: string
          provider: string | null
          summary: Json
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          model?: string | null
          narrative?: string | null
          period_end: string
          period_start: string
          period_type: string
          profile_id: string
          provider?: string | null
          summary?: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          model?: string | null
          narrative?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          profile_id?: string
          provider?: string | null
          summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          city: string | null
          created_at: string
          event_name: string
          id: string
          metadata: Json
          profile_id: string | null
          referrer: string | null
          session_id: string | null
          source_page: string | null
          state: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source_page?: string | null
          state?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source_page?: string | null
          state?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string
          created_at: string | null
          end_time: string
          ends_at: string | null
          id: string
          location_type: string
          notes: string | null
          profile_id: string | null
          service_type: string
          start_time: string
          starts_at: string | null
          status: string
          therapist_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_time: string
          ends_at?: string | null
          id?: string
          location_type?: string
          notes?: string | null
          profile_id?: string | null
          service_type?: string
          start_time: string
          starts_at?: string | null
          status?: string
          therapist_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_time?: string
          ends_at?: string | null
          id?: string
          location_type?: string
          notes?: string | null
          profile_id?: string | null
          service_type?: string
          start_time?: string
          starts_at?: string | null
          status?: string
          therapist_id?: string
          updated_at?: string | null
          user_id?: string | null
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
      blog_posts: {
        Row: {
          author_name: string | null
          author_title: string | null
          category: string | null
          content: string
          cover_alt: string | null
          cover_image: string | null
          created_at: string
          excerpt: string
          id: string
          is_featured: boolean
          published_at: string
          read_time_min: number | null
          seo_description: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          author_title?: string | null
          category?: string | null
          content: string
          cover_alt?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt: string
          id?: string
          is_featured?: boolean
          published_at?: string
          read_time_min?: number | null
          seo_description: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          author_title?: string | null
          category?: string | null
          content?: string
          cover_alt?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_featured?: boolean
          published_at?: string
          read_time_min?: number | null
          seo_description?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_analytics: {
        Row: {
          created_at: string | null
          id: string
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          price: number | null
          profile_id: string | null
          session_duration_minutes: number | null
          session_type: string | null
          technique: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          price?: number | null
          profile_id?: string | null
          session_duration_minutes?: number | null
          session_type?: string | null
          technique?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          price?: number | null
          profile_id?: string | null
          session_duration_minutes?: number | null
          session_type?: string | null
          technique?: string | null
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "booking_inquiries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
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
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bruno_conversations: {
        Row: {
          created_at: string
          id: number
          inbound: string | null
          phone: string | null
          reply: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          inbound?: string | null
          phone?: string | null
          reply?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          inbound?: string | null
          phone?: string | null
          reply?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          description: string
          hero: string
          id: string
          latitude: number
          longitude: number
          name: string
          slug: string
          state: string
          state_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          hero: string
          id?: string
          latitude: number
          longitude: number
          name: string
          slug: string
          state: string
          state_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          hero?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          slug?: string
          state?: string
          state_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_favorites: {
        Row: {
          client_user_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          therapist_id: string
          therapist_profile_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          therapist_id: string
          therapist_profile_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_user_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          therapist_id?: string
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_favorites_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "client_favorites_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_favorites_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_favorites_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "client_favorites_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_favorites_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          admin_notes: string | null
          category: string | null
          complainant_id: string
          created_at: string | null
          description: string
          id: string
          respondent_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          complainant_id: string
          created_at?: string | null
          description: string
          id?: string
          respondent_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          complainant_id?: string
          created_at?: string | null
          description?: string
          id?: string
          respondent_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
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
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
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
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          message: string
          notes: string | null
          preferred_contact: string
          profile_id: string | null
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          message: string
          notes?: string | null
          preferred_contact?: string
          profile_id?: string | null
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          message?: string
          notes?: string | null
          preferred_contact?: string
          profile_id?: string | null
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_preferences: {
        Row: {
          allow_email: boolean
          allow_phone: boolean
          allow_whatsapp: boolean
          auto_reply_message: string | null
          created_at: string
          id: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          allow_email?: boolean
          allow_phone?: boolean
          allow_whatsapp?: boolean
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          allow_email?: boolean
          allow_phone?: boolean
          allow_whatsapp?: boolean
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_preferences_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: true
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_a_id: string
          participant_b_id: string
          profile_id: string | null
          therapist_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_a_id: string
          participant_b_id: string
          profile_id?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_a_id?: string
          participant_b_id?: string
          profile_id?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      demand_scores: {
        Row: {
          city: string
          competition_index: number
          created_at: string
          demand_level: number | null
          demand_score: number | null
          id: string
          last_updated: string | null
          neighborhood: string | null
          score: number
          search_volume_index: number
          state: string
          therapy_type: string | null
          trend: string
          updated_at: string | null
          week_start: string
        }
        Insert: {
          city: string
          competition_index?: number
          created_at?: string
          demand_level?: number | null
          demand_score?: number | null
          id?: string
          last_updated?: string | null
          neighborhood?: string | null
          score: number
          search_volume_index?: number
          state: string
          therapy_type?: string | null
          trend?: string
          updated_at?: string | null
          week_start: string
        }
        Update: {
          city?: string
          competition_index?: number
          created_at?: string
          demand_level?: number | null
          demand_score?: number | null
          id?: string
          last_updated?: string | null
          neighborhood?: string | null
          score?: number
          search_volume_index?: number
          state?: string
          therapy_type?: string | null
          trend?: string
          updated_at?: string | null
          week_start?: string
        }
        Relationships: []
      }
      email_provider_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          provider: string
          provider_event_id: string | null
          recipient_email: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string | null
          recipient_email?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string | null
          recipient_email?: string | null
        }
        Relationships: []
      }
      email_suppressions: {
        Row: {
          created_at: string
          details: Json
          email: string
          id: string
          is_active: boolean
          reason: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json
          email: string
          id?: string
          is_active?: boolean
          reason: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json
          email?: string
          id?: string
          is_active?: boolean
          reason?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          therapist_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          therapist_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          therapist_id?: string
          user_id?: string
        }
        Relationships: []
      }
      featured_masters: {
        Row: {
          city: string | null
          created_at: string
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
          created_at?: string
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
          created_at?: string
          display_order?: number | null
          ends_at?: string | null
          featured_by?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          created_at: string
          document_country: string
          document_expiry: string | null
          document_storage_path: string | null
          document_type: string
          expires_at: string | null
          id: string
          last_error: string | null
          legal_name_hash: string
          metadata: Json | null
          profile_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          selfie_storage_path: string | null
          show_document_type: boolean
          show_first_name: boolean
          show_verification_date: boolean
          show_verified_badge: boolean
          status: string
          stripe_session_id: string | null
          stripe_verification_report_id: string | null
          updated_at: string
          user_id: string
          verification_method: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_country?: string
          document_expiry?: string | null
          document_storage_path?: string | null
          document_type: string
          expires_at?: string | null
          id?: string
          last_error?: string | null
          legal_name_hash: string
          metadata?: Json | null
          profile_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_storage_path?: string | null
          show_document_type?: boolean
          show_first_name?: boolean
          show_verification_date?: boolean
          show_verified_badge?: boolean
          status?: string
          stripe_session_id?: string | null
          stripe_verification_report_id?: string | null
          updated_at?: string
          user_id: string
          verification_method?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_country?: string
          document_expiry?: string | null
          document_storage_path?: string | null
          document_type?: string
          expires_at?: string | null
          id?: string
          last_error?: string | null
          legal_name_hash?: string
          metadata?: Json | null
          profile_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_storage_path?: string | null
          show_document_type?: boolean
          show_first_name?: boolean
          show_verification_date?: boolean
          show_verified_badge?: boolean
          status?: string
          stripe_session_id?: string | null
          stripe_verification_report_id?: string | null
          updated_at?: string
          user_id?: string
          verification_method?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      imported_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          migration_id: string | null
          profile_id: string | null
          rating: number | null
          review_date: string | null
          review_notes: string | null
          review_text: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_anonymized: boolean | null
          reviewer_name: string | null
          source_platform: string
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          migration_id?: string | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_notes?: string | null
          review_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_anonymized?: boolean | null
          reviewer_name?: string | null
          source_platform: string
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          migration_id?: string | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_notes?: string | null
          review_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_anonymized?: boolean | null
          reviewer_name?: string | null
          source_platform?: string
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_reviews_migration_id_fkey"
            columns: ["migration_id"]
            isOneToOne: false
            referencedRelation: "profile_migrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "imported_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_analytics: {
        Row: {
          created_at: string | null
          id: string
          inquiry_type: string | null
          profile_id: string | null
          session_id: string | null
          session_type: string | null
          technique_requested: string | null
          user_city: string | null
          user_ip: string | null
          user_state: string | null
          user_zip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_type?: string | null
          profile_id?: string | null
          session_id?: string | null
          session_type?: string | null
          technique_requested?: string | null
          user_city?: string | null
          user_ip?: string | null
          user_state?: string | null
          user_zip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_type?: string | null
          profile_id?: string | null
          session_id?: string | null
          session_type?: string | null
          technique_requested?: string | null
          user_city?: string | null
          user_ip?: string | null
          user_state?: string | null
          user_zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_insights: {
        Row: {
          avg_competition: number | null
          created_at: string | null
          id: string
          keyword: string
          last_updated: string | null
          recommendation: string | null
          status: string | null
          top_cities: string[] | null
          total_searches: number | null
        }
        Insert: {
          avg_competition?: number | null
          created_at?: string | null
          id?: string
          keyword: string
          last_updated?: string | null
          recommendation?: string | null
          status?: string | null
          top_cities?: string[] | null
          total_searches?: number | null
        }
        Update: {
          avg_competition?: number | null
          created_at?: string | null
          id?: string
          keyword?: string
          last_updated?: string | null
          recommendation?: string | null
          status?: string | null
          top_cities?: string[] | null
          total_searches?: number | null
        }
        Relationships: []
      }
      keyword_trends: {
        Row: {
          city: string | null
          competition_level: string | null
          created_at: string | null
          date: string | null
          id: string
          keyword: string
          peak_detected: boolean | null
          score: number | null
          search_volume: number | null
          state: string | null
          trend_direction: string | null
          week: number | null
          week_over_week_change: number | null
          year: number | null
        }
        Insert: {
          city?: string | null
          competition_level?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          keyword: string
          peak_detected?: boolean | null
          score?: number | null
          search_volume?: number | null
          state?: string | null
          trend_direction?: string | null
          week?: number | null
          week_over_week_change?: number | null
          year?: number | null
        }
        Update: {
          city?: string | null
          competition_level?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          keyword?: string
          peak_detected?: boolean | null
          score?: number | null
          search_volume?: number | null
          state?: string | null
          trend_direction?: string | null
          week?: number | null
          week_over_week_change?: number | null
          year?: number | null
        }
        Relationships: []
      }
      keywords: {
        Row: {
          category: string
          created_at: string
          id: string
          label: string
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          label: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          label?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      lifecycle_email_log: {
        Row: {
          campaign_key: string | null
          created_at: string
          flow_key: string | null
          id: string
          metadata: Json
          provider: string
          provider_id: string | null
          queue_id: string | null
          recipient_email: string
          segment: string | null
          send_category: string
          status: string
          subject: string | null
          suppression_reason: string | null
          template_key: string | null
          user_id: string | null
        }
        Insert: {
          campaign_key?: string | null
          created_at?: string
          flow_key?: string | null
          id?: string
          metadata?: Json
          provider?: string
          provider_id?: string | null
          queue_id?: string | null
          recipient_email: string
          segment?: string | null
          send_category: string
          status: string
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_key?: string | null
          created_at?: string
          flow_key?: string | null
          id?: string
          metadata?: Json
          provider?: string
          provider_id?: string | null
          queue_id?: string | null
          recipient_email?: string
          segment?: string | null
          send_category?: string
          status?: string
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_email_log_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_email_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_email_queue: {
        Row: {
          body_html: string
          body_text: string | null
          campaign_key: string | null
          created_at: string
          error_message: string | null
          flow_key: string | null
          from_address: string | null
          id: string
          idempotency_key: string | null
          max_retries: number
          payload: Json
          processing_started_at: string | null
          provider_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          reply_to: string | null
          retry_count: number
          scheduled_for: string
          segment: string | null
          send_category: string
          sent_at: string | null
          status: string
          subject: string
          suppression_reason: string | null
          template_key: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          campaign_key?: string | null
          created_at?: string
          error_message?: string | null
          flow_key?: string | null
          from_address?: string | null
          id?: string
          idempotency_key?: string | null
          max_retries?: number
          payload?: Json
          processing_started_at?: string | null
          provider_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reply_to?: string | null
          retry_count?: number
          scheduled_for?: string
          segment?: string | null
          send_category: string
          sent_at?: string | null
          status?: string
          subject: string
          suppression_reason?: string | null
          template_key?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          campaign_key?: string | null
          created_at?: string
          error_message?: string | null
          flow_key?: string | null
          from_address?: string | null
          id?: string
          idempotency_key?: string | null
          max_retries?: number
          payload?: Json
          processing_started_at?: string | null
          provider_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reply_to?: string | null
          retry_count?: number
          scheduled_for?: string
          segment?: string | null
          send_category?: string
          sent_at?: string | null
          status?: string
          subject?: string
          suppression_reason?: string | null
          template_key?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      marketing_preferences: {
        Row: {
          marketing_opt_in: boolean
          newsletter_opt_in: boolean
          source: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          marketing_opt_in?: boolean
          newsletter_opt_in?: boolean
          source?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          marketing_opt_in?: boolean
          newsletter_opt_in?: boolean
          source?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
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
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
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
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          admin_reason: string | null
          ai_response: Json | null
          content_type: string | null
          created_at: string
          field_name: string | null
          id: string
          item_type: string
          moderation_provider: string | null
          moderation_reason: string | null
          payload: Json | null
          photo_id: string | null
          priority: string
          profile_id: string
          queue_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          snapshot: Json
          source: string
          status: string
          target_id: string | null
          therapist_profile_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reason?: string | null
          ai_response?: Json | null
          content_type?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          item_type: string
          moderation_provider?: string | null
          moderation_reason?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: string
          profile_id: string
          queue_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          snapshot?: Json
          source?: string
          status?: string
          target_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reason?: string | null
          ai_response?: Json | null
          content_type?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string
          moderation_provider?: string | null
          moderation_reason?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: string
          profile_id?: string
          queue_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          snapshot?: Json
          source?: string
          status?: string
          target_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "moderation_queue_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          channel: string
          created_at: string
          destination: string | null
          error_message: string | null
          id: string
          notification_id: string | null
          payload: Json
          provider: string
          provider_message_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          destination?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          payload?: Json
          provider: string
          provider_message_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          destination?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          payload?: Json
          provider?: string
          provider_message_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_cents: number
          appointment_id: string | null
          created_at: string | null
          currency: string
          id: string
          provider: string | null
          provider_transaction_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          therapist_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_verifications: {
        Row: {
          created_at: string | null
          id: string
          photo_type: string | null
          photo_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_type?: string | null
          photo_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_type?: string | null
          photo_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_ab_tests: {
        Row: {
          control_value: Json | null
          created_at: string | null
          created_by: string | null
          ended_at: string | null
          field_name: string
          id: string
          name: string
          results: Json | null
          started_at: string | null
          status: string | null
          test_segment_percent: number | null
          test_value: Json | null
        }
        Insert: {
          control_value?: Json | null
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          field_name: string
          id?: string
          name: string
          results?: Json | null
          started_at?: string | null
          status?: string | null
          test_segment_percent?: number | null
          test_value?: Json | null
        }
        Update: {
          control_value?: Json | null
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          field_name?: string
          id?: string
          name?: string
          results?: Json | null
          started_at?: string | null
          status?: string | null
          test_segment_percent?: number | null
          test_value?: Json | null
        }
        Relationships: []
      }
      profile_audit_log: {
        Row: {
          created_at: string
          edited_by: string | null
          field_name: string
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          profile_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          edited_by?: string | null
          field_name: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          profile_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          edited_by?: string | null
          field_name?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_migrations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email: string
          id: string
          imported_rating: number | null
          imported_review_count: number | null
          imported_reviews: number | null
          is_verified: boolean | null
          migration_notes: string | null
          platform: string
          profile_id: string | null
          source_url: string
          status: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          imported_rating?: number | null
          imported_review_count?: number | null
          imported_reviews?: number | null
          is_verified?: boolean | null
          migration_notes?: string | null
          platform: string
          profile_id?: string | null
          source_url: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          imported_rating?: number | null
          imported_review_count?: number | null
          imported_reviews?: number | null
          is_verified?: boolean | null
          migration_notes?: string | null
          platform?: string
          profile_id?: string | null
          source_url?: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
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
            referencedRelation: "public_profiles"
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
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reviews: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          moderation_notes: string | null
          profile_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          moderation_notes?: string | null
          profile_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          moderation_notes?: string | null
          profile_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_view_analytics: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          referrer: string | null
          session_id: string | null
          source: string | null
          user_ip: string | null
          viewer_city: string | null
          viewer_state: string | null
          viewer_zip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_ip?: string | null
          viewer_city?: string | null
          viewer_state?: string | null
          viewer_zip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_ip?: string | null
          viewer_city?: string | null
          viewer_state?: string | null
          viewer_zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          _tier: string | null
          accepts_all_genders: boolean | null
          accessibility_features: string[] | null
          add_ons: Json | null
          admin_notes: string | null
          age_conduct_attested_at: string | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_link: string | null
          booking_platform: string | null
          booking_url: string | null
          boost_score: number
          business_hours: Json | null
          business_trips: Json | null
          canonical_city_slug: string | null
          certifications: string | null
          city: string | null
          clientele_preferences: Json | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number | null
          country: string | null
          created_at: string
          current_period_end: string | null
          custom_faq: Json | null
          display_name: string | null
          education: string | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          headline: string | null
          height_inches: number | null
          id: string
          identity_verified_at: string | null
          incall: boolean | null
          incall_amenities: string[] | null
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
          keyword_slugs: string[]
          languages: string[] | null
          languages_spoken: string[] | null
          last_active_at: string | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          location_type: string | null
          longitude: number | null
          massage_setup: string | null
          massage_techniques: string[] | null
          mobile_extras: Json | null
          mobile_hours: Json | null
          modalities: string[] | null
          modality: string | null
          moderation_notes: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: Json | null
          phone: string | null
          phone_number: string | null
          photo_limit: number | null
          photo_url: string | null
          preferred_budget_max: number | null
          preferred_budget_min: number | null
          preferred_languages: string[]
          preferred_radius_miles: number | null
          preferred_specialties: string[]
          presentation_video_url: string | null
          price_max: number | null
          price_min: number | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: Json | null
          products_used: Json | null
          profile_completeness: number | null
          profile_status: string | null
          profile_views: number | null
          promotions: Json | null
          rates: Json | null
          rating_average: number | null
          regular_discounts: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          segments: string[]
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          service_radius_miles: number | null
          session_duration: number | null
          session_lengths: number[] | null
          show_email: boolean
          slug: string | null
          sms_enabled: boolean | null
          social_media: Json | null
          specialties: string[] | null
          specialty: string | null
          start_year: number | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
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
          tier: string | null
          training: string | null
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
          add_ons?: Json | null
          admin_notes?: string | null
          age_conduct_attested_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          boost_score?: number
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          clientele_preferences?: Json | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          country?: string | null
          created_at?: string
          current_period_end?: string | null
          custom_faq?: Json | null
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
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
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
          keyword_slugs?: string[]
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_type?: string | null
          longitude?: number | null
          massage_setup?: string | null
          massage_techniques?: string[] | null
          mobile_extras?: Json | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: Json | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          preferred_budget_max?: number | null
          preferred_budget_min?: number | null
          preferred_languages?: string[]
          preferred_radius_miles?: number | null
          preferred_specialties?: string[]
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: Json | null
          products_used?: Json | null
          profile_completeness?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rates?: Json | null
          rating_average?: number | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          segments?: string[]
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean
          slug?: string | null
          sms_enabled?: boolean | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
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
          tier?: string | null
          training?: string | null
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
          add_ons?: Json | null
          admin_notes?: string | null
          age_conduct_attested_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          boost_score?: number
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          clientele_preferences?: Json | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          country?: string | null
          created_at?: string
          current_period_end?: string | null
          custom_faq?: Json | null
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
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
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
          keyword_slugs?: string[]
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_type?: string | null
          longitude?: number | null
          massage_setup?: string | null
          massage_techniques?: string[] | null
          mobile_extras?: Json | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: Json | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          preferred_budget_max?: number | null
          preferred_budget_min?: number | null
          preferred_languages?: string[]
          preferred_radius_miles?: number | null
          preferred_specialties?: string[]
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: Json | null
          products_used?: Json | null
          profile_completeness?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rates?: Json | null
          rating_average?: number | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          segments?: string[]
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean
          slug?: string | null
          sms_enabled?: boolean | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
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
          tier?: string | null
          training?: string | null
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ranking_events: {
        Row: {
          city: string | null
          created_at: string
          device_type: string | null
          event_name: string
          id: string
          intent: string
          metadata: Json
          neighborhood: string | null
          position_in_results: number | null
          recommendation_source: string | null
          session_id: string
          therapist_id: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          device_type?: string | null
          event_name: string
          id?: string
          intent?: string
          metadata?: Json
          neighborhood?: string | null
          position_in_results?: number | null
          recommendation_source?: string | null
          session_id: string
          therapist_id?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          device_type?: string | null
          event_name?: string
          id?: string
          intent?: string
          metadata?: Json
          neighborhood?: string | null
          position_in_results?: number | null
          recommendation_source?: string | null
          session_id?: string
          therapist_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          body: string
          client_id: string | null
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          profile_id: string | null
          rating: number
          status: string
          therapist_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          author_name: string
          body: string
          client_id?: string | null
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating: number
          status?: string
          therapist_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          body?: string
          client_id?: string | null
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number
          status?: string
          therapist_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          city: string | null
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          state: string | null
          user_ip: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          state?: string | null
          user_ip?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          state?: string | null
          user_ip?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          client_user_id: string | null
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          result_count: number | null
          results_count: number | null
          searched_at: string
          user_id: string
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          result_count?: number | null
          results_count?: number | null
          searched_at?: string
          user_id: string
        }
        Update: {
          client_user_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          results_count?: number | null
          searched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          allow_public_profiles: boolean
          billing_email: string
          facebook_pixel_id: string | null
          google_analytics_id: string | null
          id: string
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
        }
        Insert: {
          allow_public_profiles?: boolean
          billing_email?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          id?: string
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
        }
        Update: {
          allow_public_profiles?: boolean
          billing_email?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          id?: string
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
            isOneToOne: true
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
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
          sender_role?: string
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
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
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
            referencedRelation: "public_profiles"
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
          reviewed_at: string | null
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
          reviewed_at?: string | null
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
          reviewed_at?: string | null
          sent_at?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id?: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      therapist_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          profile_id: string | null
          start_time: string
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          profile_id?: string | null
          start_time: string
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          profile_id?: string | null
          start_time?: string
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      therapist_learning_scores: {
        Row: {
          city: string
          contact_clicks: number
          contact_rate: number
          ctr: number
          impressions: number
          intent: string
          intent_conversion_rate: number
          profile_clicks: number
          profile_id: string | null
          score_30d: number
          score_7d: number
          therapist_id: string
          updated_at: string
          weighted_score: number
        }
        Insert: {
          city?: string
          contact_clicks?: number
          contact_rate?: number
          ctr?: number
          impressions?: number
          intent?: string
          intent_conversion_rate?: number
          profile_clicks?: number
          profile_id?: string | null
          score_30d?: number
          score_7d?: number
          therapist_id: string
          updated_at?: string
          weighted_score?: number
        }
        Update: {
          city?: string
          contact_clicks?: number
          contact_rate?: number
          ctr?: number
          impressions?: number
          intent?: string
          intent_conversion_rate?: number
          profile_clicks?: number
          profile_id?: string | null
          score_30d?: number
          score_7d?: number
          therapist_id?: string
          updated_at?: string
          weighted_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "therapist_learning_scores_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "therapist_learning_scores_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_learning_scores_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_photos: {
        Row: {
          approval_status: string | null
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          is_primary: boolean | null
          mime_type: string | null
          photo_type: string
          profile_id: string | null
          public_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sort_order: number
          status: string
          storage_path: string | null
          therapist_profile_id: string | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          approval_status?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          photo_type?: string
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string
          storage_path?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          approval_status?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          photo_type?: string
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string
          storage_path?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      therapists: {
        Row: {
          bio: string
          city: string | null
          city_id: string
          contact_email: string
          created_at: string
          display_name: string
          gallery: Json
          gay_friendly: boolean
          id: string
          incall: boolean
          inclusive: boolean
          keyword_slugs: string[]
          languages: string[]
          latitude: number
          longitude: number
          modalities: string[]
          outcall: boolean
          phone: string
          photo_url: string
          price_range: string
          profile_completeness: number
          segments: string[]
          slug: string
          state: string
          status: string
          tier: string
          updated_at: string
          user_id: string | null
          view_count: number
          website: string
        }
        Insert: {
          bio: string
          city?: string | null
          city_id: string
          contact_email: string
          created_at?: string
          display_name: string
          gallery?: Json
          gay_friendly?: boolean
          id?: string
          incall?: boolean
          inclusive?: boolean
          keyword_slugs?: string[]
          languages?: string[]
          latitude: number
          longitude: number
          modalities?: string[]
          outcall?: boolean
          phone: string
          photo_url: string
          price_range: string
          profile_completeness?: number
          segments?: string[]
          slug: string
          state: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
          website: string
        }
        Update: {
          bio?: string
          city?: string | null
          city_id?: string
          contact_email?: string
          created_at?: string
          display_name?: string
          gallery?: Json
          gay_friendly?: boolean
          id?: string
          incall?: boolean
          inclusive?: boolean
          keyword_slugs?: string[]
          languages?: string[]
          latitude?: number
          longitude?: number
          modalities?: string[]
          outcall?: boolean
          phone?: string
          photo_url?: string
          price_range?: string
          profile_completeness?: number
          segments?: string[]
          slug?: string
          state?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapists_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          marketing_enabled: boolean
          phone_e164: string | null
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          marketing_enabled?: boolean
          phone_e164?: string | null
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          marketing_enabled?: boolean
          phone_e164?: string | null
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_events: {
        Row: {
          created_at: string
          email: string | null
          event_name: string
          id: string
          metadata: Json | null
          page_path: string | null
          referrer: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      waitlist_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string
          fingerprint: string
          id: string
          request_count: number
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          fingerprint: string
          id?: string
          request_count?: number
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          fingerprint?: string
          id?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          campaign: string | null
          created_at: string
          email: string
          id: string
          metadata: Json | null
          normalized_email: string
          page_path: string | null
          referrer: string | null
          role: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          normalized_email: string
          page_path?: string | null
          referrer?: string | null
          role?: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          normalized_email?: string
          page_path?: string | null
          referrer?: string | null
          role?: string
          source?: string | null
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
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
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
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_profiles: {
        Row: {
          city: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          profile_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      subscription_plans: {
        Row: {
          code: string | null
          id: string
        }
        Insert: {
          code?: string | null
          id?: string
        }
        Update: {
          code?: string | null
          id?: string
        }
        Relationships: []
      }
      therapist_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          profile_id: string | null
          provider: string | null
          provider_subscription_id: string | null
          status: string | null
          therapist_profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          profile_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string | null
          therapist_profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          profile_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string | null
          therapist_profile_id?: string | null
          updated_at?: string | null
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
      checkout_sessions: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          profile_id: string | null
          status: string | null
          therapist_profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          profile_id?: string | null
          status?: string | null
          therapist_profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          profile_id?: string | null
          status?: string | null
          therapist_profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ai_profile_coach_source: {
        Row: {
          accepts_all_genders: boolean | null
          affiliations: string[] | null
          approved_photo_count: number | null
          areas_served: string[] | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          average_search_position: number | null
          bio: string | null
          business_trips: Json | null
          certifications: string | null
          city: string | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number | null
          contact_clicks_1d: number | null
          contact_clicks_30d: number | null
          contact_clicks_7d: number | null
          country: string | null
          current_period_end: string | null
          display_name: string | null
          education_entries: Json | null
          favorites_7d: number | null
          featured_until: string | null
          headline: string | null
          incall: boolean | null
          incall_amenities: string[] | null
          incall_price: number | null
          inquiries_7d: number | null
          inquiry_count: number | null
          is_featured: boolean | null
          is_verified_email: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_seen_at: string | null
          lgbtq_affirming: boolean | null
          local_demand_score: number | null
          local_demand_trend: string | null
          massage_setup: string | null
          massage_techniques: string[] | null
          mobile_extras: string[] | null
          modalities: string[] | null
          neighborhood: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_price: number | null
          payment_methods: string[] | null
          photo_url: string | null
          pricing_sessions: Json | null
          products_used: string[] | null
          profile_completeness: number | null
          profile_completion_score: number | null
          profile_id: string | null
          profile_status: string | null
          profile_views: number | null
          profile_views_1d: number | null
          profile_views_30d: number | null
          profile_views_7d: number | null
          rates: Json | null
          recipient_email: string | null
          review_count: number | null
          service_categories: string[] | null
          session_lengths: number[] | null
          slug: string | null
          specialties: string[] | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          studio_amenities: string[] | null
          subscription_current_period_end: string | null
          subscription_current_period_start: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tagline: string | null
          training: string | null
          travel_schedule: Json | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          view_count: number | null
          visibility_status: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_all_genders?: boolean | null
          affiliations?: never
          approved_photo_count?: never
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          average_search_position?: never
          bio?: string | null
          business_trips?: never
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          contact_clicks_1d?: never
          contact_clicks_30d?: never
          contact_clicks_7d?: never
          country?: string | null
          current_period_end?: string | null
          display_name?: never
          education_entries?: never
          favorites_7d?: never
          featured_until?: string | null
          headline?: string | null
          incall?: boolean | null
          incall_amenities?: never
          incall_price?: number | null
          inquiries_7d?: never
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_seen_at?: string | null
          lgbtq_affirming?: boolean | null
          local_demand_score?: never
          local_demand_trend?: never
          massage_setup?: never
          massage_techniques?: string[] | null
          mobile_extras?: never
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_price?: number | null
          payment_methods?: never
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_used?: never
          profile_completeness?: number | null
          profile_completion_score?: never
          profile_id?: string | null
          profile_status?: string | null
          profile_views?: number | null
          profile_views_1d?: never
          profile_views_30d?: never
          profile_views_7d?: never
          rates?: Json | null
          recipient_email?: never
          review_count?: number | null
          service_categories?: string[] | null
          session_lengths?: number[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          studio_amenities?: never
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          training?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_all_genders?: boolean | null
          affiliations?: never
          approved_photo_count?: never
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          average_search_position?: never
          bio?: string | null
          business_trips?: never
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          contact_clicks_1d?: never
          contact_clicks_30d?: never
          contact_clicks_7d?: never
          country?: string | null
          current_period_end?: string | null
          display_name?: never
          education_entries?: never
          favorites_7d?: never
          featured_until?: string | null
          headline?: string | null
          incall?: boolean | null
          incall_amenities?: never
          incall_price?: number | null
          inquiries_7d?: never
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_seen_at?: string | null
          lgbtq_affirming?: boolean | null
          local_demand_score?: never
          local_demand_trend?: never
          massage_setup?: never
          massage_techniques?: string[] | null
          mobile_extras?: never
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_price?: number | null
          payment_methods?: never
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_used?: never
          profile_completeness?: number | null
          profile_completion_score?: never
          profile_id?: string | null
          profile_status?: string | null
          profile_views?: number | null
          profile_views_1d?: never
          profile_views_30d?: never
          profile_views_7d?: never
          rates?: Json | null
          recipient_email?: never
          review_count?: number | null
          service_categories?: string[] | null
          session_lengths?: number[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          studio_amenities?: never
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          training?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          add_ons: Json | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          body_type: string | null
          business_hours: Json | null
          canonical_city_slug: string | null
          city: string | null
          contact_clicks: number | null
          created_at: string | null
          custom_faq: Json | null
          display_name: string | null
          email_address: string | null
          full_name: string | null
          headline: string | null
          height_inches: number | null
          id: string | null
          incall_price: number | null
          is_banned: boolean | null
          is_featured: boolean | null
          is_suspended: boolean | null
          languages: string[] | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          longitude: number | null
          massage_techniques: string[] | null
          modalities: string[] | null
          neighborhood: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall_price: number | null
          outcall_radius_miles: number | null
          phone: string | null
          photo_url: string | null
          presentation_video_url: string | null
          pricing_sessions: Json | null
          profile_completeness: number | null
          profile_views: number | null
          review_count: number | null
          service_categories: string[] | null
          show_email: boolean | null
          slug: string | null
          specialties: string[] | null
          start_year: number | null
          starting_price: number | null
          state: string | null
          status: string | null
          subscription_status: string | null
          subscription_tier: string | null
          travel_schedule: Json | null
          updated_at: string | null
          verification_status: string | null
          visibility_status: string | null
          website: string | null
          weight_lb: number | null
          whatsapp_number: string | null
          years_experience: number | null
        }
        Insert: {
          add_ons?: Json | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          business_hours?: Json | null
          canonical_city_slug?: string | null
          city?: string | null
          contact_clicks?: number | null
          created_at?: string | null
          custom_faq?: Json | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_banned?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          longitude?: number | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius_miles?: number | null
          phone?: string | null
          photo_url?: string | null
          presentation_video_url?: string | null
          pricing_sessions?: Json | null
          profile_completeness?: number | null
          profile_views?: number | null
          review_count?: number | null
          service_categories?: string[] | null
          show_email?: boolean | null
          slug?: string | null
          specialties?: string[] | null
          start_year?: number | null
          starting_price?: number | null
          state?: string | null
          status?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Update: {
          add_ons?: Json | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          business_hours?: Json | null
          canonical_city_slug?: string | null
          city?: string | null
          contact_clicks?: number | null
          created_at?: string | null
          custom_faq?: Json | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_banned?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          longitude?: number | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius_miles?: number | null
          phone?: string | null
          photo_url?: string | null
          presentation_video_url?: string | null
          pricing_sessions?: Json | null
          profile_completeness?: number | null
          profile_views?: number | null
          review_count?: number | null
          service_categories?: string[] | null
          show_email?: boolean | null
          slug?: string | null
          specialties?: string[] | null
          start_year?: number | null
          starting_price?: number | null
          state?: string | null
          status?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      public_verification_status: {
        Row: {
          document_type: string | null
          is_verified: boolean | null
          profile_id: string | null
          show_badge: boolean | null
          verification_method: string | null
          verified_since: string | null
        }
        Insert: {
          document_type?: never
          is_verified?: never
          profile_id?: string | null
          show_badge?: never
          verification_method?: string | null
          verified_since?: never
        }
        Update: {
          document_type?: never
          is_verified?: never
          profile_id?: string | null
          show_badge?: never
          verification_method?: string | null
          verified_since?: never
        }
        Relationships: []
      }
      public_imported_reviews: {
        Row: {
          id: string
          profile_id: string | null
          reviewer_name: string | null
          rating: number | null
          review_text: string | null
          review_date: string | null
          public_label: string | null
          imported_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: never
          profile_id?: string | null
          reviewer_name?: never
          rating?: never
          review_text?: never
          review_date?: never
          public_label?: never
          imported_at?: never
          created_at?: never
        }
        Update: {
          id?: never
          profile_id?: never
          reviewer_name?: never
          rating?: never
          review_text?: never
          review_date?: never
          public_label?: never
          imported_at?: never
          created_at?: never
        }
        Relationships: []
      }
    }
    Functions: {
      can_send_marketing_email: {
        Args: { p_email: string; p_send_time?: string; p_user_id: string }
        Returns: {
          eligible: boolean
          reason: string
        }[]
      }
      claim_lifecycle_queue_batch: {
        Args: { p_limit?: number }
        Returns: {
          body_html: string
          body_text: string | null
          campaign_key: string | null
          created_at: string
          error_message: string | null
          flow_key: string | null
          from_address: string | null
          id: string
          idempotency_key: string | null
          max_retries: number
          payload: Json
          processing_started_at: string | null
          provider_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          reply_to: string | null
          retry_count: number
          scheduled_for: string
          segment: string | null
          send_category: string
          sent_at: string | null
          status: string
          subject: string
          suppression_reason: string | null
          template_key: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "lifecycle_email_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      current_user_role: { Args: never; Returns: string }
      ensure_therapist_profile_for_profile: {
        Args: { p_profile_id: string }
        Returns: string
      }
      get_profile_view_analytics: {
        Args: { p_profile_id: string; p_since: string }
        Returns: Json
      }
      get_nearby_therapists: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_miles?: number
        }
        Returns: {
          available_now: boolean
          bio: string
          boost_score: number
          city: string
          distance_miles: number
          featured_until: string
          id: string
          incall_price: number
          modality: string
          name: string
          neighborhood: string
          outcall_price: number
          profile_photo: string
          slug: string
          specialties: string[]
          starting_price: number
          tier: string
        }[]
      }
      increment_profile_contact_clicks: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      invoke_edge_function: {
        Args: { p_body?: Json; p_function_name: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_major_us_holiday: { Args: { p_date: string }; Returns: boolean }
      log_email_provider_event: {
        Args: {
          p_event_type: string
          p_payload?: Json
          p_provider: string
          p_provider_event_id: string
          p_recipient_email: string
        }
        Returns: string
      }
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
      process_stripe_identity_requires_input: {
        Args: { p_last_error_reason?: string; p_stripe_session_id: string }
        Returns: undefined
      }
      process_stripe_identity_verified:
        | {
            Args: { p_stripe_session_id: string; p_user_id: string }
            Returns: undefined
          }
        | {
            Args: { p_stripe_session_id: string; p_user_id: string }
            Returns: undefined
          }
      process_stripe_payment_intent_failed: {
        Args: { p_provider_transaction_id: string }
        Returns: undefined
      }
      process_stripe_payment_intent_succeeded:
        | {
            Args: {
              p_appointment_id?: string
              p_provider_transaction_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_appointment_id?: string
              p_provider_transaction_id: string
            }
            Returns: undefined
          }
      publish_verified_identity_profile: {
        Args: { p_user_id: string }
        Returns: {
          _tier: string | null
          accepts_all_genders: boolean | null
          accessibility_features: string[] | null
          add_ons: Json | null
          admin_notes: string | null
          age_conduct_attested_at: string | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_link: string | null
          boost_score: number
          business_hours: Json | null
          canonical_city_slug: string | null
          certifications: string | null
          city: string | null
          clientele_preferences: Json | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number | null
          country: string | null
          created_at: string
          current_period_end: string | null
          custom_faq: Json | null
          display_name: string | null
          education: string | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          headline: string | null
          height_inches: number | null
          id: string
          identity_verified_at: string | null
          incall: boolean | null
          incall_amenities: string[] | null
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
          keyword_slugs: string[]
          languages: string[] | null
          languages_spoken: string[] | null
          last_active_at: string | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          location_type: string | null
          longitude: number | null
          massage_setup: string | null
          massage_techniques: string[] | null
          mobile_extras: Json | null
          mobile_hours: Json | null
          modalities: string[] | null
          modality: string | null
          moderation_notes: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: Json | null
          phone: string | null
          phone_number: string | null
          photo_limit: number | null
          photo_url: string | null
          preferred_budget_max: number | null
          preferred_budget_min: number | null
          preferred_languages: string[]
          preferred_radius_miles: number | null
          preferred_specialties: string[]
          presentation_video_url: string | null
          price_max: number | null
          price_min: number | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: Json | null
          products_used: Json | null
          profile_completeness: number | null
          profile_status: string | null
          profile_views: number | null
          promotions: Json | null
          rates: Json | null
          rating_average: number | null
          regular_discounts: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          segments: string[]
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          service_radius_miles: number | null
          session_duration: number | null
          session_lengths: number[] | null
          show_email: boolean
          slug: string | null
          sms_enabled: boolean | null
          social_media: Json | null
          specialties: string[] | null
          specialty: string | null
          start_year: number | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
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
          tier: string | null
          training: string | null
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
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      queue_lifecycle_email: {
        Args: {
          p_body_html: string
          p_body_text?: string
          p_campaign_key: string
          p_flow_key: string
          p_from_address?: string
          p_idempotency_key?: string
          p_payload?: Json
          p_recipient_email: string
          p_recipient_name: string
          p_reply_to?: string
          p_scheduled_for?: string
          p_segment: string
          p_send_category: string
          p_subject: string
          p_template_key: string
          p_user_id: string
        }
        Returns: {
          queue_id: string
          reason: string
          status: string
        }[]
      }
      refresh_knotty_learning_scores: { Args: never; Returns: undefined }
      review_identity_verification: {
        Args: {
          p_decision: string
          p_rejection_reason?: string
          p_verification_id: string
        }
        Returns: undefined
      }
      run_lifecycle_campaign_jobs: { Args: never; Returns: undefined }
      run_lifecycle_queue_worker: { Args: never; Returns: undefined }
      submit_identity_verification: {
        Args: {
          p_document_country?: string
          p_document_expiry?: string
          p_document_storage_path?: string
          p_document_type: string
          p_legal_name: string
          p_profile_id: string
          p_selfie_storage_path?: string
          p_show_document_type?: boolean
          p_show_first_name?: boolean
          p_show_verification_date?: boolean
        }
        Returns: string
      }
      sync_stripe_subscription:
        | {
            Args: {
              p_current_period_end: string
              p_photo_limit: number
              p_stripe_customer_id: string
              p_stripe_subscription_id: string
              p_subscription_status?: string
              p_tier: string
              p_user_id: string
              p_visibility_level: number
            }
            Returns: undefined
          }
        | {
            Args: {
              p_current_period_end: string
              p_photo_limit: number
              p_stripe_customer_id: string
              p_stripe_subscription_id: string
              p_subscription_status?: string
              p_tier: string
              p_user_id: string
              p_visibility_level: number
            }
            Returns: undefined
          }
      unsubscribe_marketing_email: {
        Args: { p_email: string }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

