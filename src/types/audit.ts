export interface AuditLogEntry {
  id: string;
  profile_id: string;
  edited_by: string | null;
  field_name: string;
  old_value: unknown;
  new_value: unknown;
  reason: string | null;
  created_at: string;
  ip_address: string | null;
  user?: {
    id: string;
    email: string;
  };
}

export interface AuditFilterOptions {
  user_id?: string;
  field_name?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  total_changes: number;
  unique_fields: string[];
  last_updated: string;
  top_changed_fields: Array<{ field: string; count: number }>;
}
