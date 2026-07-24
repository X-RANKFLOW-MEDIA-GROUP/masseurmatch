import { z } from "zod";
import {
  createSupabaseAdminClient,
  requireAdminSession,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import {
  createProfileCmsUpdate,
  isProfileCmsUpdateField,
  toProfileCmsJson,
} from "@/lib/profile-cms-update";
import type { Json } from "@/integrations/supabase/types";

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

    if (!fieldName || !isProfileCmsUpdateField(fieldName)) {
      return Response.json({ error: "Audit log entry has an invalid field name" }, { status: 400 });
    }

    let update: ReturnType<typeof createProfileCmsUpdate>;
    try {
      update = createProfileCmsUpdate(fieldName, details.old_value);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid rollback value";
      return Response.json({ error: message }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(update.payload)
      .eq("id", profile_id);

    if (updateError) {
      return Response.json({ error: "Failed to rollback" }, { status: 500 });
    }

    const auditDetails: Json = {
      field_name: fieldName,
      old_value: toProfileCmsJson(details.new_value),
      new_value: toProfileCmsJson(update.normalizedValue),
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
      rolled_back_value: update.normalizedValue,
    });
  } catch (error) {
    console.error("Rollback error:", error);
    return Response.json({ error: "Rollback failed" }, { status: 500 });
  }
}
