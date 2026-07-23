import { z } from "zod";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId } from "@/app/_lib/store";
import { getFieldByKey } from "@/lib/profile-fields-config";
import type { Database } from "@/integrations/supabase/types";

// Request body schema for single field update
const fieldUpdateSchema = z.object({
  field_name: z.string().min(1).max(100),
  value: z.unknown(),
  reason: z.string().min(1).max(500).optional(),
});

type FieldUpdateRequest = z.infer<typeof fieldUpdateSchema>;

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
 * Get old value from profile, safely handling undefined
 */
function getOldValue(profile: Record<string, unknown>, fieldName: string): unknown {
  return profile[fieldName] ?? null;
}

/**
 * Validate and prepare the update value using the field's validation schema
 */
async function validateAndPrepareValue(
  fieldName: string,
  value: unknown,
): Promise<unknown> {
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

  // Validate using the field's validation schema
  try {
    const validated = fieldDef.validationSchema.parse(value);
    return validated;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    throw new RouteError(400, `Invalid value for field "${fieldName}": ${message}`);
  }
}

/**
 * Record audit log entry for the field update
 */
async function recordFieldAuditLog(
  userId: string,
  profileId: string,
  fieldName: string,
  oldValue: unknown,
  newValue: unknown,
  reason: string | undefined,
  ipAddress: string,
): Promise<void> {
  const adminClient = createSupabaseAdminClient();

  try {
    await adminClient.from("audit_log").insert({
      admin_user_id: userId,
      action: "provider.profile.field_update",
      target_type: "profile",
      target_id: profileId,
      details: {
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue,
        reason: reason || null,
        ip_address: ipAddress,
        updated_at: new Date().toISOString(),
      },
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

    // Validate field exists and is editable
    const fieldDef = getFieldByKey(body.field_name);
    if (!fieldDef) {
      throw new RouteError(400, `Field "${body.field_name}" does not exist in profile schema.`);
    }

    if (!fieldDef.editable) {
      throw new RouteError(403, `Field "${body.field_name}" is not editable.`);
    }

    if (fieldDef.adminOnly) {
      throw new RouteError(403, `Field "${body.field_name}" can only be edited by administrators.`);
    }

    // Validate and prepare the new value
    const newValue = await validateAndPrepareValue(body.field_name, body.value);

    // Get the old value from the profile
    const profileData = profile as Record<string, unknown>;
    const oldValue = getOldValue(profileData, body.field_name);

    // If no change, return without updating
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

    const adminClient = createSupabaseAdminClient();
    let updatedProfile = profile;

    if (hasChanged) {
      // Prepare the update object with dynamic field name
      const updates: Record<string, unknown> = {
        [body.field_name]: newValue,
        updated_at: new Date().toISOString(),
      };

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
      body.field_name,
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
      field_name: body.field_name,
      old_value: oldValue,
      new_value: newValue,
      changed: hasChanged,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
