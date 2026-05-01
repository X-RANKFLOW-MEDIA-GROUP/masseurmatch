import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, profile_status, bio, city, state, service_categories, incall_price, outcall_price, years_experience, neighborhood")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    // Validate completeness
    const location = profile.neighborhood || profile.city;
    if (!location) throw new RouteError(400, "Location (neighborhood or city) is required before submission.");
    if (!profile.city) throw new RouteError(400, "City is required before submission.");
    if (!profile.years_experience && profile.years_experience !== 0)
      throw new RouteError(400, "Years of experience is required before submission.");
    if (!profile.incall_price && !profile.outcall_price)
      throw new RouteError(400, "At least one price (incall or outcall) is required before submission.");
    if (!profile.service_categories?.length)
      throw new RouteError(400, "At least one service category is required before submission.");

    const now = new Date().toISOString();
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        profile_status: "pending_approval",
        visibility_status: "hidden",
        pending_approval_at: now,
        updated_at: now,
      })
      .eq("user_id", session.userId);

    if (updateError) throw new RouteError(500, updateError.message);

    // Insert a profile_review record
    await adminClient.from("profile_reviews").upsert(
      {
        profile_id: profile.id,
        user_id: session.userId,
        status: "pending_approval",
        pending_approval_at: now,
        updated_at: now,
      },
      { onConflict: "profile_id" }
    );

    return json({ ok: true, status: "pending_approval" });
  } catch (error) {
    return errorResponse(error);
  }
}
