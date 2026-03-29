import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient() as any;

    const { data: logs, error } = await adminClient
      .from("audit_log")
      .select("id, admin_user_id, action, target_type, target_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new RouteError(500, error.message);

    return json({ ok: true, logs: logs ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}
