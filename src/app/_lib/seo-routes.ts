import type { MetadataRoute } from "next";
import {
  FIRST_30_URLS_IN_ORDER,
  getLaunchAreaPaths,
  getLaunchCityPaths,
  getLaunchKeywordPaths,
  getLaunchSegmentPaths,
  isLaunchUrl,
} from "@/app/_lib/launch-urls";
import { GUIDES } from "@/app/guides/data";
import { absoluteUrl, getSeoBlogPosts, getSeoCities, getSeoTherapists, FEATURED_PROFILE_SLUGS } from "@/app/_lib/seo-data";
import { uniqueStrings } from "@/app/_lib/utils";
import { competitorSlugs } from "@/lib/competitors";
import { getCities, getCityInventoryMap, getPublicTherapists } from "@/app/_lib/directory";
import {
  getKeywordSearchFilters,
  getSegmentSearchFilters,
  resolveDirectoryFilters,
} from "@/app/_lib/directory-taxonomy";
import { buildCanonicalPath } from "@/app/_lib/route-normalization";

type StaticSitemapRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

export const SITEMAP_SEGMENT_IDS = [0, 1, 2, 3, 4, 5, 6] as const;

export const PRIVATE_ROBOTS_PATHS = uniqueStrings([
  "/admin",
  "/admin/",
  "/api",
  "/pro",
  "/pro/",
  "/login",
  "/register",
  "/forgot-password",
  "/dashboard",
  "/dashboard/",
  "/*?*token=",
  "/*?*redirect=",
]);

export const FILTER_ROBOTS_PATHS = [
  "/search?*",
  "/*?sort=*",
  "/*?verified=*",
  "/*?availability=*",
  "/*?radius=*",
  "/*?session=*",
  "/*?tag=*",
  "/*?modality=*",
  "/*?page=*",
];

export const SEARCH_ENGINE_BOTS = ["Googlebot", "Bingbot", "Yandex", "Baiduspider"];
export const SOCIAL_PREVIEW_BOTS = [
  "Twitterbot",
  "facebookexternalhit",
  "LinkedInBot",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
  "Slackbot",
  "Applebot",
];
export const AI_CRAWLER_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "Claude-Web",
  "Anthropic-AI",
  "Google-Extended",
  "PerplexityBot",
  "Bytespider",
  "cohere-ai",
];

