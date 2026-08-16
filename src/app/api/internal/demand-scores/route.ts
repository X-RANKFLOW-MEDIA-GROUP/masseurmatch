import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "";

type DemandTrend = "rising" | "stable" | "falling";
type RunStatus = "running" | "completed" | "partial" | "failed";

interface DemandScoreRow {
  city: string;
  state: string;
  region_code?: string | null;
  region_name?: string | null;
  neighborhood?: string | null;
  score: number;
  trend: DemandTrend;
  search_volume_index: number;
  competition_index?: number | null;
  spike_score?: number;
  baseline_index?: number;
  growth_pct?: number | null;
  velocity_score?: number;
  persistence_score?: number;
  confidence?: number | null;
  sample_size?: number;
  score_components?: Record<string, unknown>;
  source?: string;
  methodology_version?: string;
  week_start: string;
  collected_at?: string;
  expires_at?: string | null;
  run_id?: string | null;
}

interface CollectionRun {
  run_id: string;
  status: RunStatus;
  started_at: string;
  completed_at?: string | null;
  markets_requested: number;
  markets_succeeded: number;
  markets_failed: number;
  error_summary?: unknown[];
  metadata?: Record<string, unknown>;
}

interface IngestionEnvelope { run: CollectionRun; rows: DemandScoreRow[]; }

function isScore(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100; }
function isNonNegativeInteger(value: unknown, maximum = 10_000): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= maximum; }
function isFiniteNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function isIsoDate(value: unknown): value is string { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)); }
function isIsoTimestamp(value: unknown): value is string { return typeof value === "string" && !Number.isNaN(Date.parse(value)); }
function isPlainObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }

function isValidRow(value: unknown): value is DemandScoreRow {
  if (!isPlainObject(value)) return false;
  return (
    typeof value.city === "string" && value.city.trim().length >= 2 &&
    typeof value.state === "string" && value.state.trim().length === 2 &&
    (value.region_code === undefined || value.region_code === null || (typeof value.region_code === "string" && /^US-[A-Z]{2}$/.test(value.region_code))) &&
    isScore(value.score) &&
    (value.trend === "rising" || value.trend === "stable" || value.trend === "falling") &&
    isScore(value.search_volume_index) &&
    (value.competition_index === undefined || value.competition_index === null || isScore(value.competition_index)) &&
    (value.spike_score === undefined || isScore(value.spike_score)) &&
    (value.baseline_index === undefined || isScore(value.baseline_index)) &&
    (value.growth_pct === undefined || value.growth_pct === null || (isFiniteNumber(value.growth_pct) && value.growth_pct >= -1000 && value.growth_pct <= 1000)) &&
    (value.velocity_score === undefined || isScore(value.velocity_score)) &&
    (value.persistence_score === undefined || isScore(value.persistence_score)) &&
    (value.confidence === undefined || value.confidence === null || isScore(value.confidence)) &&
    (value.sample_size === undefined || isNonNegativeInteger(value.sample_size, 500)) &&
    (value.score_components === undefined || isPlainObject(value.score_components)) &&
    isIsoDate(value.week_start) &&
    (value.collected_at === undefined || isIsoTimestamp(value.collected_at)) &&
    (value.expires_at === undefined || value.expires_at === null || isIsoTimestamp(value.expires_at)) &&
    (value.run_id === undefined || value.run_id === null || (typeof value.run_id === "string" && value.run_id.length <= 100))
  );
}

function isValidRun(value: unknown): value is CollectionRun {
  if (!isPlainObject(value)) return false;
  return typeof value.run_id === "string" && value.run_id.trim().length >= 8 && value.run_id.length <= 100 &&
    (value.status === "running" || value.status === "completed" || value.status === "partial" || value.status === "failed") &&
    isIsoTimestamp(value.started_at) &&
    (value.completed_at === undefined || value.completed_at === null || isIsoTimestamp(value.completed_at)) &&
    isNonNegativeInteger(value.markets_requested) && isNonNegativeInteger(value.markets_succeeded) && isNonNegativeInteger(value.markets_failed) &&
    (value.error_summary === undefined || Array.isArray(value.error_summary)) && (value.metadata === undefined || isPlainObject(value.metadata));
}

