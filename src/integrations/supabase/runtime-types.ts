import type {
  Database as GeneratedDatabase,
  Json as GeneratedJson,
} from "./types";

export type Json = GeneratedJson;
export type {
  CompositeTypes,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./types";
export { Constants } from "./types";

type PublicSchema = GeneratedDatabase["public"];
type PublicTables = PublicSchema["Tables"];
type IdentityVerificationsTable = PublicTables["identity_verifications"];
type ProfilesTable = PublicTables["profiles"];

type RuntimeIdentityVerificationsTable = Omit<
  IdentityVerificationsTable,
  "Row" | "Insert" | "Update"
> & {
  Row: IdentityVerificationsTable["Row"] & {
    provider: string | null;
    stripe_verification_session_id: string | null;
  };
  Insert: Partial<IdentityVerificationsTable["Insert"]> & {
    provider?: string | null;
    stripe_verification_session_id?: string | null;
  };
  Update: IdentityVerificationsTable["Update"] & {
    provider?: string | null;
    stripe_verification_session_id?: string | null;
  };
};

type RuntimeProfilesTable = Omit<ProfilesTable, "Row" | "Insert" | "Update"> & {
  Row: ProfilesTable["Row"] & {
    current_status: string | null;
    studio_hours: Json | null;
  };
  Insert: ProfilesTable["Insert"] & {
    current_status?: string | null;
    studio_hours?: Json | null;
  };
  Update: ProfilesTable["Update"] & {
    current_status?: string | null;
    studio_hours?: Json | null;
  };
};

/**
 * Compatibility overlay for fields confirmed in the live production schema
 * but missing from the checked-in generated Supabase types. It intentionally
 * preserves the generated shape while adding the runtime contract required by
 * the application. Regenerate the canonical types separately once schema drift
 * is reconciled across every environment.
 */
export type RuntimeDatabase = Omit<GeneratedDatabase, "public"> & {
  public: Omit<PublicSchema, "Tables"> & {
    Tables: Omit<PublicTables, "identity_verifications" | "profiles"> & {
      identity_verifications: RuntimeIdentityVerificationsTable;
      profiles: RuntimeProfilesTable;
    };
  };
};

export type Database = RuntimeDatabase;
