import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Protected by INTERNAL_API_KEY header — never expose this endpoint publicly.
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "";

interface DemandScoreRow {
  city: string;
  state: string;
  neighborhood?: string | null;
  score: number;
  trend: "rising" | "stable" | "falling";
  search_volume_index: number;
  competition_index: number;
  week_start: string; // ISO date e.g. "2026-06-08"
}

function isValidRow(r: unknown): r is DemandScoreRow {
  if (!r || typeof r !== "object") return false;
  const row = r as Record<string, unknown>;
  return (
    typeof row.city === "string" &&
    typeof row.state === "string" &&
    typeof row.score === "number" &&
    row.score >= 0 &&
    row.score <= 100 &&
    (row.trend === "rising" || row.trend === "stable" || row.trend === "falling") &&
    typeof row.search_volume_index === "number" &&
    typeof row.competition_index === "number" &&
    typeof row.week_start === "string"
  );
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-internal-api-key") ?? "";
  if (!INTERNAL_KEY || apiKey !== INTERNAL_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be an array of demand score rows" }, { status: 400 });
  }

  const rows = body as unknown[];
  const invalid = rows.filter((r) => !isValidRow(r));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `${invalid.length} row(s) failed validation`, invalid },
      { status: 422 },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("demand_scores")
    .upsert(rows as DemandScoreRow[], {
      onConflict: "city,state,neighborhood,week_start",
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    console.error("[demand-scores] upsert error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data?.length ?? 0 });
}
