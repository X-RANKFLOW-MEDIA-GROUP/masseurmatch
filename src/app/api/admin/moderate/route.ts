import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { buildTherapistRevalidatePaths, triggerRevalidate } from "@/app/_lib/revalidate";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { normalizeBodyTypeValue } from "@/lib/physical-profile";

const moderateActionSchema = z.object({
  itemId: z.string().min(1).max(100),
  action: z.enum(["approve", "reject"]),
  type: z.enum(["text", "photo"]),
  reason: z.string().min(1).max(600).optional(),
});

const moderationSnapshotSchema = z.object({
  displayName: z.string().min(1),
  bio: z.string().min(1),
  city: z.string().min(1),
  state: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  specialties: z.array(z.string()).optional().default([]),
  incallPrice: z.number().nullable().optional(),
  outcallPrice: z.number().nullable().optional(),
  heightInches: z.number().nullable().optional(),
  weightLb: z.number().nullable().optional(),
  bodyType: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient() as any;

    const { data: queueItems, error: queueError } = await adminClient
      .from("moderation_queue")
      .select(
        "id, profile_id, user_id, target_id, item_type, source, field_name, status, priority, moderation_provider, moderation_reason, snapshot, ai_response, admin_reason, resolved_by, resolved_at, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (queueError) {
      throw new RouteError(500, queueError.message);
    }

    const items = queueItems ?? [];
    const profileIds = Array.from(
      new Set(
        items
          .map((item: any) => item.profile_id)
          .filter((value: unknown): value is string => typeof value === "string" && value.length > 0),
      ),
    );
    const photoIds = Array.from(
      new Set(
        items
          .map((item: any) => item.item_type === "photo" ? item.target_id : null)
          .filter((value: unknown): value is string => typeof value === "string" && value.length > 0),
      ),
    );

    let profileMap = new Map<string, any>();
    if (profileIds.length > 0) {
      const { data: profiles, error: profilesError } = await adminClient
        .from("profiles")
        .select("id, display_name, full_name, city, state, status, is_active")
        .in("id", profileIds);

      if (profilesError) {
        throw new RouteError(500, profilesError.message);
      }

      profileMap = new Map((profiles ?? []).map((profile: any) => [profile.id, profile]));
    }

    let photoMap = new Map<string, any>();
    if (photoIds.length > 0) {
      const { data: photos, error: photosError } = await adminClient
        .from("profile_photos")
        .select("id, storage_path, url, moderation_status, moderation_reason, is_primary, sort_order")
        .in("id", photoIds);

      if (photosError) {
        throw new RouteError(500, photosError.message);
      }

      photoMap = new Map((photos ?? []).map((photo: any) => [photo.id, photo]));
    }

    const pendingPhotoCount = items.filter(
      (item: any) => item.item_type === "photo" && item.status === "pending",
    ).length;

    return json({
      ok: true,
      pendingPhotoCount,
      items: items.map((item: any) => {
        const profile = profileMap.get(item.profile_id) ?? null;
        const photo = item.target_id ? photoMap.get(item.target_id) ?? null : null;

        return {
          id: item.id,
          profileId: item.profile_id,
          userId: item.user_id,
          targetId: item.target_id,
          itemType: item.item_type,
          source: item.source,
          fieldName: item.field_name,
          status: item.status,
          priority: item.priority,
          moderationProvider: item.moderation_provider,
          moderationReason: item.moderation_reason,
          snapshot: item.snapshot ?? {},
          aiResponse: item.ai_response ?? null,
          adminReason: item.admin_reason,
          resolvedBy: item.resolved_by,
          resolvedAt: item.resolved_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          profile: profile
            ? {
                id: profile.id,
                displayName: profile.display_name,
                fullName: profile.full_name,
                city: profile.city,
                state: profile.state,
                status: profile.status,
                isActive: profile.is_active,
              }
            : null,
          photo: photo
            ? {
                id: photo.id,
                url: photo.url || photo.storage_path || "",
                moderationStatus: photo.moderation_status,
                moderationReason: photo.moderation_reason,
                isPrimary: Boolean(photo.is_primary),
                sortOrder: photo.sort_order,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "admin-moderate", { limit: 60, windowMs: 60_000 });

    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, moderateActionSchema);
    const adminClient = createSupabaseAdminClient() as any;

    const { data: queueItem, error: queueError } = await adminClient
      .from("moderation_queue")
      .select(
        "id, profile_id, target_id, item_type, source, field_name, status, moderation_reason, snapshot, created_at",
      )
      .eq("id", body.itemId)
      .maybeSingle();

    if (queueError) {
      throw new RouteError(500, queueError.message);
    }

    if (!queueItem) {
      throw new RouteError(404, "Moderation queue item not found.");
    }

    if (queueItem.item_type !== body.type) {
      throw new RouteError(400, "Moderation item type mismatch.");
    }

    if (queueItem.status !== "pending") {
      throw new RouteError(409, "This moderation item has already been resolved.");
    }

    let updatedProfile: { id: string; slug: string | null; city: string | null } | null = null;

    if (body.type === "text" && body.action === "approve") {
      const snapshot = moderationSnapshotSchema.parse(queueItem.snapshot ?? {});

      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .update({
          display_name: sanitizeText(snapshot.displayName),
          bio: sanitizeText(snapshot.bio),
          city: sanitizeText(snapshot.city),
          state: sanitizeOptionalText(snapshot.state),
          phone: sanitizeOptionalText(snapshot.phone),
          specialties: sanitizeStringArray(snapshot.specialties),
          incall_price: snapshot.incallPrice ?? null,
          outcall_price: snapshot.outcallPrice ?? null,
          height_inches: snapshot.heightInches ?? null,
          weight_lb: snapshot.weightLb ?? null,
          body_type: normalizeBodyTypeValue(snapshot.bodyType),
          is_verified_profile: true,
        })
        .eq("id", queueItem.profile_id)
        .select("id, slug, city")
        .single();

      if (profileError) {
        throw new RouteError(500, profileError.message);
      }

      updatedProfile = profile;
    }

    if (body.type === "photo") {
      if (!queueItem.target_id) {
        throw new RouteError(400, "Photo moderation item is missing target_id.");
      }

      const { data: photo, error: photoError } = await adminClient
        .from("profile_photos")
        .select("id, profile_id")
        .eq("id", queueItem.target_id)
        .maybeSingle();

      if (photoError) {
        throw new RouteError(500, photoError.message);
      }

      if (!photo) {
        throw new RouteError(404, "Photo not found.");
      }

      const nextPhotoStatus = body.action === "approve" ? "approved" : "rejected";
      const nextPhotoReason =
        sanitizeOptionalText(body.reason) || (body.action === "approve" ? "admin_approved" : "admin_rejected");

      const { error: updatePhotoError } = await adminClient
        .from("profile_photos")
        .update({
          moderation_status: nextPhotoStatus,
          moderation_reason: nextPhotoReason,
        })
        .eq("id", photo.id);

      if (updatePhotoError) {
        throw new RouteError(500, updatePhotoError.message);
      }

      const { count: approvedPhotoCount, error: approvedPhotoCountError } = await adminClient
        .from("profile_photos")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", queueItem.profile_id)
        .eq("moderation_status", "approved");

      if (approvedPhotoCountError) {
        throw new RouteError(500, approvedPhotoCountError.message);
      }

      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .update({
          is_verified_photos: (approvedPhotoCount ?? 0) > 0,
        })
        .eq("id", queueItem.profile_id)
        .select("id, slug, city")
        .single();

      if (profileError) {
        throw new RouteError(500, profileError.message);
      }

      updatedProfile = profile;
    }

    const resolvedAt = new Date().toISOString();
    const { error: updateQueueError } = await adminClient
      .from("moderation_queue")
      .update({
        status: body.action === "approve" ? "approved" : "rejected",
        admin_reason: sanitizeOptionalText(body.reason),
        resolved_by: admin.userId,
        resolved_at: resolvedAt,
      })
      .eq("id", body.itemId);

    if (updateQueueError) {
      throw new RouteError(500, updateQueueError.message);
    }

    await recordAuditLog(admin.userId, `admin.moderation.${body.action}`, "moderation_queue", body.itemId, {
      type: body.type,
      action: body.action,
      profileId: queueItem.profile_id,
      source: queueItem.source,
      fieldName: queueItem.field_name,
      reason: body.reason,
    });

    if (updatedProfile) {
      await triggerRevalidate(
        await buildTherapistRevalidatePaths({
          id: updatedProfile.id,
          slug: updatedProfile.slug,
          city: updatedProfile.city,
        }),
        { request },
      ).catch((error) => {
        console.error("[api/admin/moderate] Revalidation failed:", error);
      });
    }

    return json({
      ok: true,
      itemId: body.itemId,
      action: body.action,
      status: body.action === "approve" ? "approved" : "rejected",
      resolvedAt,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
