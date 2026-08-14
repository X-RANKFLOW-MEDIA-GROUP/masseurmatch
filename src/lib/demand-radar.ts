export type DemandTrend = "rising" | "stable" | "falling";
export type DataFreshness = "fresh" | "delayed" | "stale" | "unknown";
export type SpikeWindowStatus = "active" | "watch" | "normal";

export interface DemandScoreRecord {
  id: string;
  city: string;
  state: string;
  neighborhood: string | null;
  score: number;
  trend: DemandTrend;
  spike_score: number | null;
  search_volume_index: number;
  competition_index: number | null;
  confidence: number | null;
  source: string | null;
  week_start: string;
  collected_at: string | null;
  expires_at: string | null;
}

export interface SpikeWindow {
  status: SpikeWindowStatus;
  label: string;
  start: string | null;
  end: string | null;
  action: string;
}

export function getDemandFreshness(collectedAt: string | null | undefined, now = new Date()): DataFreshness {
  if (!collectedAt) return "unknown";
  const collected = new Date(collectedAt);
  if (Number.isNaN(collected.getTime())) return "unknown";
  const ageHours = Math.max(0, (now.getTime() - collected.getTime()) / 3_600_000);
  if (ageHours <= 48) return "fresh";
  if (ageHours <= 168) return "delayed";
  return "stale";
}

export function formatUsDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const parsed = value instanceof Date ? value : new Date(value.includes("T") ? value : `${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(parsed);
}

export function getDemandLabel(score: number): string {
  if (score >= 85) return "Very high";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function getSpikeLabel(score: number | null | undefined): string {
  if (score == null) return "No signal";
  if (score >= 80) return "Spiking";
  if (score >= 60) return "Accelerating";
  if (score >= 40) return "Active";
  return "Normal";
}

export function getSpikeWindow(record: Pick<DemandScoreRecord, "spike_score" | "trend" | "collected_at" | "confidence">): SpikeWindow {
  const spike = record.spike_score ?? 0;
  const confidence = record.confidence ?? 0;
  const collected = record.collected_at ? new Date(record.collected_at) : null;
  const validCollected = collected && !Number.isNaN(collected.getTime()) ? collected : null;
  const end = validCollected ? new Date(validCollected.getTime() + 7 * 86_400_000) : null;

  if (record.trend === "rising" && spike >= 80 && confidence >= 50) {
    return { status: "active", label: "Active now · strongest signal in the next 7 days", start: validCollected?.toISOString() ?? null, end: end?.toISOString() ?? null, action: "This market is accelerating now. Consider increasing availability and visibility while the signal remains fresh." };
  }
  if (record.trend === "rising" && spike >= 60) {
    return { status: "watch", label: "Watch closely · acceleration detected for the next 7 days", start: validCollected?.toISOString() ?? null, end: end?.toISOString() ?? null, action: "Demand is building. Keep availability current and watch for a stronger spike confirmation." };
  }
  return { status: "normal", label: "No confirmed spike window", start: null, end: null, action: "No unusual acceleration is confirmed yet. Use the demand score as market context, not as a booking prediction." };
}

export function shouldSendSpikeAlert(record: Pick<DemandScoreRecord, "spike_score" | "trend" | "confidence">): boolean {
  return record.trend === "rising" && (record.spike_score ?? 0) >= 80 && (record.confidence ?? 0) >= 50;
}

export function getOpportunityScore(record: Pick<DemandScoreRecord, "score" | "competition_index" | "confidence">): number | null {
  if (record.competition_index == null) return null;
  const confidence = record.confidence ?? 50;
  const lowCompetition = 100 - record.competition_index;
  return Math.round(record.score * 0.65 + lowCompetition * 0.2 + confidence * 0.15);
}

export function rankDemandRecords(records: DemandScoreRecord[]): DemandScoreRecord[] {
  return [...records].sort((a, b) => {
    const aOpportunity = getOpportunityScore(a);
    const bOpportunity = getOpportunityScore(b);
    if (aOpportunity != null && bOpportunity != null && bOpportunity !== aOpportunity) return bOpportunity - aOpportunity;
    if ((b.spike_score ?? 0) !== (a.spike_score ?? 0)) return (b.spike_score ?? 0) - (a.spike_score ?? 0);
    if (b.score !== a.score) return b.score - a.score;
    return `${a.city}-${a.neighborhood ?? ""}`.localeCompare(`${b.city}-${b.neighborhood ?? ""}`);
  });
}
