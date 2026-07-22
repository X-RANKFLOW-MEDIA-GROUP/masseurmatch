export type ProviderTier = "free" | "standard" | "pro" | "elite";

export const MAX_RATE_PER_MINUTE = 3.33;

export const AVAILABLE_NOW_RULES: Record<ProviderTier, { durationMinutes: number; activationsPerDay: number | null }> = {
  free: { durationMinutes: 30, activationsPerDay: 3 },
  standard: { durationMinutes: 60, activationsPerDay: null },
  pro: { durationMinutes: 120, activationsPerDay: null },
  elite: { durationMinutes: 120, activationsPerDay: null },
};

// Included travel destinations per calendar month. null means unlimited.
export const TRAVEL_DESTINATION_LIMITS: Record<ProviderTier, number | null> = {
  free: 1,
  standard: 3,
  pro: null,
  elite: null,
};

export function normalizeProviderTier(value: string | null | undefined): ProviderTier {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "standard" || normalized === "pro" || normalized === "elite") {
    return normalized;
  }
  return "free";
}

export function maximumRateForMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return Math.floor(minutes * MAX_RATE_PER_MINUTE * 100) / 100;
}

export function isRateWithinLimit(minutes: number, rate: number | null | undefined): boolean {
  if (rate === null || rate === undefined) return true;
  if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(minutes) || minutes <= 0) return false;
  return rate / minutes <= MAX_RATE_PER_MINUTE + Number.EPSILON;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}
