import { NextResponse } from "next/server";
import {
  EXPLORE_PAGE_SIZE,
  exploreFiltersToUrl,
  loadExploreProviders,
  parseExploreSearchParams,
  serializeExploreProvider,
} from "@/app/_lib/explore";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const CACHE_TTL_MS = 30_000;

type CachedProvidersResult = Awaited<ReturnType<typeof loadExploreProviders>>;

const providersCache = new Map<
  string,
  {
    expiresAt: number;
    result: CachedProvidersResult;
  }
>();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseExploreSearchParams(
    Object.fromEntries(url.searchParams.entries()),
  );
  const page = clamp(Number(url.searchParams.get("page") || "1") || 1, 1, 100);
  const pageSize = clamp(
    Number(url.searchParams.get("pageSize") || String(EXPLORE_PAGE_SIZE)) || EXPLORE_PAGE_SIZE,
    1,
    60,
  );
  const cacheKey = exploreFiltersToUrl(filters);
  const cached = providersCache.get(cacheKey);
  const now = Date.now();
  const cacheHit = Boolean(cached && cached.expiresAt > now);
  const result =
    cacheHit && cached
      ? cached.result
      : await loadExploreProviders(filters);

  if (!cacheHit) {
    providersCache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      result,
    });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize;

  return NextResponse.json({
    ok: true,
    items: result.slice(from, to).map(serializeExploreProvider),
    total: result.length,
    page,
    pageSize,
    hasMore: to < result.length,
    filters,
    meta: {
      cache_hit: cacheHit,
    },
  }, {
    headers: {
      "Cache-Control": "private, max-age=0, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
