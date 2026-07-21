 
import { z } from "zod";
import { RouteError, errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import {
  REVIEW_SOURCE_PLATFORMS,
  type ProImportedReview,
  type ProMigrationRequest,
} from "@/lib/imported-reviews";

export const dynamic = "force-dynamic";

const submitRequestSchema = z.object({
  platform: z.enum(REVIEW_SOURCE_PLATFORMS),
  sourceUrl: z.string().trim().url("Enter the full link to your profile (https://...).").max(2000),
});

const cancelRequestSchema = z.object({
  requestId: z.string().uuid(),
});

async function requireOwnProfile(request: Request) {
  const session = await requireSession(request);
  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email, display_name, full_name")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) throw new RouteError(500, error.message);
  if (!profile) throw new RouteError(404, "No therapist profile found for this account.");

  return { session, profile };
}

export async function GET(request: Request) {
  try {
    const { profile } = await requireOwnProfile(request);
    // Cast: profile_migrations/imported_reviews aren't in the generated
    // Supabase types yet (see api/migrate/_lib/processor.ts).
    const adminClient = createSupabaseAdminClient() as any;

    const [requestsRes, reviewsRes] = await Promise.all([
      adminClient
        .from("profile_migrations")
        .select("id, platform, source_url, status, imported_review_count, is_verified, created_at")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false }),
      adminClient
        .from("imported_reviews")
        .select(
          "id, source_platform, source_url, reviewer_name, rating, review_text, review_date, is_public, created_at",
        )
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false }),
    ]);

    if (requestsRes.error) throw new RouteError(500, requestsRes.error.message);
    if (reviewsRes.error) throw new RouteError(500, reviewsRes.error.message);

    return json({
      ok: true,
      requests: (requestsRes.data ?? []) as ProMigrationRequest[],
      reviews: (reviewsRes.data ?? []) as ProImportedReview[],
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, profile } = await requireOwnProfile(request);
    const body = await parseJsonBody(request, submitRequestSchema);
    const adminClient = createSupabaseAdminClient() as any;

    // One open request per URL: block duplicates that are still being worked.
    const { data: existing, error: existingError } = await adminClient
      .from("profile_migrations")
      .select("id, status")
      .eq("profile_id", profile.id)
      .eq("source_url", body.sourceUrl)
      .in("status", ["pending", "in_progress", "manual_review"])
      .limit(1);

    if (existingError) throw new RouteError(500, existingError.message);
    if (existing?.length) {
      throw new RouteError(409, "You already submitted this link — it's in our import queue.");
    }

    const { data: migration, error } = await adminClient
      .from("profile_migrations")
      .insert({
        profile_id: profile.id,
        email: profile.email ?? session.userId,
        platform: body.platform,
        source_url: body.sourceUrl,
        // The MasseurMatch team transcribes reviews by hand, so requests go
        // straight to the manual queue instead of the automatic scraper.
        status: "manual_review",
      })
      .select("id, platform, source_url, status, imported_review_count, is_verified, created_at")
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);

    const therapistName = profile.display_name || profile.full_name || profile.email || "A therapist";
    void notifyAdmin({
      subject: "New review import request",
      heading: "Review import requested",
      intro: `${therapistName} asked us to import their reviews from ${body.platform}.`,
      fields: [
        { label: "Therapist", value: therapistName },
        { label: "Email", value: profile.email },
        { label: "Platform", value: body.platform },
        { label: "Profile URL", value: body.sourceUrl },
      ],
      action: { label: "Open migration queue", url: "https://masseurmatch.com/admin/migrations" },
      replyTo: profile.email,
    });

    return json({ ok: true, request: migration as ProMigrationRequest }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { profile } = await requireOwnProfile(request);
    const body = await parseJsonBody(request, cancelRequestSchema);
    const adminClient = createSupabaseAdminClient() as any;

    // Only requests the team hasn't started can be withdrawn.
    const { data, error } = await adminClient
      .from("profile_migrations")
      .delete()
      .eq("id", body.requestId)
      .eq("profile_id", profile.id)
      .in("status", ["pending", "manual_review"])
      .select("id");

    if (error) throw new RouteError(500, error.message);
    if (!data?.length) {
      throw new RouteError(404, "Request not found, or it is already being processed.");
    }

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
