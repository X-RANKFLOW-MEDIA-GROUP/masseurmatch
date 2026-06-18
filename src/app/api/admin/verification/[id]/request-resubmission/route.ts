export const dynamic = "force-dynamic";
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
    const { id } = await params;
    const body = await parseJsonBody(request, schema);
    const adminClient = createSupabaseAdminClient();

    const { data: row, error: fetchError } = await adminClient
      .from("identity_verifications")
      .select("id, user_id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!row) throw new RouteError(404, "Verification record not found.");

    const { error: updateError } = await adminClient
      .from("identity_verifications")
      .update({ status: "requires_input", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) throw new RouteError(500, updateError.message);

    await recordAuditLog(
      admin.userId,
      "verification_resubmission_requested",
      "identity_verification",
      id,
      { reason: body.reason, targetUserId: row.user_id }
    );

    return json({ ok: true, id, status: "requires_input" });
  } catch (error) {
    return errorResponse(error);
  }
}
