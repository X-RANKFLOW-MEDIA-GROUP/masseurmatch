import type { Database as GeneratedDatabase, Json } from "./types";

type ReferralTables = {
  referral_codes: {
    Row: {
      code: string;
      created_at: string;
      id: string;
      premium_months_earned: number;
      referral_count: number;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      code: string;
      created_at?: string;
      id?: string;
      premium_months_earned?: number;
      referral_count?: number;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      code?: string;
      created_at?: string;
      id?: string;
      premium_months_earned?: number;
      referral_count?: number;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  referral_signups: {
    Row: {
      created_at: string;
      id: string;
      paid_at: string | null;
      payment_status: string;
      referral_code_id: string;
      referred_user_id: string;
      referrer_user_id: string;
      reward_months: number;
      stripe_invoice_id: string | null;
      stripe_subscription_id: string | null;
      updated_at: string;
    };
    Insert: {
      created_at?: string;
      id?: string;
      paid_at?: string | null;
      payment_status?: string;
      referral_code_id: string;
      referred_user_id: string;
      referrer_user_id: string;
      reward_months?: number;
      stripe_invoice_id?: string | null;
      stripe_subscription_id?: string | null;
      updated_at?: string;
    };
    Update: {
      created_at?: string;
      id?: string;
      paid_at?: string | null;
      payment_status?: string;
      referral_code_id?: string;
      referred_user_id?: string;
      referrer_user_id?: string;
      reward_months?: number;
      stripe_invoice_id?: string | null;
      stripe_subscription_id?: string | null;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "referral_signups_referral_code_id_fkey";
        columns: ["referral_code_id"];
        isOneToOne: false;
        referencedRelation: "referral_codes";
        referencedColumns: ["id"];
      },
    ];
  };
};

type ReferralFunctions = {
  claim_referral_signup: {
    Args: { p_referred_user_id: string; p_referral_code: string };
    Returns: boolean;
  };
  ensure_referral_code: {
    Args: { p_user_id: string };
    Returns: {
      code: string;
      referral_count: number;
      premium_months_earned: number;
    }[];
  };
  expire_referral_bonus_for_user: {
    Args: { p_user_id: string };
    Returns: boolean;
  };
  get_referral_dashboard: {
    Args: { p_user_id: string };
    Returns: Json;
  };
  get_referral_summary: {
    Args: { p_user_id: string };
    Returns: Json;
  };
  process_paid_referral: {
    Args: {
      p_referred_user_id: string;
      p_stripe_subscription_id: string;
      p_stripe_invoice_id: string;
    };
    Returns: boolean;
  };
};

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Tables" | "Functions"> & {
    Tables: GeneratedDatabase["public"]["Tables"] & ReferralTables;
    Functions: GeneratedDatabase["public"]["Functions"] & ReferralFunctions;
  };
};

export type { Json };
