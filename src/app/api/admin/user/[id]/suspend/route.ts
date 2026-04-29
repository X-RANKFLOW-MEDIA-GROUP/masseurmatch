import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const schema = z.object({ reason: z.string().min(1).optional() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: userId } = await params;
    const body = await parseJsonBody(request, schema);
    const adminClient = createSupabaseAdminClient();

    const now = new Date().toISOString();
    const { error } = await adminClient
      .from("profiles")
      .update({ is_suspended: true, is_active: false, updated_at: now })
      .eq("user_id", userId);

    if (error) throw new RouteError(500, error.message);

    await adminClient.from("admin_actions").insert({
      admin_id: admin.userId,
      action_type: "suspend_user",
      target_user_id: userId,
      reason: body.reason || null,
    });

    await recordAuditLog(admin.userId, "suspend_user", "user", userId, { reason: body.reason });

    return json({ ok: true, userId, action: "suspended" });
  } catch (error) {
    return errorResponse(error);
  }
}
