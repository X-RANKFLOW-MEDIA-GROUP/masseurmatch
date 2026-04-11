import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET reviews for a therapist
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const sortBy = searchParams.get("sortBy") ?? "recent";

  if (!therapistId) {
    return NextResponse.json({ error: "therapistId is required" }, { status: 400 });
  }

  let query = supabase
    .from("reviews")
    .select(`
      id,
      rating,
      title,
      content,
      is_verified,
      helpful_count,
      created_at,
      client:auth.users!client_id (
        raw_user_meta_data
      )
    `, { count: "exact" })
    .eq("therapist_id", therapistId)
    .eq("is_public", true);

  // Sorting
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

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate rating distribution
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

// POST create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { therapistId, rating, title, content, clientId } = body;

    // Validation
    if (!therapistId || !rating || !clientId) {
      return NextResponse.json(
        { error: "therapistId, rating, and clientId are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this therapist
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("client_id", clientId)
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this therapist" },
        { status: 400 }
      );
    }

    // Check if user had a contact inquiry with this therapist (verified review)
    const { data: inquiry } = await supabase
      .from("contact_inquiries")
      .select("id")
      .eq("therapist_id", therapistId)
      .eq("client_email", (await supabase.auth.admin.getUserById(clientId)).data.user?.email)
      .maybeSingle();

    const isVerified = !!inquiry;

    // Create review
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        client_id: clientId,
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

    // Create notification for therapist
    const { data: therapist } = await supabase
      .from("therapist_profiles")
      .select("user_id")
      .eq("id", therapistId)
      .single();

    if (therapist) {
      await supabase.from("notifications").insert({
        user_id: therapist.user_id,
        type: "new_review",
        title: "New Review Received",
        message: `You received a ${rating}-star review${title ? `: "${title}"` : ""}`,
        data: { review_id: data.id, rating },
      });
    }

    return NextResponse.json({ review: data, isVerified });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// PATCH update a review
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, rating, title, content, clientId } = body;

    if (!reviewId || !clientId) {
      return NextResponse.json(
        { error: "reviewId and clientId are required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (rating) updates.rating = rating;
    if (title !== undefined) updates.title = title?.trim() || null;
    if (content !== undefined) updates.content = content?.trim() || null;

    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", reviewId)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE a review
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");
  const clientId = searchParams.get("clientId");

  if (!reviewId || !clientId) {
    return NextResponse.json(
      { error: "reviewId and clientId are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("client_id", clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
