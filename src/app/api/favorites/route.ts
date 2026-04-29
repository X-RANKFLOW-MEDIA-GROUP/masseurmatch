import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "http://placeholder.supabase.invalid",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key",
);

// POST – toggle favorite for a therapist
// Body: { userId, therapistId }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, therapistId } = body;

    if (!userId || !therapistId) {
      return NextResponse.json(
        { error: "userId and therapistId are required" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      return NextResponse.json({ success: true, saved: false });
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      therapist_id: therapistId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, saved: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save favorite" },
      { status: 500 },
    );
  }
}

// GET – check whether a therapist is saved as favorite
// Query: userId, therapistId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const therapistId = searchParams.get("therapistId");

  if (!userId || !therapistId) {
    return NextResponse.json(
      { error: "userId and therapistId are required" },
      { status: 400 },
    );
  }

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("therapist_id", therapistId)
    .maybeSingle();

  return NextResponse.json({ saved: Boolean(data) });
}
