import { NextRequest, NextResponse } from "next/server";
import { requireSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const sortBy = searchParams.get("sortBy") ?? "recent";

  if (!therapistId) {
    return NextResponse.json({ error: "therapistId is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("reviews")
    .select("id, rating, title, content, is_verified, helpful_count, created_at", { count: "exact" })
    .eq("therapist_id", therapistId)
    .eq("is_public", true);

  switch (sortBy) {
    case "rating-high":
      query = query.order("rating", { ascending: false });
      break;
    case "rating-low":
      query = query.order("rating", { ascending: true });
      break;
    case "helpful":
      query = query.order("helpful_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: distribution } = await supabase
    .from("reviews")
    .select("rating")
    .eq("therapist_id", therapistId)
    .eq("is_public", true);

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: distribution?.filter((r) => r.rating === rating).length ?? 0,
  }));

  return NextResponse.json({
    reviews: data,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
    ratingDistribution,
  });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { therapistId, rating, title, content } = body;

    if (!therapistId || !rating) {
      return NextResponse.json(
        { error: "therapistId and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("client_id", session.userId)
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this therapist" }, { status: 400 });
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", session.userId)
      .maybeSingle();

    // Check contact_events first (strongest proof of real contact)
    const { data: contactEvent, error: contactEventError } = await supabase
      .from("contact_events")
      .select("id")
      .eq("user_id", session.userId)
      .eq("profile_id", therapistId)
      .limit(1)
      .maybeSingle();

    // On DB error, fall through to the inquiry fallback rather than silently treating as "no contact"
    const hasContactEvent = !contactEventError && !!contactEvent;

    // Fallback: contact_inquiries (email-based inquiry form)
    const { data: inquiry } = !hasContactEvent && userProfile?.email
      ? await supabase
          .from("contact_inquiries")
          .select("id")
          .eq("profile_id", therapistId)
          .eq("client_email", userProfile.email)
          .maybeSingle()
      : { data: null };

    const isVerified = hasContactEvent || !!inquiry;

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        client_id: session.userId,
        therapist_id: therapistId,
        rating,
        title: title?.trim() || null,
        content: content?.trim() || null,
        is_verified: isVerified,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: therapistProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("id", therapistId)
      .maybeSingle();

    if (therapistProfile?.user_id) {
      await supabase.from("notifications").insert({
        user_id: therapistProfile.user_id,
        type: "new_review",
        title: "New Review Received",
        message: `You received a ${rating}-star review${title ? `: "${title}"` : ""}`,
        data: { review_id: data.id, rating },
      });
    }

    return NextResponse.json({ review: data, isVerified });
  } catch (error) {
    console.error("[api/reviews] POST error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewId, rating, title, content } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const updates: { updated_at: string; rating?: number; title?: string | null; content?: string | null } = {
      updated_at: new Date().toISOString(),
    };
    if (rating) updates.rating = rating;
    if (title !== undefined) updates.title = title?.trim() || null;
    if (content !== undefined) updates.content = content?.trim() || null;

    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", reviewId)
      .eq("client_id", session.userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data });
  } catch (error) {
    console.error("[api/reviews] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("client_id", session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
