import { envAny } from "@/app/api/_lib/env";
import type {
  KnottyCandidate,
  KnottyIntent,
  KnottyLearningRow,
} from "@/lib/knotty/types";

const LEARNING_THRESHOLD = 30;

export function isKnottyLearningEnabled() {
  return envAny(["KNOTTY_LEARNING_ENABLED"], "").toLowerCase() === "true";
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function hashSessionToPercent(sessionId: string) {
  let hash = 0;

  for (let index = 0; index < sessionId.length; index += 1) {
    hash = (hash * 31 + sessionId.charCodeAt(index)) >>> 0;
  }

  return hash % 100;
}

export function isExplorationSession(sessionId: string) {
  return hashSessionToPercent(sessionId) < 10;
}

export function normalizeLearningScore(row: KnottyLearningRow | null | undefined) {
  if (!row || row.impressions < LEARNING_THRESHOLD) {
    return 0;
  }

  return clamp(Number(row.weighted_score) || 0);
}

export function getExplorationScore(
  candidate: KnottyCandidate,
  learningRow: KnottyLearningRow | null | undefined,
  sessionId: string,
) {
  if (!isKnottyLearningEnabled() || !isExplorationSession(sessionId)) {
    return 0;
  }

  const impressions = learningRow?.impressions ?? 0;
  if (impressions >= LEARNING_THRESHOLD) {
    return 0;
  }

  if (!candidate.slug) {
    return 0;
  }

  return clamp((LEARNING_THRESHOLD - impressions) / LEARNING_THRESHOLD);
}

function pickBestLearningRow(
  rows: KnottyLearningRow[],
  city: string | null,
  intent: KnottyIntent,
) {
  const normalizedCity = city?.trim() || "__all__";
  const rank = (row: KnottyLearningRow) => {
    const cityExact = row.city === normalizedCity ? 4 : row.city === "__all__" ? 2 : 0;
    const intentExact = row.intent === intent ? 2 : row.intent === "general" ? 1 : 0;
    return cityExact + intentExact;
  };

  return [...rows].sort((left, right) => rank(right) - rank(left))[0] || null;
}

export async function loadLearningScores(
  adminClient: any,
  therapistIds: string[],
  city: string | null,
  intent: KnottyIntent,
) {
  if (!therapistIds.length) {
    return new Map<string, KnottyLearningRow | null>();
  }

  const normalizedCity = city?.trim() || "__all__";
  const { data, error } = await adminClient
    .from("therapist_learning_scores")
    .select(
      "therapist_id, city, intent, impressions, profile_clicks, contact_clicks, ctr, contact_rate, intent_conversion_rate, score_7d, score_30d, weighted_score, updated_at",
    )
    .in("therapist_id", therapistIds)
    .in("city", [normalizedCity, "__all__"])
    .in("intent", [intent, "general"]);

  const rows = error ? [] : ((data || []) as KnottyLearningRow[]);
  const grouped = new Map<string, KnottyLearningRow[]>();

  for (const row of rows) {
    const bucket = grouped.get(row.therapist_id) || [];
    bucket.push(row);
    grouped.set(row.therapist_id, bucket);
  }

  const output = new Map<string, KnottyLearningRow | null>();
  for (const therapistId of therapistIds) {
    output.set(therapistId, pickBestLearningRow(grouped.get(therapistId) || [], city, intent));
  }

  return output;
}
