import { RouteError } from "@/app/api/_lib/http";
import { getClientIp } from "@/app/_lib/security";

interface BruteForceState {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const MEMORY_STORE = new Map<string, BruteForceState>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getKey(email: string, ip: string): string {
  return `bf:${email.toLowerCase()}:${ip}`;
}

export function checkBruteForce(email: string, request: Request): { isLocked: boolean; remainingTime: number } {
  const ip = getClientIp(request);
  const key = getKey(email, ip);
  const now = Date.now();
  const state = MEMORY_STORE.get(key);

  if (!state) {
    return { isLocked: false, remainingTime: 0 };
  }

  // Reset if window has passed
  if (now - state.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    MEMORY_STORE.delete(key);
    return { isLocked: false, remainingTime: 0 };
  }

  // Check if currently locked
  if (state.lockedUntil && now < state.lockedUntil) {
    const remainingTime = state.lockedUntil - now;
    return { isLocked: true, remainingTime };
  }

  // Clear expired lock
  if (state.lockedUntil && now >= state.lockedUntil) {
    MEMORY_STORE.delete(key);
    return { isLocked: false, remainingTime: 0 };
  }

  return { isLocked: false, remainingTime: 0 };
}

export function recordFailedAttempt(email: string, request: Request): void {
  const ip = getClientIp(request);
  const key = getKey(email, ip);
  const now = Date.now();
  const state = MEMORY_STORE.get(key);

  if (!state) {
    MEMORY_STORE.set(key, {
      attempts: 1,
      firstAttemptAt: now,
    });
    return;
  }

  // Reset if window has passed
  if (now - state.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    MEMORY_STORE.set(key, {
      attempts: 1,
      firstAttemptAt: now,
    });
    return;
  }

  state.attempts += 1;

  // Lock account after too many attempts
  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  MEMORY_STORE.set(key, state);
}

export function clearFailedAttempts(email: string, request: Request): void {
  const ip = getClientIp(request);
  const key = getKey(email, ip);
  MEMORY_STORE.delete(key);
}

export function assertNotBruteForceLocked(email: string, request: Request): void {
  const { isLocked, remainingTime } = checkBruteForce(email, request);

  if (isLocked) {
    const minutes = Math.ceil(remainingTime / 1000 / 60);
    throw new RouteError(
      429,
      `Too many failed attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      "ACCOUNT_TEMPORARILY_LOCKED"
    );
  }
}
