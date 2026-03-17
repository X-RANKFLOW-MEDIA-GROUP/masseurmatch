import { RouteError } from "@/app/api/_lib/http";

type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
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
