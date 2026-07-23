import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { requireRequestSession } from "@/app/api/_lib/session";

export const dynamic = "force-dynamic";

type AuditDetails = {
  field_name?: unknown;
  old_value?: unknown;
  new_value?: unknown;
  reason?: unknown;
  ip_address?: unknown;
};

function normalizeAuditEntry(entry: {
  id: string;
  admin_user_id: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string;
}) {
  const details =
    entry.details && typeof entry.details === "object" && !Array.isArray(entry.details)
      ? (entry.details as AuditDetails)
      : {};

  return {
    id: entry.id,
    profile_id: entry.target_id ?? "",
    edited_by: entry.admin_user_id,
    field_name: typeof details.field_name === "string" ? details.field_name : "unknown",
    old_value: details.old_value ?? null,
    new_value: details.new_value ?? null,
    reason: typeof details.reason === "string" ? details.reason : null,
    created_at: entry.created_at,
    ip_address: typeof details.ip_address === "string" ? details.ip_address : null,
  };
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profile_id") || session.userId;
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const supabase = createSupabaseAdminClient();
    const { data: entries, error, count } = await supabase
      .from("audit_log")
      .select("id, admin_user_id, target_id, details, created_at", { count: "exact" })
      .eq("target_type", "profile")
      .eq("target_id", profileId)
      .eq("action", "provider.profile.field_update")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return Response.json({
      entries: (entries || []).map(normalizeAuditEntry),
      total: count ?? 0,
    });
  } catch (error) {
    console.error("Audit log error:", error);
    return Response.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