const CORE_STATIC_ROUTES: StaticSitemapRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/therapists", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.76 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/advertise", changeFrequency: "monthly", priority: 0.7 },
  { path: "/for-therapists", changeFrequency: "weekly", priority: 0.7 },
  { path: "/safety", changeFrequency: "monthly", priority: 0.7 },
  { path: "/trust", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/legal", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/accessibility", changeFrequency: "monthly", priority: 0.4 },
  { path: "/community-guidelines", changeFrequency: "monthly", priority: 0.4 },
  { path: "/platform-disclaimer", changeFrequency: "monthly", priority: 0.4 },
  { path: "/cookie-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/therapist-agreement", changeFrequency: "monthly", priority: 0.4 },
  { path: "/compare", changeFrequency: "monthly", priority: 0.7 },
  ...competitorSlugs.map((slug) => ({
    path: `/compare/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
];

const ROUTABLE_CITY_SLUGS = new Set(getCities().map((city) => city.slug));
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

function isPublicProfileSlug(slug: string | null | undefined): slug is string {
  if (!slug || slug.length < 3) return false;
  if (slug.includes("@")) return false;
  if (slug.startsWith("admin-") || slug.startsWith("test-") || slug.startsWith("dev-")) return false;
  if (PRIVATE_PROFILE_SLUG_PATTERNS.some((pattern) => pattern.test(slug))) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function toSitemapUrl(path: string): string {
  return absoluteUrl(buildCanonicalPath(path));
}

function buildSitemapEntry(
  path: string,
  now: Date,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return { url: toSitemapUrl(path), lastModified: now, changeFrequency, priority };
}

function isRoutableCityPath(path: string): boolean {
  const [citySlug] = path.split("/").filter(Boolean);
  return citySlug ? ROUTABLE_CITY_SLUGS.has(citySlug) : false;
}

function cityNameBySlug(slug: string): string | null {
  const city = getCities().find((entry) => entry.slug === slug);
  return city?.name ?? null;
}

async function pathHasInventory(path: string): Promise<boolean> {
  const parts = path.split("/").filter(Boolean);
  const [citySlug, segmentSlug, keywordOrAreaSlug] = parts;
  if (!citySlug) return false;
  const cityName = cityNameBySlug(citySlug);
  if (!cityName) return false;

  if (parts.length === 1) {
    const { total } = await getPublicTherapists({ city: cityName, page: 1, pageSize: 1 });
    return total > 0;
  }

  if (parts.length === 2 && segmentSlug) {
    const { total } = await getPublicTherapists({ city: cityName, page: 1, pageSize: 1, ...getSegmentSearchFilters(segmentSlug) });
    return total > 0;
  }

  if (parts.length === 3 && segmentSlug === "areas") {
    const { total } = await getPublicTherapists({ city: cityName, page: 1, pageSize: 1 });
    return total > 0;
  }

  if (parts.length === 3 && segmentSlug && keywordOrAreaSlug) {
    const { total } = await getPublicTherapists({
      city: cityName,
      page: 1,
      pageSize: 1,
      ...resolveDirectoryFilters(getSegmentSearchFilters(segmentSlug), getKeywordSearchFilters(keywordOrAreaSlug)),
    });
    return total > 0;
  }

  return false;
}

export function buildRobotsRules(): MetadataRoute.Robots["rules"] {
  const searchEngineDisallow = uniqueStrings([...PRIVATE_ROBOTS_PATHS, ...FILTER_ROBOTS_PATHS]);
  return [
    { userAgent: SEARCH_ENGINE_BOTS, allow: "/", disallow: searchEngineDisallow },
    { userAgent: SOCIAL_PREVIEW_BOTS, allow: "/" },
    { userAgent: AI_CRAWLER_BOTS, allow: "/", disallow: PRIVATE_ROBOTS_PATHS },
    { userAgent: "*", allow: "/", disallow: searchEngineDisallow },
  ];
}

export function buildSitemapSegmentUrls(): string[] {
  return SITEMAP_SEGMENT_IDS.map((id) => absoluteUrl(`/sitemap/${id}.xml`));
}

export function buildCoreSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return CORE_STATIC_ROUTES.map((route) => buildSitemapEntry(route.path, now, route.changeFrequency, route.priority));
}

export async function buildCitiesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const dbCities = await getSeoCities();
  const inventoryMap = await getCityInventoryMap();

  if (dbCities.length > 0) {
    return dbCities
      .filter((city) => ROUTABLE_CITY_SLUGS.has(city.slug))
      .filter((city) => {
        const cityName = cityNameBySlug(city.slug);
        return cityName ? (inventoryMap.get(cityName.toLowerCase()) ?? 0) > 0 : false;
      })
      .map((city) => ({
        url: toSitemapUrl(`/${city.slug}`),
        lastModified: city.updated_at ? new Date(city.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: city.slug === "dallas" ? 0.8 : 0.7,
      }));
  }

  return getLaunchCityPaths()
    .filter((path) => isRoutableCityPath(path))
    .filter((path) => {
      const slug = path.split("/").filter(Boolean)[0];
      const cityName = slug ? cityNameBySlug(slug) : null;
      return cityName ? (inventoryMap.get(cityName.toLowerCase()) ?? 0) > 0 : false;
    })
    .map((path) => buildSitemapEntry(path, now, "weekly", path === "/dallas" ? 0.8 : 0.7));
}

export async function buildServicesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const launchSegmentPaths = new Set(getLaunchSegmentPaths());
  const launchKeywordPaths = new Set(getLaunchKeywordPaths());
  const orderedServicePaths = FIRST_30_URLS_IN_ORDER.filter(
    (path) => (launchSegmentPaths.has(path) || launchKeywordPaths.has(path)) && isRoutableCityPath(path) && isLaunchUrl(path),
  );
  const inventoryChecks = await Promise.all(orderedServicePaths.map(async (path) => ({ path, hasInventory: await pathHasInventory(path) })));
  return inventoryChecks
    .filter((entry) => entry.hasInventory)
    .map((entry) => buildSitemapEntry(entry.path, now, "weekly", entry.path.startsWith("/dallas") ? 0.72 : 0.66));
}

export async function buildNeighborhoodsSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const candidatePaths = getLaunchAreaPaths().filter((path) => isRoutableCityPath(path) && isLaunchUrl(path));
  const inventoryChecks = await Promise.all(candidatePaths.map(async (path) => ({ path, hasInventory: await pathHasInventory(path) })));
  return inventoryChecks.filter((entry) => entry.hasInventory).map((entry) => buildSitemapEntry(entry.path, now, "weekly", 0.6));
}

export async function buildProfilesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const therapistData = await getSeoTherapists();
  const featuredSet = new Set(FEATURED_PROFILE_SLUGS.filter(isPublicProfileSlug));
  return therapistData
    .filter((therapist) => isPublicProfileSlug(therapist.slug))
    .map((therapist) => ({
      url: toSitemapUrl(`/therapists/${therapist.slug}`),
      lastModified: therapist.updated_at ? new Date(therapist.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: featuredSet.has(therapist.slug) ? 0.9 : 0.7,
    }));
}

export function buildGuidesSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return GUIDES.map((guide) => ({
    url: toSitemapUrl(`/guides/${guide.slug}`),
    lastModified: new Date(guide.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}

export async function buildBlogPostsSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const dbPosts = await getSeoBlogPosts();
  return dbPosts.map((post) => ({
    url: toSitemapUrl(`/blog/${post.slug}`),
    lastModified: post.updated_at ? new Date(post.updated_at) : post.published_at ? new Date(post.published_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));
}

/** @deprecated Use buildCoreSitemapEntries. */
export function buildStaticSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return buildCoreSitemapEntries(now);
}

/** @deprecated Used by scripts; prefer the segmented sitemap.ts. */
export async function buildSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const [core, cities, services, profiles] = await Promise.all([
    buildCoreSitemapEntries(now),
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildProfilesSitemapEntries(now),
  ]);
  const neighborhoods = await buildNeighborhoodsSitemapEntries(now);
  const guides = buildGuidesSitemapEntries(now);
  return [...core, ...cities, ...services, ...neighborhoods, ...profiles, ...guides];
}

export function buildLaunchOrderList(): string[] {
  return [...FIRST_30_URLS_IN_ORDER];
}

/** @deprecated Use buildServicesSitemapEntries. */
export async function buildServicesCitySitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  return buildServicesSitemapEntries(now);
}

/** @deprecated Use buildNeighborhoodsSitemapEntries. */
export async function buildKeywordsSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  return buildNeighborhoodsSitemapEntries(now);
}

/** @deprecated Use buildGuidesSitemapEntries. */
export function buildBlogSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return buildGuidesSitemapEntries(now);
}
