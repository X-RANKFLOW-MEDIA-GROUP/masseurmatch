export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const schema = z.object({ reason: z.string().min(1) });

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
      .update({ is_banned: true, is_suspended: true, is_active: false, updated_at: now })
      .eq("user_id", userId);

    if (error) throw new RouteError(500, error.message);

    // Disable auth user
    await adminClient.auth.admin.updateUserById(userId, { ban_duration: "876600h" });

    await adminClient.from("admin_actions").insert({
      action: "ban_user",
      action_type: "ban_user",
      target_table: "users",
      admin_id: admin.userId,
      target_user_id: userId,
      reason: body.reason,
    });

    await recordAuditLog(admin.userId, "ban_user", "user", userId, { reason: body.reason });

    return json({ ok: true, userId, action: "banned" });
  } catch (error) {
    return errorResponse(error);
  }
}
