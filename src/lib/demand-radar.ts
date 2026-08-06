export type DemandTrend = "rising" | "stable" | "falling";
export type DataFreshness = "fresh" | "delayed" | "stale" | "unknown";

export interface DemandScoreRecord {
  id: string;
  city: string;
  state: string;
  neighborhood: string | null;
  score: number;
  trend: DemandTrend;
  search_volume_index: number;
  competition_index: number;
  confidence: number | null;
  source: string | null;
  week_start: string;
  collected_at: string | null;
  expires_at: string | null;
}

export function getDemandFreshness(
  collectedAt: string | null | undefined,
  now = new Date(),
): DataFreshness {
  if (!collectedAt) return "unknown";
  const collected = new Date(collectedAt);
  if (Number.isNaN(collected.getTime())) return "unknown";

  const ageHours = Math.max(0, (now.getTime() - collected.getTime()) / 3_600_000);
  if (ageHours <= 48) return "fresh";
  if (ageHours <= 168) return "delayed";
  return "stale";
}

export function getDemandLabel(score: number): string {
  if (score >= 85) return "Very high";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function getOpportunityScore(record: Pick<DemandScoreRecord, "score" | "competition_index" | "confidence">): number {
  const confidence = record.confidence ?? 50;
  const lowCompetition = 100 - record.competition_index;
  return Math.round(record.score * 0.65 + lowCompetition * 0.2 + confidence * 0.15);
}

export function rankDemandRecords(records: DemandScoreRecord[]): DemandScoreRecord[] {
  return [...records].sort((a, b) => {
    const opportunityDelta = getOpportunityScore(b) - getOpportunityScore(a);
    if (opportunityDelta !== 0) return opportunityDelta;
    if (b.score !== a.score) return b.score - a.score;
    return `${a.city}-${a.neighborhood ?? ""}`.localeCompare(`${b.city}-${b.neighborhood ?? ""}`);
  });
}
