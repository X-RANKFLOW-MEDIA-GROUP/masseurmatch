import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "http://placeholder.supabase.invalid",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key",
);

const ALLOWED_REASONS = [
  "fake_profile",
  "inappropriate_content",
  "misleading_information",
  "spam",
  "other",
] as const;

type ReportReason = (typeof ALLOWED_REASONS)[number];

// POST – submit a general profile report
// Body: { therapistId, reporterEmail, reason, details? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      therapistId,
      reporterEmail,
      reason,
      details,
    }: {
      therapistId: string;
      reporterEmail: string;
      reason: ReportReason;
      details?: string;
    } = body;

    if (!therapistId || !reporterEmail || !reason) {
      return NextResponse.json(
        { error: "therapistId, reporterEmail, and reason are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid report reason" }, { status: 400 });
    }

    const { error } = await supabase.from("profile_reports").insert({
      therapist_id: therapistId,
      reporter_email: reporterEmail,
      reason,
      details: details?.trim() ?? null,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit report" },
      { status: 500 },
    );
  }
}
