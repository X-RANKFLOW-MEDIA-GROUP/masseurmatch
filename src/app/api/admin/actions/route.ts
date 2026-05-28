export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: actions, error } = await adminClient
      .from("admin_actions")
      .select("id, admin_id, action_type, target_user_id, target_profile_id, reason, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new RouteError(500, error.message);

    return json({ ok: true, actions: actions ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}
