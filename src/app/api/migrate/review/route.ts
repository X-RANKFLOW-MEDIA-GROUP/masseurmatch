import React from "react";
import { z } from "zod";

import { sendEmail } from "@/app/api/_lib/email";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { SITE_URL } from "@/lib/site";

const reviewDecisionSchema = z.object({
  reviewId: z.string().uuid(),
  approved: z.boolean(),
  notes: z.string().trim().max(1_000).optional(),
});

const reviewRequestSchema = z
  .object({
    migrationId: z.string().uuid(),
    reviews: z.array(reviewDecisionSchema).min(1).max(1_000),
  })
  .superRefine((value, context) => {
    const uniqueIds = new Set(value.reviews.map((review) => review.reviewId));
    if (uniqueIds.size !== value.reviews.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviews"],
        message: "Each imported review can only be decided once.",
      });
    }
  });

// Admin listing for /admin/migrations: pending/processed migrations with
// their imported reviews attached.
export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    // Cast: profile_migrations/imported_reviews aren't in the generated
    // Supabase types yet (see processor.ts).
    const { data: migrations, error } = await (adminClient as any)
      .from("profile_migrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new RouteError(500, error.message);
    }

    const migrationIds = (migrations ?? []).map((m: { id: string }) => m.id);
    let reviews: Array<{ migration_id: string }> = [];
    if (migrationIds.length > 0) {
      const { data: reviewRows, error: reviewsError } = await (adminClient as any)
        .from("imported_reviews")
        .select("*")
        .in("migration_id", migrationIds);
      if (reviewsError) {
        throw new RouteError(500, reviewsError.message);
      }
      reviews = reviewRows ?? [];
    }

    const items = (migrations ?? []).map((migration: { id: string }) => ({
      ...migration,
      reviews: reviews.filter((review) => review.migration_id === migration.id),
    }));

    return json({ ok: true, migrations: items });
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
      .select("id, email")
      .eq("id", body.migrationId)
      .maybeSingle();

    if (migrationError) throw new RouteError(500, "Could not retrieve migration.");
    if (!migration) throw new RouteError(404, "Migration not found.");

    const reviewIds = body.reviews.map((review) => review.reviewId);
    const { data: migrationReviews, error: reviewLookupError } = await (adminClient as any)
      .from("imported_reviews")
      .select("id")
      .eq("migration_id", body.migrationId);

    if (reviewLookupError) throw new RouteError(500, "Could not verify imported reviews.");

    const migrationReviewIds = new Set(
      (migrationReviews ?? []).map((review: { id: string }) => review.id),
    );
    if (
      migrationReviewIds.size !== reviewIds.length ||
      reviewIds.some((reviewId) => !migrationReviewIds.has(reviewId))
    ) {
      throw new RouteError(400, "Include one decision for every review in this migration.");
    }

    for (const decision of body.reviews) {
      const updateData: Record<string, unknown> = {
        is_public: decision.approved,
        public_label: "Imported review",
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        review_notes: decision.notes || null,
      };

      const { data: updatedReview, error: updateError } = await (adminClient as any)
        .from("imported_reviews")
        .update(updateData)
        .eq("id", decision.reviewId)
        .eq("migration_id", body.migrationId)
        .select("id")
        .maybeSingle();

      if (updateError || !updatedReview) {
        console.error(
          "[api/migrate/review] Update error:",
          updateError?.message || "review row did not match the selected migration",
        );
        throw new RouteError(500, "Could not update review status.");
      }
    }

    const approvedCount = body.reviews.filter((review) => review.approved).length;
    const rejectedCount = body.reviews.length - approvedCount;
    const verifiedAt = new Date().toISOString();
    const { error: verificationError } = await (adminClient as any)
      .from("profile_migrations")
      .update({ is_verified: true, verified_at: verifiedAt, verified_by: userId })
      .eq("id", body.migrationId);

    if (verificationError) throw new RouteError(500, "Could not finalize migration review.");

    await recordAuditLog(userId, "profile_import_reviewed", "profile_migration", body.migrationId, {
      approved_reviews: approvedCount,
      rejected_reviews: rejectedCount,
    });

    if (migration.email) {
      await sendEmail({
        to: migration.email,
        subject: approvedCount > 0
          ? "Your imported reviews are now live"
          : "Your profile import review is complete",
        react: React.createElement(
          "div",
          null,
          React.createElement("h1", null, "Your profile import review is complete"),
          React.createElement(
            "p",
            null,
            approvedCount > 0
              ? `${approvedCount} imported ${approvedCount === 1 ? "review is" : "reviews are"} now published on your profile.`
              : "None of the submitted reviews met the requirements for publication.",
          ),
          React.createElement(
            "p",
            null,
            React.createElement("a", { href: `${SITE_URL}/pro/dashboard` }, "View your profile"),
          ),
        ),
      }).catch((error) => {
        console.error("[api/migrate/review] Email send failed:", error);
      });
    }

    return json({
      ok: true,
      approved: approvedCount,
      rejected: rejectedCount,
      message: `${approvedCount} approved, ${rejectedCount} rejected.`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