function parseEnvelope(body: unknown): IngestionEnvelope | null {
  if (Array.isArray(body)) {
    const now = new Date().toISOString();
    return { run: { run_id: `legacy-${randomUUID()}`, status: "completed", started_at: now, completed_at: now, markets_requested: body.length, markets_succeeded: body.length, markets_failed: 0, metadata: { legacy_array_payload: true } }, rows: body as DemandScoreRow[] };
  }
  if (!isPlainObject(body) || !isValidRun(body.run) || !Array.isArray(body.rows)) return null;
  return { run: body.run, rows: body.rows as DemandScoreRow[] };
}

function normalizeRow(row: DemandScoreRow, envelopeRunId: string) {
  const collectedAt = row.collected_at ?? new Date().toISOString();
  const expiresAt = row.expires_at ?? new Date(Date.parse(collectedAt) + 72 * 3_600_000).toISOString();
  return {
    city: row.city.trim(), state: row.state.trim().toUpperCase(), region_code: row.region_code?.trim().toUpperCase() || null,
    region_name: row.region_name?.trim() || null, neighborhood: row.neighborhood?.trim() || null, score: row.score, trend: row.trend,
    search_volume_index: row.search_volume_index, competition_index: row.competition_index ?? null, spike_score: row.spike_score ?? 0,
    baseline_index: row.baseline_index ?? 0, growth_pct: row.growth_pct ?? null, velocity_score: row.velocity_score ?? 0,
    persistence_score: row.persistence_score ?? 0, confidence: row.confidence ?? 50, sample_size: row.sample_size ?? 0,
    score_components: row.score_components ?? {}, source: row.source?.trim() || "internal-ingestion",
    methodology_version: row.methodology_version?.trim() || "mvp-v1", week_start: row.week_start, collected_at: collectedAt,
    expires_at: expiresAt, run_id: row.run_id?.trim() || envelopeRunId, is_sample: false,
  };
}

function usDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

