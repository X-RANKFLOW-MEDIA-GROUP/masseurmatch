import { NextResponse } from "next/server";
import {
  exploreFiltersToUrl,
  loadExploreProviders,
  parseExploreSearchParams,
  serializeExploreProvider,
} from "@/app/_lib/explore";

const CACHE_TTL_MS = 20_000;

type CachedSwipeFeedResult = Awaited<ReturnType<typeof loadExploreProviders>>;

const swipeFeedCache = new Map<
  string,
  {
    expiresAt: number;
    result: CachedSwipeFeedResult;
  }
>();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseExploreSearchParams(
    Object.fromEntries(url.searchParams.entries()),
  );
  const exclude = new Set(
    (url.searchParams.get("exclude") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "12") || 12, 1), 30);
  const cacheKey = exploreFiltersToUrl(filters);
  const cached = swipeFeedCache.get(cacheKey);
  const now = Date.now();
  const cacheHit = Boolean(cached && cached.expiresAt > now);
  const result =
    cacheHit && cached
      ? cached.result
      : await loadExploreProviders(filters);

  if (!cacheHit) {
    swipeFeedCache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      result,
    });
  }

  const items = result
    .filter((provider) => !exclude.has(provider.id))
    .slice(0, limit);

  return NextResponse.json({
    ok: true,
    items: items.map(serializeExploreProvider),
    total: items.length,
    filters,
    meta: {
      cache_hit: cacheHit,
    },
  }, {
    headers: {
      "Cache-Control": "private, max-age=0, s-maxage=20, stale-while-revalidate=60",
    },
  });
}
