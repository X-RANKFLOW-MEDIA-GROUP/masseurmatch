import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "http://placeholder.supabase.invalid",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key",
);

// POST – create or remove an availability alert
// Body: { userId, therapistId, email?, phone? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, therapistId, email, phone } = body;

    if (!userId || !therapistId) {
      return NextResponse.json(
        { error: "userId and therapistId are required" },
        { status: 400 },
      );
    }

    // Toggle: if alert already exists for this pair, remove it
    const { data: existing } = await supabase
      .from("therapist_alerts")
      .select("id")
      .eq("client_id", userId)
      .eq("therapist_id", therapistId)
      .eq("active", true)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("therapist_alerts")
        .update({ active: false })
        .eq("id", existing.id);

      return NextResponse.json({ success: true, active: false });
    }

    const { error } = await supabase.from("therapist_alerts").insert({
      client_id: userId,
      therapist_id: therapistId,
      email: email ?? null,
      phone: phone ?? null,
      active: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, active: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save alert" },
      { status: 500 },
    );
  }
}

// GET – check whether a user has an active alert for a therapist
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
    .from("therapist_alerts")
    .select("id, active")
    .eq("client_id", userId)
    .eq("therapist_id", therapistId)
    .eq("active", true)
    .maybeSingle();

  return NextResponse.json({ active: Boolean(data) });
}
