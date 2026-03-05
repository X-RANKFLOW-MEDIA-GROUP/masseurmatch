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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      featured_masters: {
        Row: {
          city: string | null
          created_at: string
          display_order: number
          ends_at: string | null
          featured_by: string
          id: string
          is_active: boolean
          profile_id: string
          starts_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          display_order?: number
          ends_at?: string | null
          featured_by: string
          id?: string
          is_active?: boolean
          profile_id: string
          starts_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          display_order?: number
          ends_at?: string | null
          featured_by?: string
          id?: string
          is_active?: boolean
          profile_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["verification_status"]
          stripe_report: Json | null
          stripe_session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["verification_status"]
          stripe_report?: Json | null
          stripe_session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["verification_status"]
          stripe_report?: Json | null
          stripe_session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          max_attempts: number
          otp_hash: string
          phone: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          max_attempts?: number
          otp_hash: string
          phone: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          max_attempts?: number
          otp_hash?: string
          phone?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          moderation_reason: string | null
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          profile_id: string
          sort_order: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          moderation_reason?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          profile_id: string
          sort_order?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          moderation_reason?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          profile_id?: string
          sort_order?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          available_now: boolean
          available_now_credits: number
          available_now_expires: string | null
          available_now_last_used: string | null
          available_now_started_at: string | null
          avatar_url: string | null
          bio: string | null
          business_hours: Json | null
          certifications: string[] | null
          city: string | null
          country: string | null
          created_at: string
          custom_faq: Json | null
          display_name: string | null
          full_name: string
          id: string
          incall_price: number | null
          is_active: boolean
          is_seed_profile: boolean
          is_verified_identity: boolean
          is_verified_phone: boolean
          is_verified_photos: boolean
          is_verified_profile: boolean
          languages: string[] | null
          outcall_price: number | null
          payment_methods: string[] | null
          phone: string | null
          presentation_video_url: string | null
          pricing_sessions: Json | null
          seed_claimed_at: string | null
          seed_claimed_by: string | null
          seed_slug: string | null
          service_areas: Json | null
          social_media: Json | null
          specialties: string[] | null
          state: string | null
          status: string
          stripe_verification_session_id: string | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          available_now?: boolean
          available_now_credits?: number
          available_now_expires?: string | null
          available_now_last_used?: string | null
          available_now_started_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_hours?: Json | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_faq?: Json | null
          display_name?: string | null
          full_name?: string
          id?: string
          incall_price?: number | null
          is_active?: boolean
          is_seed_profile?: boolean
          is_verified_identity?: boolean
          is_verified_phone?: boolean
          is_verified_photos?: boolean
          is_verified_profile?: boolean
          languages?: string[] | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          presentation_video_url?: string | null
          pricing_sessions?: Json | null
          seed_claimed_at?: string | null
          seed_claimed_by?: string | null
          seed_slug?: string | null
          service_areas?: Json | null
          social_media?: Json | null
          specialties?: string[] | null
          state?: string | null
          status?: string
          stripe_verification_session_id?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          available_now?: boolean
          available_now_credits?: number
          available_now_expires?: string | null
          available_now_last_used?: string | null
          available_now_started_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_hours?: Json | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_faq?: Json | null
          display_name?: string | null
          full_name?: string
          id?: string
          incall_price?: number | null
          is_active?: boolean
          is_seed_profile?: boolean
          is_verified_identity?: boolean
          is_verified_phone?: boolean
          is_verified_photos?: boolean
          is_verified_profile?: boolean
          languages?: string[] | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          presentation_video_url?: string | null
          pricing_sessions?: Json | null
          seed_claimed_at?: string | null
          seed_claimed_by?: string | null
          seed_slug?: string | null
          service_areas?: Json | null
          social_media?: Json | null
          specialties?: string[] | null
          state?: string | null
          status?: string
          stripe_verification_session_id?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      provider_travel: {
        Row: {
          created_at: string
          destination_city: string
          destination_state: string | null
          end_date: string
          id: string
          is_active: boolean
          notes: string | null
          profile_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_city: string
          destination_state?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          notes?: string | null
          profile_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_city?: string
          destination_state?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          profile_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_travel_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          admin_id: string
          created_at: string
          duration_days: number | null
          ends_at: string | null
          id: string
          is_active: boolean
          reason: string
          reason_detail: string | null
          revoked_at: string | null
          revoked_by: string | null
          starts_at: string
          type: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          reason: string
          reason_detail?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          starts_at?: string
          type: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          reason_detail?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          starts_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_profile_owner: { Args: { _profile_id: string }; Returns: boolean }
      notify_email: {
        Args: { p_data?: Json; p_template: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "provider"
      moderation_status: "pending" | "approved" | "rejected"
      verification_status:
        | "pending"
        | "processing"
        | "verified"
        | "failed"
        | "expired"
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
    Enums: {
      app_role: ["admin", "provider"],
      moderation_status: ["pending", "approved", "rejected"],
      verification_status: [
        "pending",
        "processing",
        "verified",
        "failed",
        "expired",
      ],
    },
  },
} as const
