/**
 * Shared travel-schedule status logic, safe for both server (directory
 * queries) and client (therapist cards) use.
 *
 * A travel entry produces a "Visiting Now" state while today falls inside
 * its date range (end date inclusive), and a "Visiting Soon" state from up
 * to VISITING_LOOKAHEAD_DAYS ahead until one day prior to arrival — on the
 * start date itself it flips to "Visiting Now".
 */

export interface TravelEntry {
  city: string;
  state?: string | null;
  start_date: string;
  end_date: string;
}

export const VISITING_LOOKAHEAD_DAYS = 14;

export type TravelVisit = { status: "now" | "soon"; entry: TravelEntry };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns the active or soonest-upcoming visit from a travel schedule.
 * When `cityName` is given, only entries for that city are considered
 * (case-insensitive match). An active visit always wins over an upcoming one.
 */
export function getTravelVisit(
  schedule: TravelEntry[] | null | undefined,
  cityName?: string | null,
  nowMs: number = Date.now(),
): TravelVisit | null {
  if (!Array.isArray(schedule) || schedule.length === 0) return null;

  const cityKey = cityName?.trim().toLowerCase() || null;
  let soonest: TravelEntry | null = null;
  let soonestStart = Number.POSITIVE_INFINITY;

  for (const entry of schedule) {
    if (!entry || typeof entry.city !== "string" || !entry.city.trim() || !entry.start_date || !entry.end_date) continue;
    if (cityKey && entry.city.trim().toLowerCase() !== cityKey) continue;

    const start = Date.parse(entry.start_date);
    const end = Date.parse(entry.end_date);
    if (Number.isNaN(start) || Number.isNaN(end)) continue;

    // Date-only end dates parse to midnight; the visit lasts through that day.
    const endExclusive = end + DAY_MS;
    if (nowMs >= start && nowMs < endExclusive) {
      return { status: "now", entry };
    }
    if (nowMs < start && start - nowMs <= VISITING_LOOKAHEAD_DAYS * DAY_MS && start < soonestStart) {
      soonest = entry;
      soonestStart = start;
    }
  }

  return soonest ? { status: "soon", entry: soonest } : null;
}