async function sendSpikeAlerts(admin: any, rows: Array<{id:string;city:string;state:string;spike_score:number|null;confidence:number|null;trend:DemandTrend;collected_at:string|null;run_id:string|null}>) {
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) return { sent: 0, skipped: rows.length, reason: "RESEND_API_KEY missing" };
  const resend = new Resend(apiKey);
  let sent = 0;
  let skipped = 0;
  const alertRows = rows.filter((row) => row.trend === "rising" && (row.spike_score ?? 0) >= 80 && (row.confidence ?? 0) >= 50);

  for (const row of alertRows) {
    const { data: profiles, error: profileError } = await admin.from("profiles").select("id,email,email_address,city,state,subscription_tier").ilike("city", row.city).ilike("state", row.state).eq("subscription_tier", "elite");
    if (profileError || !profiles?.length) { skipped += 1; continue; }

    const profileIds = profiles.map((p: any) => p.id);
    const { data: prefs } = await admin.from("ai_profile_coach_email_preferences").select("profile_id,include_market_insights,daily_email_enabled").in("profile_id", profileIds);
    const prefMap = new Map((prefs ?? []).map((p: any) => [p.profile_id, p]));
    const { data: existing } = await admin.from("demand_radar_spike_alert_deliveries").select("profile_id").eq("demand_score_id", row.id).in("profile_id", profileIds);
    const alreadySent = new Set((existing ?? []).map((item: any) => item.profile_id));

    for (const profile of profiles as any[]) {
      const email = String(profile.email_address ?? profile.email ?? "").trim();
      const pref = prefMap.get(profile.id) as any;
      if (!email || alreadySent.has(profile.id) || pref?.include_market_insights === false || pref?.daily_email_enabled === false) { skipped += 1; continue; }

      const start = row.collected_at ? new Date(row.collected_at) : new Date();
      const end = new Date(start.getTime() + 7 * 86_400_000);
      const { error: queueError } = await admin.from("demand_radar_spike_alert_deliveries").insert({ profile_id: profile.id, demand_score_id: row.id, run_id: row.run_id, city: row.city, state: row.state, spike_score: row.spike_score ?? 0, confidence: row.confidence, recipient_email: email, status: "queued" });
      if (queueError) { skipped += 1; continue; }

      try {
        const { data, error } = await resend.emails.send({
          from: "MasseurMatch Demand Radar <notifications@masseurmatch.com>", to: email,
          subject: `Demand spike detected in ${row.city}, ${row.state}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#211c19"><h1 style="font-size:26px">Demand is spiking in your city</h1><p><strong>Where:</strong> ${row.city}, ${row.state}</p><p><strong>Estimated signal window:</strong> ${usDate(start.toISOString())} – ${usDate(end.toISOString())}</p><p><strong>Spike:</strong> ${row.spike_score ?? 0}/100<br/><strong>Confidence:</strong> ${row.confidence ?? 0}/100</p><p>This is a high-confidence market acceleration signal. Consider keeping your availability and profile visibility current while the signal remains fresh.</p><p style="font-size:12px;color:#756c66">Demand Radar is statistical market intelligence. It does not guarantee searches, inquiries, bookings, or revenue.</p></div>`,
        });
        if (error) throw error;
        await admin.from("demand_radar_spike_alert_deliveries").update({ status: "sent", provider_message_id: data?.id ?? null, sent_at: new Date().toISOString() }).eq("profile_id", profile.id).eq("demand_score_id", row.id);
        sent += 1;
      } catch (error) {
        await admin.from("demand_radar_spike_alert_deliveries").update({ status: "failed", error: error instanceof Error ? error.message.slice(0, 500) : "Unknown email error" }).eq("profile_id", profile.id).eq("demand_score_id", row.id);
      }
    }
  }
  return { sent, skipped };
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-internal-api-key") ?? "";
  if (!INTERNAL_KEY || apiKey !== INTERNAL_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const envelope = parseEnvelope(body);
  if (!envelope || envelope.rows.length > 1000) return NextResponse.json({ error: "Body must be a valid run envelope with up to 1000 rows" }, { status: 400 });
  if (envelope.rows.length === 0 && envelope.run.status !== "failed") return NextResponse.json({ error: "Only failed runs may contain zero rows" }, { status: 400 });

  const invalidIndexes = envelope.rows.map((row, index) => (isValidRow(row) ? null : index)).filter((index): index is number => index !== null);
  if (invalidIndexes.length > 0) return NextResponse.json({ error: `${invalidIndexes.length} row(s) failed validation`, invalid_indexes: invalidIndexes }, { status: 422 });

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const normalized = envelope.rows.map((row) => normalizeRow(row, envelope.run.run_id));
  const runRecord = { run_id: envelope.run.run_id.trim(), status: envelope.run.status, started_at: envelope.run.started_at, completed_at: envelope.run.completed_at ?? null, markets_requested: envelope.run.markets_requested, markets_succeeded: envelope.run.markets_succeeded, markets_failed: envelope.run.markets_failed, rows_ingested: 0, error_summary: envelope.run.error_summary ?? [], metadata: envelope.run.metadata ?? {}, updated_at: new Date().toISOString() };

  const { error: runError } = await admin.from("demand_collection_runs").upsert(runRecord, { onConflict: "run_id" });
  if (runError) { console.error("[demand-scores] collection run upsert error", runError); return NextResponse.json({ error: "Collection run logging failed" }, { status: 500 }); }
  if (normalized.length === 0) return NextResponse.json({ inserted: 0, run_id: envelope.run.run_id, status: envelope.run.status });

  const { data, error } = await admin.from("demand_scores").upsert(normalized, { onConflict: "city_key,state_key,neighborhood_key,week_start", ignoreDuplicates: false }).select("id,city,state,spike_score,confidence,trend,collected_at,run_id");
  if (error) {
    console.error("[demand-scores] upsert error", error);
    await admin.from("demand_collection_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_summary: [...(envelope.run.error_summary ?? []), { scope: "database", error: error.message }], updated_at: new Date().toISOString() }).eq("run_id", envelope.run.run_id);
    return NextResponse.json({ error: "Demand score ingestion failed" }, { status: 500 });
  }

  const inserted = data?.length ?? 0;
  await admin.from("demand_collection_runs").update({ rows_ingested: inserted, updated_at: new Date().toISOString() }).eq("run_id", envelope.run.run_id);
  const alerts = await sendSpikeAlerts(admin, (data ?? []) as any);
  return NextResponse.json({ inserted, run_id: envelope.run.run_id, status: envelope.run.status, alerts });
}
