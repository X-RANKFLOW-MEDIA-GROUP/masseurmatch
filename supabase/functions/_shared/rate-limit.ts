/**
 * In-memory sliding-window rate limiter for Supabase Edge Functions.
 *
 * Each function gets its own instance. State lives in the isolate —
 * when the isolate is recycled the counters reset, which is acceptable
 * because Edge Functions are short-lived. For persistent cross-instance
 * limiting you would need a Redis / Upstash store.
 */

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

/** Remove entries older than `windowMs` and return current count. */
function pruneAndCount(entry: WindowEntry, windowMs: number): number {
  const cutoff = Date.now() - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  return entry.timestamps.length;
}

export interface RateLimitOptions {
  /** Maximum requests per window. Default: 30 */
  limit?: number;
  /** Window duration in milliseconds. Default: 60_000 (1 min) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check whether `key` (typically IP or user-id) is within the rate limit.
 * If allowed, the request is counted; if not, it is rejected without counting.
 */
export function checkRateLimit(
  key: string,
  opts: RateLimitOptions = {},
): RateLimitResult {
  const limit = opts.limit ?? 30;
  const windowMs = opts.windowMs ?? 60_000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  const current = pruneAndCount(entry, windowMs);

  if (current >= limit) {
    const oldest = entry.timestamps[0] ?? Date.now();
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldest + windowMs - Date.now(),
    };
  }

  entry.timestamps.push(Date.now());

  return {
    allowed: true,
    remaining: limit - current - 1,
    resetMs: windowMs,
  };
}

/**
 * Return 429 JSON response with standard rate-limit headers.
 */
export function rateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string> = {}): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(result.resetMs / 1000)),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

/**
 * Extract a client identifier from the request.
 * Prefers X-Forwarded-For (set by Supabase API Gateway), falls back to
 * X-Real-Ip, then a generic key.
 */
export function getClientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

/** Periodic cleanup of stale entries to avoid unbounded memory growth. */
const CLEANUP_INTERVAL = 5 * 60_000;
setInterval(() => {
  const cutoff = Date.now() - 5 * 60_000;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);
