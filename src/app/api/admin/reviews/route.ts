export const dynamic = "force-dynamic";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
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

  type ImportedReviewUpdate = Database["public"]["Tables"]["imported_reviews"]["Update"];
  const updates: ImportedReviewUpdate = {};

  if (input.reviewText !== undefined) updates.review_text = input.reviewText;
  if (input.reviewerName !== undefined) updates.reviewer_name = input.reviewerName;
  if (input.rating !== undefined) updates.rating = input.rating;
  if (input.reviewDate !== undefined) updates.review_date = input.reviewDate;
  if (input.sourcePlatform !== undefined && input.sourcePlatform !== null) updates.source_platform = input.sourcePlatform;
  if (input.sourceUrl !== undefined) updates.source_url = input.sourceUrl;

  if (Object.keys(updates).length === 0) {
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
