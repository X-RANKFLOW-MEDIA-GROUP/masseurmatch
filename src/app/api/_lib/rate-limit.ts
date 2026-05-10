import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

let redisClient: Redis | null | undefined;

function getRedis() {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function requestIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function memoryRateLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || now >= current.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (current.count >= max) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function isRateLimited(
  request: NextRequest,
  options: { keyPrefix: string; windowMs: number; max: number; userId?: string | null },
): Promise<boolean> {
  const actor = options.userId || requestIp(request);
  const key = `rl:${options.keyPrefix}:${actor}`;
  const redis = getRedis();

  if (!redis) {
    return memoryRateLimit(key, options.windowMs, options.max);
  }

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.pexpire(key, options.windowMs);
    }

    return count > options.max;
  } catch (error) {
    console.error("rate_limit_redis_failed", { keyPrefix: options.keyPrefix, error });
    return memoryRateLimit(key, options.windowMs, options.max);
  }
}

export function getRequestIp(request: NextRequest): string {
  return requestIp(request);
}
