import type { MetadataRoute } from "next";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { getCities, getPublicTherapists, getSitemapProfileSlugs } from "@/app/_lib/directory";
import {
  getKeywordSearchFilters,
  getSegmentSearchFilters,
  resolveDirectoryFilters,
} from "@/app/_lib/directory-taxonomy";
import {
  FIRST_30_URLS_IN_ORDER,
  getLaunchAreaPaths,
  getLaunchKeywordPaths,
  getLaunchSegmentPaths,
  isLaunchUrl,
} from "@/app/_lib/launch-urls";
import { buildCanonicalPath } from "@/app/_lib/route-normalization";
import { getSeoBlogPosts } from "@/app/_lib/seo-data";
import {
  buildCoreSitemapEntries,
  buildGuidesSitemapEntries,
  buildProfilesSitemapEntries,
  buildTourPagesSitemapEntries,
} from "@/app/_lib/seo-routes";
import { siteUrl } from "@/lib/site";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

// Publish a city as soon as it has one real, public profile. Empty markets stay
// excluded, while launch inventory can be discovered and indexed immediately.
export const SEO_CITY_MIN_PUBLIC_PROFILES = 1;

const PROFILE_LOOKUP_CHUNK_SIZE = 100;
const INVENTORY_DEPENDENT_HUB_PATHS = new Set(["/cities", "/near-me"]);
// /explore is served with X-Robots-Tag: noindex by middleware (all /explore/*
// filter pages are), so it must never appear in the sitemap even when city
// inventory exists — a sitemapped noindex URL fails live sitemap validation.
const INTENTIONALLY_NOINDEX_PATHS = new Set(["/therapist-agreement", "/explore"]);
const BLOCKED_PROFILE_SLUGS = new Set([
  "carlos-luis-pena-fd794a8e",
  "david-213c8e32",
  "kevinos-beaf90c6",
  "tamerat-molla-83ce3629",
]);
const PRIVATE_PROFILE_SLUG_PATTERNS = [
  /admin/i,
  /dev/i,
  /test/i,
  /staging/i,
  /masseurmatch-com/i,
  /support/i,
  /billing/i,
  /legal/i,
];

function isSafeProfileSlug(slug: string | null | undefined): slug is string {
  if (!slug || slug.length < 3) return false;
  if (slug.includes("@")) return false;
  if (BLOCKED_PROFILE_SLUGS.has(slug)) return false;
  if (PRIVATE_PROFILE_SLUG_PATTERNS.some((pattern) => pattern.test(slug))) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function toSitemapUrl(path: string): string {
  return siteUrl(buildCanonicalPath(path));
}

function buildEntry(
  path: string,
  changeFrequency: ChangeFrequency,
  priority: number,
  lastModified?: Date,
): SitemapEntry {
  return {
    url: toSitemapUrl(path),
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  };
}

function validDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function citySlugFromPath(path: string): string | null {
  return path.split("/").filter(Boolean)[0] ?? null;
}

function stripSyntheticLastModified(entry: SitemapEntry): SitemapEntry {
  return {
    url: entry.url,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  };
}

function dedupeSitemapEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const unique = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    const parsed = new URL(entry.url);
    parsed.hash = "";
    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    const key = parsed.toString();
    if (!unique.has(key)) unique.set(key, entry);
  }

  return [...unique.values()];
}

/**
 * Count only real database profiles already accepted by the same public-profile
 * query used by the profile route. Demo and fallback records never participate.
 * A database failure intentionally produces no local SEO entries.
 */
async function getSeoEligibleCityInventoryMap(): Promise<Map<string, number>> {
  try {
    const sitemapProfiles = await getSitemapProfileSlugs();
    const slugs = [...new Set(sitemapProfiles.map((row) => row.slug).filter(isSafeProfileSlug))];
    const inventory = new Map<string, number>();

    if (slugs.length === 0) return inventory;

    const supabase = createSupabaseAdminClient();

    for (let index = 0; index < slugs.length; index += PROFILE_LOOKUP_CHUNK_SIZE) {
      const chunk = slugs.slice(index, index + PROFILE_LOOKUP_CHUNK_SIZE);
      const { data, error } = await supabase
        .from("profiles")
        .select("slug, city")
        .in("slug", chunk)
        .not("city", "is", null);

      if (error) throw new Error(error.message);

      for (const row of data ?? []) {
        if (typeof row.city !== "string") continue;
        const key = row.city.trim().toLowerCase();
        if (!key) continue;
        inventory.set(key, (inventory.get(key) ?? 0) + 1);
      }
    }

    return inventory;
  } catch {
    return new Map<string, number>();
  }
}

