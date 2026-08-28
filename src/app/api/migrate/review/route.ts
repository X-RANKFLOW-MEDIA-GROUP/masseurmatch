import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const reviewDecisionSchema = z.object({
  reviewId: z.string().uuid(),
  approved: z.boolean(),
  notes: z.string().trim().max(1_000).optional(),
});

const reviewRequestSchema = z.object({
  migrationId: z.string().uuid(),
  reviews: z.array(reviewDecisionSchema).min(1).max(1_000),
}).superRefine((value, context) => {
  const uniqueIds = new Set(value.reviews.map((review) => review.reviewId));
  if (uniqueIds.size !== value.reviews.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reviews"], message: "Each imported review can only be decided once." });
  }
});

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();
    const { data: migrations, error } = await (adminClient as any)
      .from("profile_migrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new RouteError(500, error.message);

    const migrationIds = (migrations ?? []).map((migration: { id: string }) => migration.id);
    let reviews: Array<{ migration_id: string }> = [];
    if (migrationIds.length > 0) {
      const { data: reviewRows, error: reviewsError } = await (adminClient as any)
        .from("imported_reviews")
        .select("*")
        .in("migration_id", migrationIds)
        .order("review_date", { ascending: false });
      if (reviewsError) throw new RouteError(500, reviewsError.message);
      reviews = reviewRows ?? [];
    }

    return json({
      ok: true,
      migrations: (migrations ?? []).map((migration: { id: string }) => ({
        ...migration,
        reviews: reviews.filter((review) => review.migration_id === migration.id),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession(request);
    const userId = session.userId;
    const body = await parseJsonBody(request, reviewRequestSchema);
    const adminClient = createSupabaseAdminClient();

    const { data: migration, error: migrationError } = await (adminClient as any)
      .from("profile_migrations")
      .select("id")
      .eq("id", body.migrationId)
      .maybeSingle();
    if (migrationError) throw new RouteError(500, "Could not retrieve migration.");
    if (!migration) throw new RouteError(404, "Migration not found.");

    const { data: pendingRows, error: pendingError } = await (adminClient as any)
      .from("imported_reviews")
      .select("id")
      .eq("migration_id", body.migrationId)
      .is("reviewed_at", null);
    if (pendingError) throw new RouteError(500, "Could not verify pending imported reviews.");

    const pendingIds = new Set((pendingRows ?? []).map((review: { id: string }) => review.id));
    const submittedIds = body.reviews.map((review) => review.reviewId);
    if (
      pendingIds.size !== submittedIds.length ||
      submittedIds.some((reviewId) => !pendingIds.has(reviewId))
    ) {
      throw new RouteError(400, "Include one decision for every pending imported review in this migration.");
    }

    const reviewedAt = new Date().toISOString();
    for (const decision of body.reviews) {
      const decisionLabel = decision.approved ? "retained_private" : "excluded_private";
      const note = [decisionLabel, decision.notes?.trim()].filter(Boolean).join(": ");
      const { data: updatedReview, error: updateError } = await (adminClient as any)
        .from("imported_reviews")
        .update({
          is_public: false,
          reviewed_at: reviewedAt,
          reviewed_by: userId,
          review_notes: note || decisionLabel,
        })
        .eq("id", decision.reviewId)
        .eq("migration_id", body.migrationId)
        .is("reviewed_at", null)
        .select("id")
        .maybeSingle();
      if (updateError || !updatedReview) throw new RouteError(500, "Could not update imported review status.");
    }

    const retainedCount = body.reviews.filter((review) => review.approved).length;
    const excludedCount = body.reviews.length - retainedCount;
    const { error: verificationError } = await (adminClient as any)
      .from("profile_migrations")
      .update({ is_verified: true, verified_at: reviewedAt, verified_by: userId, updated_at: reviewedAt })
      .eq("id", body.migrationId);
    if (verificationError) throw new RouteError(500, "Could not finalize migration review.");

    await recordAuditLog(userId, "profile_import_reviewed", "profile_migration", body.migrationId, {
      retained_private_reviews: retainedCount,
      excluded_private_reviews: excludedCount,
      public_reviews: 0,
    });

    return json({
      ok: true,
      retained: retainedCount,
      excluded: excludedCount,
      public: 0,
      message: `${retainedCount} retained privately, ${excludedCount} excluded from use. No reviews were published.`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
