import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ScheduledJobAuth = {
  client: ReturnType<typeof createClient>;
};

export class ScheduledJobAuthError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ScheduledJobAuthError";
  }
}

export async function requireScheduledJob(
  request: Request,
  functionName: string,
): Promise<ScheduledJobAuth> {
  const token = request.headers.get("x-mm-job-token")?.trim() ?? "";
  if (!UUID_RE.test(token)) {
    throw new ScheduledJobAuthError(401, "Scheduled job authorization required.");
  }

  const url = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
  if (!url || !serviceRoleKey) {
    throw new ScheduledJobAuthError(503, "Scheduled job backend is not configured.");
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.rpc("consume_edge_job_token", {
    p_token: token,
    p_function_name: functionName,
  });

  if (error || data !== true) {
    throw new ScheduledJobAuthError(401, "Invalid or expired scheduled job authorization.");
  }

  return { client };
}