function buildEligibleLocalEntries(inventory: Map<string, number>) {
  const eligibleCities = getCities().filter(
    (city) => (inventory.get(city.name.trim().toLowerCase()) ?? 0) >= SEO_CITY_MIN_PUBLIC_PROFILES,
  );
  const eligibleCitySlugs = new Set(eligibleCities.map((city) => city.slug));

  const cities: MetadataRoute.Sitemap = eligibleCities.map((city) =>
    buildEntry(`/${city.slug}`, "weekly", 0.7),
  );

  const launchSegmentPaths = new Set(getLaunchSegmentPaths());
  const launchKeywordPaths = new Set(getLaunchKeywordPaths());
  const servicePaths = FIRST_30_URLS_IN_ORDER.filter((path) => {
    const citySlug = citySlugFromPath(path);
    return Boolean(
      citySlug &&
        eligibleCitySlugs.has(citySlug) &&
        isLaunchUrl(path) &&
        (launchSegmentPaths.has(path) || launchKeywordPaths.has(path)),
    );
  });

  const neighborhoodPaths = getLaunchAreaPaths().filter((path) => {
    const citySlug = citySlugFromPath(path);
    return Boolean(citySlug && eligibleCitySlugs.has(citySlug) && isLaunchUrl(path));
  });

  return { eligibleCities, cities, servicePaths, neighborhoodPaths };
}

function formatAreaLabel(areaSlug: string) {
  return areaSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Launch pages render meta robots noindex when their own inventory query comes
// back empty — segment pages ([city]/[segment]), keyword pages
// ([city]/[segment]/[keyword]), and area pages ([city]/areas/[area]) each check
// their specific filters, not just city-level inventory. Mirror those exact
// queries here so the sitemap never lists a URL that serves noindex.
async function filterIndexableLaunchPaths(paths: string[]): Promise<string[]> {
  const cityBySlug = new Map(getCities().map((city) => [city.slug, city]));

  const checked = await Promise.all(
    paths.map(async (path) => {
      const parts = path.split("/").filter(Boolean);
      const city = cityBySlug.get(parts[0] ?? "");
      if (!city || parts.length < 2) return null;

      const filters =
        parts[1] === "areas" && parts[2]
          ? { keyword: formatAreaLabel(parts[2]) }
          : parts.length === 3
            ? resolveDirectoryFilters(getSegmentSearchFilters(parts[1]), getKeywordSearchFilters(parts[2]))
            : getSegmentSearchFilters(parts[1]);

      try {
        const { total } = await getPublicTherapists({
          city: city.name,
          page: 1,
          pageSize: 1,
          ...filters,
        });
        return total > 0 ? path : null;
      } catch {
        // Supabase unavailable — the page would render noindex, so stay out.
        return null;
      }
    }),
  );

  return checked.filter((path): path is string => path !== null);
}

async function buildPublishedBlogEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const posts = await getSeoBlogPosts();

  return posts.flatMap((post) => {
    const publishedAt = validDate(post.published_at);
    if (!publishedAt || publishedAt.getTime() > now.getTime()) return [];

    const updatedAt = validDate(post.updated_at);
    const lastModified = updatedAt && updatedAt.getTime() <= now.getTime() ? updatedAt : publishedAt;

    return [buildEntry(`/blog/${post.slug}`, "weekly", 0.65, lastModified)];
  });
}

export async function buildReleaseSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const [inventory, profiles, blogPosts, tourPages] = await Promise.all([
    getSeoEligibleCityInventoryMap(),
    buildProfilesSitemapEntries(now),
    buildPublishedBlogEntries(now),
    buildTourPagesSitemapEntries(now),
  ]);

  const local = buildEligibleLocalEntries(inventory);
  const [servicePaths, neighborhoodPaths] = await Promise.all([
    filterIndexableLaunchPaths(local.servicePaths),
    filterIndexableLaunchPaths(local.neighborhoodPaths),
  ]);
  const services = servicePaths.map((path) => buildEntry(path, "weekly", 0.66));
  const neighborhoods = neighborhoodPaths.map((path) => buildEntry(path, "weekly", 0.6));
  const hasEligibleCities = local.eligibleCities.length > 0;

  const core = buildCoreSitemapEntries(now)
    .filter((entry) => {
      const pathname = new URL(entry.url).pathname;
      if (INTENTIONALLY_NOINDEX_PATHS.has(pathname)) return false;
      return hasEligibleCities || !INVENTORY_DEPENDENT_HUB_PATHS.has(pathname);
    })
    .map(stripSyntheticLastModified);

  const conditionalHubs: MetadataRoute.Sitemap = [
    buildEntry("/verification", "monthly", 0.75),
    ...(hasEligibleCities ? [buildEntry("/states", "weekly", 0.78)] : []),
  ];

  return dedupeSitemapEntries([
    ...core,
    ...conditionalHubs,
    ...local.cities,
    ...services,
    ...neighborhoods,
    ...profiles,
    ...buildGuidesSitemapEntries(now),
    ...blogPosts,
    ...tourPages,
  ]);
}
