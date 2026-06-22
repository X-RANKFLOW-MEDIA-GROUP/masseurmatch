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
    const { id: profileId } = await params;
    const body = await parseJsonBody(request, schema);
    const adminClient = createSupabaseAdminClient();

    const now = new Date().toISOString();
    const { data: profile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        profile_status: "changes_requested",
        visibility_status: "hidden",
        moderation_notes: body.reason,
        updated_at: now,
      })
      .eq("id", profileId);

    if (updateError) throw new RouteError(500, updateError.message);

    await adminClient
      .from("profile_reviews")
      .update({
        status: "changes_requested",
        admin_notes: body.reason,
        reviewed_at: now,
        reviewed_by: admin.userId,
      })
      .eq("profile_id", profileId);

    await adminClient.from("admin_actions").insert({
      action: "request_profile_changes",
      target_table: "profiles",
      admin_id: admin.userId,
      action: "request_profile_changes",
      action_type: "request_profile_changes",
      target_table: "profiles",
      target_user_id: profile.user_id,
      target_profile_id: profileId,
      reason: body.reason,
    });

    await recordAuditLog(admin.userId, "request_profile_changes", "profile", profileId, {
      reason: body.reason,
    });

    return json({ ok: true, profileId, status: "changes_requested" });
  } catch (error) {
    return errorResponse(error);
  }
}
