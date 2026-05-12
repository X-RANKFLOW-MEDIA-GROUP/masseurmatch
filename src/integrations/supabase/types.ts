export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenericRow = Record<string, any>;
type GenericTable = {
  Row: GenericRow;
  Insert: Partial<GenericRow>;
  Update: Partial<GenericRow>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: GenericRow;
        Insert: Partial<GenericRow>;
        Update: Partial<GenericRow>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          user_id: string;
          role?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<{
          user_id: string;
          role: string;
          created_at?: string | null;
          updated_at?: string | null;
        }>;
        Relationships: [];
      };
      profile_photos: {
        Row: GenericRow;
        Insert: Partial<GenericRow>;
        Update: Partial<GenericRow>;
        Relationships: [];
      };
      [key: string]: GenericTable;
    };
    Views: Record<string, never>;
    Functions: {
      exec_sql: {
        Args: { sql: string };
        Returns: Json;
      };
      get_nearby_therapists: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_miles?: number;
          p_limit?: number;
        };
        Returns: GenericRow[];
      };
      get_ranking_event_counts: {
        Args: Record<PropertyKey, never>;
        Returns: Record<string, number>;
      };
      increment_profile_contact_clicks: {
        Args: { p_profile_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: string;
      [key: string]: string;
    };
    CompositeTypes: Record<string, never>;
  };
}

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
