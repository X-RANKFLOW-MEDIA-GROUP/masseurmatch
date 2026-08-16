export type ImessageBridgeStatus = "online" | "degraded" | "offline";

export type ImessageBridgeHealthInput = {
  last_seen_at: string | null;
  last_cycle_at: string | null;
  last_error_at: string | null;
};

const DEFAULT_STALE_AFTER_MS = 90_000;

function timestamp(value: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getImessageBridgeStatus(
  input: ImessageBridgeHealthInput,
  nowMs = Date.now(),
  staleAfterMs = DEFAULT_STALE_AFTER_MS,
): ImessageBridgeStatus {
  const lastSeen = timestamp(input.last_seen_at);
  if (lastSeen === null || nowMs - lastSeen > staleAfterMs) return "offline";

  const lastError = timestamp(input.last_error_at);
  const lastCycle = timestamp(input.last_cycle_at);
  if (lastError !== null && (lastCycle === null || lastError > lastCycle)) return "degraded";

  return "online";
}
