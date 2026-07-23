import { z } from "zod";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId } from "@/app/_lib/store";
import { getFieldByKey } from "@/lib/profile-fields-config";
import type { Database, Json } from "@/integrations/supabase/types";

const fieldUpdateSchema = z.object({
  field_name: z.string().min(1).max(100),
  value: z.unknown(),
  reason: z.string().min(1).max(500).optional(),
});

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

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

function getOldValue(profile: Record<string, unknown>, fieldName: string): unknown {
  return profile[fieldName] ?? null;
}

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
  fieldName: string,
  oldValue: unknown,
  newValue: unknown,
  reason: string | undefined,
  ipAddress: string,
): Promise<void> {
  const adminClient = createSupabaseAdminClient();

  try {
    const details: Json = {
      field_name: fieldName,
      old_value: toJson(oldValue),
      new_value: toJson(newValue),
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
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    const body = await parseJsonBody(request, fieldUpdateSchema);
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

    const newValue = await validateAndPrepareValue(body.field_name, body.value);
    const profileData = profile as Record<string, unknown>;
    const oldValue = getOldValue(profileData, body.field_name);
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

    const adminClient = createSupabaseAdminClient();
    let updatedProfile = profile;

    if (hasChanged) {
      const updates = {
        [body.field_name]: newValue,
        updated_at: new Date().toISOString(),
        ...(profile.profile_status === "approved"
          ? {
              profile_status: "under_review",
              visibility_status: "public",
            }
          : {}),
      } as unknown as ProfileUpdate;

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

    const ipAddress = getClientIpAddress(request);

    await recordFieldAuditLog(
      session.userId,
      profile.id,
      body.field_name,
      oldValue,
      newValue,
      body.reason,
      ipAddress,
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
