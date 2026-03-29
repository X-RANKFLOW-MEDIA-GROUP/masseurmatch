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
]);

async function applyReviewAdminAction(
  adminUserId: string,
  input: z.infer<typeof adminReviewActionSchema>,
) {
  const adminClient = createSupabaseAdminClient() as any;

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

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const { loadImportedReviews } = await import("@/app/admin/_lib/loaders");
    const result = await loadImportedReviews();
    return json(result);
  } catch (error) {
    return errorResponse(error);
  }
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
