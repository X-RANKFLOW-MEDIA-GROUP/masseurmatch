export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: userId } = await params;
    const adminClient = createSupabaseAdminClient();

    const now = new Date().toISOString();
    const { error } = await adminClient
      .from("profiles")
      .update({ is_banned: false, is_suspended: false, is_active: true, updated_at: now })
      .eq("user_id", userId);

    if (error) throw new RouteError(500, error.message);

    await adminClient.auth.admin.updateUserById(userId, { ban_duration: "0s" });

    await adminClient.from("admin_actions").insert({
      admin_id: admin.userId,
      action_type: "unban_user",
      target_user_id: userId,
    });

    await recordAuditLog(admin.userId, "unban_user", "user", userId, {});

    return json({ ok: true, userId, action: "unbanned" });
  } catch (error) {
    return errorResponse(error);
  }
}
