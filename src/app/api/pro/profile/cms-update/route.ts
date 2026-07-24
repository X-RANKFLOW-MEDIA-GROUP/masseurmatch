import { z } from "zod";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getFieldByKey } from "@/lib/profile-fields-config";
import {
  createProfileCmsUpdate,
  isProfileCmsUpdateField,
  toProfileCmsJson,
  type ProfileCmsUpdateField,
  type ProfileRow,
} from "@/lib/profile-cms-update";
import type { Json } from "@/integrations/supabase/types";

const fieldUpdateSchema = z.object({
  field_name: z.string().min(1).max(100),
  value: z.unknown(),
  reason: z.string().min(1).max(500).optional(),
});

function getClientIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function getOldValue(profile: ProfileRow, fieldName: ProfileCmsUpdateField): unknown {
  return profile[fieldName] ?? null;
}

function validateAndPrepareValue(fieldName: ProfileCmsUpdateField, value: unknown): unknown {
  const fieldDef = getFieldByKey(fieldName);

  if (!fieldDef) {
    throw new RouteError(400, `Field "${fieldName}" does not exist in profile schema.`);
  }
  if (!fieldDef.editable) {
    throw new RouteError(403, `Field "${fieldName}" is not editable by users.`);
  }
  if (fieldDef.adminOnly) {
    throw new RouteError(403, `Field "${fieldName}" can only be edited by administrators.`);
  }

  try {
    return fieldDef.validationSchema.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    throw new RouteError(400, `Invalid value for field "${fieldName}": ${message}`);
  }
}

async function recordFieldAuditLog(
  userId: string,
  profileId: string,
  fieldName: ProfileCmsUpdateField,
  oldValue: unknown,
  newValue: unknown,
  reason: string | undefined,
  ipAddress: string,
): Promise<void> {
  const adminClient = createSupabaseAdminClient();

  try {
    const details: Json = {
      field_name: fieldName,
      old_value: toProfileCmsJson(oldValue),
      new_value: toProfileCmsJson(newValue),
      reason: reason || null,
      ip_address: ipAddress,
      updated_at: new Date().toISOString(),
    };

    await adminClient.from("audit_log").insert({
      admin_user_id: userId,
      action: "provider.profile.field_update",
      target_type: "profile",
      target_id: profileId,
      details,
    });
  } catch (error) {
    console.error("[api/pro/profile/cms-update] Audit log recording failed:", error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile-cms-field", { limit: 20, windowMs: 60_000 });
    const session = await requireRequestSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) {
      throw new RouteError(500, `Profile lookup failed: ${profileError.message}`);
    }
    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    const body = await parseJsonBody(request, fieldUpdateSchema);

    if (!isProfileCmsUpdateField(body.field_name)) {
      throw new RouteError(400, `Field "${body.field_name}" is not an allowed profile column.`);
    }
    const fieldName = body.field_name;

    const validatedValue = validateAndPrepareValue(fieldName, body.value);
    let update: ReturnType<typeof createProfileCmsUpdate>;
    try {
      update = createProfileCmsUpdate(fieldName, validatedValue);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid profile value";
      throw new RouteError(400, message);
    }

    const oldValue = getOldValue(profile, fieldName);
    const newValue = update.normalizedValue;
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
    let updatedProfile: ProfileRow = profile;

    if (hasChanged) {
      const updates = update.payload;

      if (profile.profile_status === "approved") {
        updates.profile_status = "under_review";
        updates.visibility_status = "public";
      }

      const { data: nextProfile, error } = await adminClient
        .from("profiles")
        .update(updates)
        .eq("user_id", session.userId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw new RouteError(500, `Database update failed: ${error.message}`);
      }
      if (!nextProfile) {
        throw new RouteError(500, "Profile update returned no data.");
      }

      updatedProfile = nextProfile;
    }

    await recordFieldAuditLog(
      session.userId,
      profile.id,
      fieldName,
      oldValue,
      newValue,
      body.reason,
      getClientIpAddress(request),
    );

    if (updatedProfile.slug || profile.slug) {
      await import("@/app/_lib/revalidate")
        .then(({ buildTherapistRevalidatePaths, triggerRevalidate }) =>
          buildTherapistRevalidatePaths({
            id: updatedProfile.id || profile.id,
            slug: updatedProfile.slug || profile.slug,
            city: updatedProfile.city || profile.city,
          }).then((paths) => triggerRevalidate(paths, { request })),
        )
        .catch((revalError) => {
          console.error("[api/pro/profile/cms-update] Revalidation failed:", revalError);
        });
    }

    return json({
      success: true,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      changed: hasChanged,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
