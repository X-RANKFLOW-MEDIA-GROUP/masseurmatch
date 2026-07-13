export const dynamic = "force-dynamic";

import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { sanitizeOptionalText } from "@/app/_lib/security";

const STATUSES = ["open", "reviewing", "actioned", "dismissed"] as const;

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "open";

    let query = adminClient
      .from("profile_reports")
      .select(
        "id, profile_id, profile_slug, profile_name, category, reason, reporter_email, status, admin_notes, created_at, resolved_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      throw new RouteError(500, error.message);
    }

    return json({ ok: true, reports: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES),
  adminNotes: z.string().max(4000).optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminSession(request);
    const body = await parseJsonBody(request, patchSchema);
    const adminClient = createSupabaseAdminClient();

    const resolved = body.status === "actioned" || body.status === "dismissed";

    const { error } = await adminClient
      .from("profile_reports")
      .update({
        status: body.status,
        admin_notes: sanitizeOptionalText(body.adminNotes),
        resolved_by: resolved ? session.userId : null,
        resolved_at: resolved ? new Date().toISOString() : null,
      })
      .eq("id", body.id);

    if (error) {
      throw new RouteError(500, error.message);
    }

    await recordAuditLog(session.userId, "admin.profile_report.updated", "profile_report", body.id, {
      status: body.status,
    });

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
