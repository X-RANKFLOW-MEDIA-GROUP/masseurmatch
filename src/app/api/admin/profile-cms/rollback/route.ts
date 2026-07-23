import { z } from "zod";
import {
  createSupabaseAdminClient,
  requireAdminSession,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import { getFieldByKey } from "@/lib/profile-fields-config";
import type { Database, Json } from "@/integrations/supabase/types";

export const dynamic = "force-dynamic";

const RollbackSchema = z.object({
  audit_log_id: z.string().uuid(),
  profile_id: z.string().uuid(),
});

type AuditDetails = {
  field_name?: unknown;
  old_value?: unknown;
  new_value?: unknown;
};

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function toJson(value: unknown): Json {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJson(item));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toJson(item)]),
    );
  }
  return String(value);
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await request.json();
    const { audit_log_id, profile_id } = RollbackSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: auditEntry, error: auditError } = await supabase
      .from("audit_log")
      .select("id, target_id, details")
      .eq("id", audit_log_id)
      .eq("target_type", "profile")
      .eq("target_id", profile_id)
      .single();

    if (auditError || !auditEntry) {
      return Response.json({ error: "Audit log entry not found" }, { status: 404 });
    }

    const details =
      auditEntry.details && typeof auditEntry.details === "object" && !Array.isArray(auditEntry.details)
        ? (auditEntry.details as AuditDetails)
        : {};
    const fieldName = typeof details.field_name === "string" ? details.field_name : null;

    if (!fieldName || !getFieldByKey(fieldName)) {
      return Response.json({ error: "Audit log entry has an invalid field name" }, { status: 400 });
    }

    const oldValue = toJson(details.old_value);
    const newValue = toJson(details.new_value);
    const updatePayload = {
      [fieldName]: oldValue,
      updated_at: new Date().toISOString(),
    } as unknown as ProfileUpdate;

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profile_id);

    if (updateError) {
      return Response.json({ error: "Failed to rollback" }, { status: 500 });
    }

    const auditDetails: Json = {
      field_name: fieldName,
      old_value: newValue,
      new_value: oldValue,
      source_audit_log_id: audit_log_id,
      rolled_back_at: new Date().toISOString(),
    };

    await recordAuditLog(
      admin.userId,
      "provider.profile.field_rollback",
      "profile",
      profile_id,
      auditDetails,
    );

    return Response.json({
      ok: true,
      profile_id,
      field_name: fieldName,
      rolled_back_value: oldValue,
    });
  } catch (error) {
    console.error("Rollback error:", error);
    return Response.json({ error: "Rollback failed" }, { status: 500 });
  }
}
