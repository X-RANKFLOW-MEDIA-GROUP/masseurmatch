import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  assertRateLimit,
  sanitizeOptionalText,
  sanitizeStringArray,
  sanitizeText,
} from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient, recordAuditLog } from "@/app/api/_lib/supabase-server";
import { getProfileByUserId } from "@/app/_lib/store";
import { proProfileSchema } from "@/app/_lib/validation";
import { normalizeBodyTypeValue } from "@/lib/physical-profile";
import type { Json, TablesInsert } from "@/integrations/supabase/types";

const flaggedProfileSchema = proProfileSchema.extend({
  moderationReason: z.string().min(3).max(600),
  flaggedField: z.enum(["display_name", "bio", "specialties"]),
  moderationProvider: z.string().min(1).max(80).optional(),
  aiResponse: z.unknown().optional(),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile-flag", { limit: 10, windowMs: 60_000 });

    const session = await requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    const body = await parseJsonBody(request, flaggedProfileSchema);
    const adminClient = createSupabaseAdminClient();
    const snapshot = {
      displayName: sanitizeText(body.displayName),
      bio: sanitizeText(body.bio),
      city: sanitizeText(body.city),
      state: sanitizeOptionalText(body.state),
      phone: sanitizeOptionalText(body.phone),
      specialties: sanitizeStringArray(body.specialties),
      incallPrice: body.incallPrice ?? null,
      outcallPrice: body.outcallPrice ?? null,
      heightInches: body.heightInches ?? null,
      weightLb: body.weightLb ?? null,
      bodyType: normalizeBodyTypeValue(body.bodyType),
    };

    const queuePayload: TablesInsert<"moderation_queue"> = {
      content_type: "text",
      profile_id: profile.id,
      user_id: session.userId,
      target_id: null,
      item_type: "text",
      source: "pro_listing",
      field_name: body.flaggedField,
      status: "pending",
      priority: 0,
      moderation_provider: sanitizeOptionalText(body.moderationProvider) || "sightengine",
      moderation_reason: sanitizeText(body.moderationReason),
      snapshot: snapshot as Json,
      ai_response: (body.aiResponse ?? null) as Json,
      admin_reason: null,
      resolved_by: null,
      resolved_at: null,
    };

    const { data: existingQueueItem, error: queueLookupError } = await adminClient
      .from("moderation_queue")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("item_type", "text")
      .eq("source", "pro_listing")
      .eq("status", "pending")
      .maybeSingle();

    if (queueLookupError) {
      throw new RouteError(500, queueLookupError.message);
    }

    let queueId = existingQueueItem?.id ?? null;

    if (queueId) {
      const { error: queueUpdateError } = await adminClient
        .from("moderation_queue")
        .update(queuePayload)
        .eq("id", queueId);

      if (queueUpdateError) {
        throw new RouteError(500, queueUpdateError.message);
      }
    } else {
      const { data: insertedQueueItem, error: queueInsertError } = await adminClient
        .from("moderation_queue")
        .insert(queuePayload)
        .select("id")
        .single();

      if (queueInsertError) {
        throw new RouteError(500, queueInsertError.message);
      }

      queueId = insertedQueueItem?.id ?? null;
    }

    await recordAuditLog(session.userId, "provider.profile.flagged", "profile", profile.id, {
      flaggedField: body.flaggedField,
      moderationReason: sanitizeText(body.moderationReason),
      queueId,
      snapshot,
    });

    return json({
      ok: true,
      queued: true,
      queueId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
