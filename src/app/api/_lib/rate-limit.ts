import type { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

function requestIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function isRateLimited(
  request: NextRequest,
  options: { keyPrefix: string; windowMs: number; max: number },
): boolean {
  const key = `${options.keyPrefix}:${requestIp(request)}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return false;
  }

  if (current.count >= options.max) {
    return true;
  }

  current.count += 1;
  return false;
}
