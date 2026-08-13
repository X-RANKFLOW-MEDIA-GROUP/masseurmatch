import type { Database, Json } from "./types";

type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];
type ProfilesTable = PublicTables["profiles"];

type RuntimeIdentityVerificationRow = {
  created_at: string;
  id: string;
  last_error: string | null;
  metadata: Json | null;
  profile_id: string | null;
  provider: string | null;
  status: string;
  stripe_session_id: string | null;
  stripe_verification_report_id: string | null;
  stripe_verification_session_id: string | null;
  updated_at: string;
  user_id: string | null;
};

type RuntimeIdentityVerificationInsert = {
  created_at?: string;
  id?: string;
  last_error?: string | null;
  metadata?: Json | null;
  profile_id?: string | null;
  provider?: string | null;
  status?: string;
  stripe_session_id?: string | null;
  stripe_verification_report_id?: string | null;
  stripe_verification_session_id?: string | null;
  updated_at?: string;
  user_id?: string | null;
};

type RuntimeIdentityVerificationUpdate = RuntimeIdentityVerificationInsert;

type RuntimeIdentityVerificationsTable = {
  Row: RuntimeIdentityVerificationRow;
  Insert: RuntimeIdentityVerificationInsert;
  Update: RuntimeIdentityVerificationUpdate;
  Relationships: [];
};

type RuntimeProfilesTable = Omit<ProfilesTable, "Row" | "Insert" | "Update"> & {
  Row: ProfilesTable["Row"] & { studio_hours: Json | null };
  Insert: ProfilesTable["Insert"] & { studio_hours?: Json | null };
  Update: ProfilesTable["Update"] & { studio_hours?: Json | null };
};

/**
 * Narrow compatibility overlay for fields confirmed in the live production
 * schema but missing from the checked-in generated types. Keep this additive
 * and small; regenerate the canonical types file separately when schema drift
 * is reconciled across all environments.
 */
export type RuntimeDatabase = Omit<Database, "public"> & {
  public: Omit<PublicSchema, "Tables"> & {
    Tables: Omit<PublicTables, "identity_verifications" | "profiles"> & {
      identity_verifications: RuntimeIdentityVerificationsTable;
      profiles: RuntimeProfilesTable;
    };
  };
};
