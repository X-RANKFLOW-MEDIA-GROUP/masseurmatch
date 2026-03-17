import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const adminTherapistActionSchema = z.object({
  therapistId: z.string().min(1),
  action: z.enum([
    "approve",
    "reject",
    "activate",
    "suspend",
    "ban",
    "verify_identity",
    "feature",
    "unfeature",
  ]),
  reason: z.string().min(1).optional(),
  days: z.number().int().positive().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

async function applyTherapistAdminAction(
  adminUserId: string,
  input: z.infer<typeof adminTherapistActionSchema>,
) {
  const adminClient = createSupabaseAdminClient() as any;
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", input.therapistId)
    .maybeSingle();

  if (profileError) {
    throw new RouteError(500, profileError.message);
  }

  if (!profile) {
    throw new RouteError(404, "Therapist not found.");
  }

  let updatedProfile = profile;
  let featureRecord: unknown = null;

  switch (input.action) {
    case "approve":
    case "activate": {
      const { data, error } = await adminClient
        .from("profiles")
        .update({
          is_verified_profile: true,
          status: "active",
          is_active: true,
        })
        .eq("id", input.therapistId)
        .select("*")
        .single();

      if (error) {
        throw new RouteError(500, error.message);
      }

      updatedProfile = data;
      break;
    }
    case "reject": {
      const { data, error } = await adminClient
        .from("profiles")
        .update({
          is_verified_profile: false,
          status: "rejected",
          is_active: false,
        })
        .eq("id", input.therapistId)
        .select("*")
        .single();

      if (error) {
        throw new RouteError(500, error.message);
      }

      updatedProfile = data;
      break;
    }
    case "suspend":
    case "ban": {
      const durationDays = input.action === "suspend" ? input.days ?? null : null;
      const endsAt =
        durationDays === null ? null : new Date(Date.now() + durationDays * 86_400_000).toISOString();

      const { error: suspensionError } = await adminClient.from("user_suspensions").insert({
        user_id: profile.user_id,
        admin_id: adminUserId,
        type: input.action === "ban" ? "banned" : "suspended",
        reason: input.reason || "admin_action",
        reason_detail: input.reason || null,
        duration_days: durationDays,
        ends_at: endsAt,
      });

      if (suspensionError) {
        throw new RouteError(500, suspensionError.message);
      }

      const { data, error } = await adminClient
        .from("profiles")
        .update({
          status: input.action === "ban" ? "banned" : "suspended",
          is_active: false,
        })
        .eq("id", input.therapistId)
        .select("*")
        .single();

      if (error) {
        throw new RouteError(500, error.message);
      }

      updatedProfile = data;
      break;
    }
    case "verify_identity": {
      const { data, error } = await adminClient
        .from("profiles")
        .update({
          is_verified_identity: true,
          is_verified_phone: true,
        })
        .eq("id", input.therapistId)
        .select("*")
        .single();

      if (error) {
        throw new RouteError(500, error.message);
      }

      updatedProfile = data;
      break;
    }
    case "feature": {
      const existing = await adminClient
        .from("featured_masters")
        .select("*")
        .eq("profile_id", input.therapistId)
        .maybeSingle();

      if (existing.error) {
        throw new RouteError(500, existing.error.message);
      }

      if (existing.data) {
        const { data, error } = await adminClient
          .from("featured_masters")
          .update({
            is_active: true,
            city: profile.city || null,
            display_order: input.displayOrder ?? existing.data.display_order ?? 0,
          })
          .eq("id", existing.data.id)
          .select("*")
          .single();

        if (error) {
          throw new RouteError(500, error.message);
        }

        featureRecord = data;
      } else {
        const { data, error } = await adminClient
          .from("featured_masters")
          .insert({
            profile_id: input.therapistId,
            featured_by: adminUserId,
            city: profile.city || null,
            display_order: input.displayOrder ?? 0,
            is_active: true,
          })
          .select("*")
          .single();

        if (error) {
          throw new RouteError(500, error.message);
        }

        featureRecord = data;
      }

      break;
    }
    case "unfeature": {
      const { error } = await adminClient
        .from("featured_masters")
        .delete()
        .eq("profile_id", input.therapistId);

      if (error) {
        throw new RouteError(500, error.message);
      }

      featureRecord = { removed: true };
      break;
    }
    default:
      throw new RouteError(400, "Unsupported therapist action.");
  }

  await recordAuditLog(adminUserId, `therapist_${input.action}`, "profile", input.therapistId, {
    reason: input.reason,
    days: input.days,
    displayOrder: input.displayOrder,
  });

  return {
    action: input.action,
    profile: updatedProfile,
    featured: featureRecord,
  };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, adminTherapistActionSchema);
    const result = await applyTherapistAdminAction(admin.userId, body);

    return json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
