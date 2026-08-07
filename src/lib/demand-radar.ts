export type DemandTrend = "rising" | "stable" | "falling";

export function getDemandLabel(score: number): string {
  if (score >= 85) return "Very high";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function getOpportunityScore(input: {
  score: number;
  competition_index: number;
}): number {
  const lowCompetition = 100 - input.competition_index;
  return Math.round(input.score * 0.8 + lowCompetition * 0.2);
}
