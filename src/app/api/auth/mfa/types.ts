export interface MFAPending {
  id: string;
  user_id: string;
  totp_secret: string;
  backup_codes: string[];
  expires_at: string;
  created_at: string | null;
}

export interface UserMFA {
  id: string;
  user_id: string;
  totp_secret: string;
  backup_codes: string[];
  enabled_at: string;
  updated_at: string | null;
}
