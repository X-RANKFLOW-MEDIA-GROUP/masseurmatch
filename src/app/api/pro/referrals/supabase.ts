import { createClient } from "@supabase/supabase-js";

import { envAny } from "@/app/api/_lib/env";
import { RouteError } from "@/app/api/_lib/http";
import type { Database } from "@/integrations/supabase/app-database";

function requireConfig(value: string, label: string): string {
  if (!value) {
    throw new RouteError(500, `${label} is not configured.`);
  }

  return value;
}

export function createReferralSupabaseAdminClient() {
  const url = requireConfig(
    envAny(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]),
    "SUPABASE_URL",
  );
  const serviceRoleKey = requireConfig(
    envAny(["SUPABASE_SERVICE_ROLE_KEY"]),
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
