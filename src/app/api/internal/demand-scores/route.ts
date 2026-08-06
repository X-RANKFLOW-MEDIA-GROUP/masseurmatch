import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "";

type DemandTrend = "rising" | "stable" | "falling";

interface DemandScoreRow {
  city: string;
  state: string;
  neighborhood?: string | null;
  score: number;
  trend: DemandTrend;
  search_volume_index: number;
  competition_index: number;
  confidence?: number | null;
  source?: string;
  methodology_version?: string;
  week_start: string;
  collected_at?: string;
  expires_at?: string | null;
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isValidRow(value: unknown): value is DemandScoreRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.city === "string" && row.city.trim().length >= 2 &&
    typeof row.state === "string" && row.state.trim().length === 2 &&
    isScore(row.score) &&
    (row.trend === "rising" || row.trend === "stable" || row.trend === "falling") &&
    isScore(row.search_volume_index) &&
    isScore(row.competition_index) &&
    (row.confidence === undefined || row.confidence === null || isScore(row.confidence)) &&
    isIsoDate(row.week_start) &&
    (row.collected_at === undefined || isIsoTimestamp(row.collected_at)) &&
    (row.expires_at === undefined || row.expires_at === null || isIsoTimestamp(row.expires_at))
  );
}

function normalizeRow(row: DemandScoreRow) {
  const collectedAt = row.collected_at ?? new Date().toISOString();
  const expiresAt = row.expires_at ?? new Date(Date.parse(collectedAt) + 7 * 86_400_000).toISOString();
  return {
    city: row.city.trim(),
    state: row.state.trim().toUpperCase(),
    neighborhood: row.neighborhood?.trim() || null,
    score: row.score,
    trend: row.trend,
    search_volume_index: row.search_volume_index,
    competition_index: row.competition_index,
    confidence: row.confidence ?? 50,
    source: row.source?.trim() || "internal-ingestion",
    methodology_version: row.methodology_version?.trim() || "mvp-v1",
    week_start: row.week_start,
    collected_at: collectedAt,
    expires_at: expiresAt,
    is_sample: false,
  };
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

  if (!Array.isArray(body) || body.length === 0 || body.length > 1000) {
    return NextResponse.json({ error: "Body must contain 1 to 1000 demand score rows" }, { status: 400 });
  }

  const invalidIndexes = body
    .map((row, index) => (isValidRow(row) ? null : index))
    .filter((index): index is number => index !== null);
  if (invalidIndexes.length > 0) {
    return NextResponse.json(
      { error: `${invalidIndexes.length} row(s) failed validation`, invalid_indexes: invalidIndexes },
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
  const normalized = (body as DemandScoreRow[]).map(normalizeRow);

  const { data, error } = await admin
    .from("demand_scores")
    .upsert(normalized, {
      onConflict: "city_key,state_key,neighborhood_key,week_start,methodology_version",
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    console.error("[demand-scores] upsert error", error);
    return NextResponse.json({ error: "Demand score ingestion failed" }, { status: 500 });
  }

  return NextResponse.json({ inserted: data?.length ?? 0 });
}
