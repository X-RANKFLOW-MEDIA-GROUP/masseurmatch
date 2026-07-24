import { z } from "zod";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId } from "@/app/_lib/store";
import { getFieldByKey } from "@/lib/profile-fields-config";
import {
  createProfileCmsUpdate,
  isProfileCmsUpdateField,
  toProfileCmsJson,
  type ProfileCmsUpdateField,
  type ProfileRow,
} from "@/lib/profile-cms-update";
import type { Json } from "@/integrations/supabase/types";

// Request body schema for single field update
const fieldUpdateSchema = z.object({
  field_name: z.string().min(1).max(100),
  value: z.unknown(),
  reason: z.string().min(1).max(500).optional(),
});

/**
 * Extract client IP address from request headers
 */
function getClientIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Get old value from profile using the validated database column name.
 */
function getOldValue(profile: ProfileRow, fieldName: ProfileCmsUpdateField): unknown {
  return profile[fieldName] ?? null;
}

/**
 * Validate and prepare the update value using the field's validation schema.
 */
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

/**
 * Record audit log entry for the field update.
 */
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
    // Continue even if audit log fails - don't break the update
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: max 20 requests per minute
    assertRateLimit(request, "pro-profile-cms-field", { limit: 20, windowMs: 60_000 });

    // Require authenticated session
    const session = await requireRequestSession(request);

    // Get user's profile
    const profile = await getProfileByUserId(session.userId);
    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    // Parse and validate request body
    const body = await parseJsonBody(request, fieldUpdateSchema);

    if (!isProfileCmsUpdateField(body.field_name)) {
      throw new RouteError(400, `Field "${body.field_name}" is not an allowed profile column.`);
    }
    const fieldName = body.field_name;

    // Validate field exists and is editable
    const fieldDef = getFieldByKey(fieldName);
    if (!fieldDef) {
      throw new RouteError(400, `Field "${fieldName}" does not exist in profile schema.`);
    }

    if (!fieldDef.editable) {
      throw new RouteError(403, `Field "${fieldName}" is not editable.`);
    }

    if (fieldDef.adminOnly) {
      throw new RouteError(403, `Field "${fieldName}" can only be edited by administrators.`);
    }

    // Validate and normalize the new value against the generated column type
    const validatedValue = validateAndPrepareValue(fieldName, body.value);
    let update;
    try {
      update = createProfileCmsUpdate(fieldName, validatedValue);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid profile value";
      throw new RouteError(400, message);
    }
    const newValue = update.normalizedValue;

    // Get the old value from the profile
    const oldValue = getOldValue(profile, fieldName);

    // If no change, return without updating
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

    const adminClient = createSupabaseAdminClient();
    let updatedProfile = profile;

    if (hasChanged) {
      const updates = update.payload;

      // If profile was approved, mark as under_review for changes
      if (profile.profile_status === "approved") {
        updates.profile_status = "under_review";
        updates.visibility_status = "public"; // Keep visible while under review
      }

      // Update the profile
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

    // Get client IP address
    const ipAddress = getClientIpAddress(request);

    // Record audit log
    await recordFieldAuditLog(
      session.userId,
      profile.id,
      fieldName,
      oldValue,
      newValue,
      body.reason,
      ipAddress,
    );

    // Trigger revalidation if slug exists
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
