import { Redis } from "@upstash/redis";
import { RouteError } from "@/app/api/_lib/http";

type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

// Persistent Redis-backed rate limiting using Upstash
// Falls back to in-memory only in development when Redis is not configured
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

// In-memory fallback for development only
type RateLimitState = {
  count: number;
  resetAt: number;
};

const runtimeGlobal = globalThis as {
  __mmRateLimitStore?: Map<string, RateLimitState>;
};

function getRateLimitStore() {
  if (!runtimeGlobal.__mmRateLimitStore) {
    runtimeGlobal.__mmRateLimitStore = new Map<string, RateLimitState>();
  }
  return runtimeGlobal.__mmRateLimitStore;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "local";
  }

  return request.headers.get("x-real-ip") || "local";
}

/**
 * Redis-backed rate limiting with sliding window algorithm.
 * Persists across deployments and server restarts.
 * Falls back to in-memory in development when Redis is not configured.
 */
export async function assertRateLimitAsync(
  request: Request,
  bucket: string,
  options: RateLimitOptions = {},
) {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;
  const windowSec = Math.ceil(windowMs / 1000);
  const ip = getClientIp(request);
  const key = `ratelimit:${bucket}:${ip}`;

  if (redis) {
    // Use Redis for persistent rate limiting
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Use a sorted set for sliding window rate limiting
    const multi = redis.pipeline();
    // Remove old entries outside the window
    multi.zremrangebyscore(key, 0, windowStart);
    // Add current request
    multi.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    // Count requests in window
    multi.zcard(key);
    // Set expiry on the key
    multi.expire(key, windowSec + 1);
    
    const results = await multi.exec();
    const count = results[2] as number;

    if (count > limit) {
      throw new RouteError(429, "Too many requests. Please try again shortly.");
    }
    return;
  }

  // Fallback to in-memory for development
  if (process.env.NODE_ENV === "production") {
    console.warn("[security] Redis not configured - rate limiting is in-memory only!");
  }

  const now = Date.now();
  const store = getRateLimitStore();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (current.count >= limit) {
    throw new RouteError(429, "Too many requests. Please try again shortly.");
  }

  current.count += 1;
  store.set(key, current);
}

/**
 * Synchronous rate limiting (in-memory only).
 * @deprecated Use assertRateLimitAsync for production - this is kept for backward compatibility.
 */
export function assertRateLimit(
  request: Request,
  bucket: string,
  options: RateLimitOptions = {},
) {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const store = getRateLimitStore();
  const key = `${bucket}:${getClientIp(request)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (current.count >= limit) {
    throw new RouteError(429, "Too many requests. Please try again shortly.");
  }

  current.count += 1;
  store.set(key, current);
}

export function sanitizeText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeOptionalText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const cleaned = sanitizeText(value);
  return cleaned || null;
}

export function sanitizeStringArray(values: string[] | null | undefined) {
  if (!values?.length) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      values
        .map((value) => sanitizeText(value))
        .filter((value) => value.length > 0),
    ),
  );
}
