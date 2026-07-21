export const dynamic = "force-dynamic";
import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const deleteReviewActionSchema = z.object({
  action: z.literal("delete"),
  reviewId: z.string().min(1),
});

const addReviewActionSchema = z.object({
  action: z.literal("add"),
  migrationId: z.string().uuid(),
  reviewText: z.string().trim().min(3),
  reviewerName: z.string().trim().min(1).optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  reviewDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  // When true the review is published immediately; otherwise it waits in the
  // existing approval flow on /admin/migrations.
  publish: z.boolean().optional(),
});

const editReviewActionSchema = z
  .object({
    action: z.literal("edit"),
    reviewId: z.string().min(1),
    reviewText: z.string().min(3).optional(),
    reviewerName: z.string().min(1).optional().nullable(),
    rating: z.number().min(0).max(5).optional().nullable(),
    reviewDate: z.string().min(1).optional().nullable(),
    sourcePlatform: z.string().min(1).optional().nullable(),
    sourceUrl: z.string().url().optional(),
  });

const adminReviewActionSchema = z.discriminatedUnion("action", [
  deleteReviewActionSchema,
  editReviewActionSchema,
  addReviewActionSchema,
]);

async function applyReviewAdminAction(
  adminUserId: string,
  input: z.infer<typeof adminReviewActionSchema>,
) {
  const adminClient = createSupabaseAdminClient();

  if (input.action === "delete") {
    const { error } = await adminClient.from("imported_reviews").delete().eq("id", input.reviewId);

    if (error) {
      throw new RouteError(500, error.message);
    }

    await recordAuditLog(adminUserId, "delete_imported_review", "review", input.reviewId);

    return {
      action: input.action,
      deleted: true,
      reviewId: input.reviewId,
    };
  }

  if (input.action === "add") {
    // Cast: profile_migrations/imported_reviews aren't fully covered by the
    // generated Supabase types yet (see api/migrate/_lib/processor.ts).
     
    const untyped = adminClient as any;

    const { data: migration, error: migrationError } = await untyped
      .from("profile_migrations")
      .select("id, profile_id, platform, source_url, imported_review_count")
      .eq("id", input.migrationId)
      .maybeSingle();

    if (migrationError) throw new RouteError(500, migrationError.message);
    if (!migration) throw new RouteError(404, "Migration request not found.");
    if (!migration.profile_id) {
      throw new RouteError(400, "This migration request is not linked to a profile.");
    }

    const publish = input.publish === true;
    const { data: review, error: insertError } = await untyped
      .from("imported_reviews")
      .insert({
        profile_id: migration.profile_id,
        migration_id: migration.id,
        source_platform: migration.platform,
        source_url: migration.source_url,
        reviewer_name: input.reviewerName || null,
        rating: input.rating ?? null,
        review_text: input.reviewText,
        review_date: input.reviewDate || null,
        is_public: publish,
        ...(publish
          ? { reviewed_by: adminUserId, reviewed_at: new Date().toISOString() }
          : {}),
      })
      .select("*")
      .maybeSingle();

    if (insertError) throw new RouteError(500, insertError.message);

    const { error: statusError } = await untyped
      .from("profile_migrations")
      .update({
        status: "in_progress",
        imported_review_count: (migration.imported_review_count ?? 0) + 1,
      })
      .eq("id", migration.id);
     

    if (statusError) throw new RouteError(500, statusError.message);

    await recordAuditLog(adminUserId, "add_imported_review", "review", review?.id, {
      migrationId: migration.id,
      publish,
    });

    return {
      action: input.action,
      review,
    };
  }

  const updates = {
    review_text: input.reviewText,
    reviewer_name: input.reviewerName,
    rating: input.rating,
    review_date: input.reviewDate,
    source_platform: input.sourcePlatform,
    source_url: input.sourceUrl,
  };

  const hasUpdates = Object.values(updates).some((value) => value !== undefined);
  if (!hasUpdates) {
    throw new RouteError(400, "Provide at least one review field to update.");
  }

  const { data, error } = await adminClient
    .from("imported_reviews")
    .update(updates)
    .eq("id", input.reviewId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new RouteError(500, error.message);
  }

  if (!data) {
    throw new RouteError(404, "Review not found.");
  }

  await recordAuditLog(adminUserId, "edit_imported_review", "review", input.reviewId, updates);

  return {
    action: input.action,
    review: data,
  };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, adminReviewActionSchema);
    const result = await applyReviewAdminAction(admin.userId, body);

    return json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
