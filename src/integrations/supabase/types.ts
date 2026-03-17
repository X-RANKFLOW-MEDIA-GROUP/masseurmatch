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
          role: "admin" | "provider" | "client";
          created_at?: string | null;
        };
        Insert: {
          user_id: string;
          role: "admin" | "provider" | "client";
          created_at?: string | null;
        };
        Update: Partial<{
          user_id: string;
          role: "admin" | "provider" | "client";
          created_at?: string | null;
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
    Functions: Record<string, never>;
    Enums: {
      app_role: "admin" | "provider" | "client";
      [key: string]: "admin" | "provider" | "client";
    };
    CompositeTypes: Record<string, never>;
  };
}

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
