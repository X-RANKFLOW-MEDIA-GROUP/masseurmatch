import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/app/blog/posts";
import { DIRECTORY_SEGMENTS, SPECIALTY_KEYWORDS } from "@/app/_lib/directory-taxonomy";
import { getCities, getCityInventoryMap, getPublicTherapists } from "@/app/_lib/directory";
import { appUrl } from "@/app/_lib/metadata";
import { competitorSlugs } from "@/lib/competitors";
import { uniqueStrings } from "@/app/_lib/utils";

type StaticSitemapRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

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

/**
 * Query-parameter patterns that generate near-infinite faceted navigation
 * duplicates with no unique indexable content. Blocking these prevents crawl
 * budget waste on filter variants. Canonical SEO landers live at
 * /{city}/{service} paths — not at parameterised /search URLs.
 */
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

/**
 * Core canonical pages for the sitemap.
 * /search excluded: live filter hub, not a canonical SEO lander.
 * /chat excluded: AI tool, not a crawlable landing page.
 * Programmatic SEO targets use /{city}/{service} paths.
 */
const CORE_STATIC_ROUTES: StaticSitemapRoute[] = [
  { path: "/",                    changeFrequency: "daily",   priority: 1.0 },
  { path: "/therapists",          changeFrequency: "daily",   priority: 0.9 },
  { path: "/blog",                changeFrequency: "weekly",  priority: 0.8 },
  { path: "/pricing",             changeFrequency: "monthly", priority: 0.7 },
  { path: "/about",               changeFrequency: "monthly", priority: 0.7 },
  { path: "/advertise",           changeFrequency: "monthly", priority: 0.7 },
  { path: "/safety",              changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact",             changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy",             changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms",               changeFrequency: "monthly", priority: 0.5 },
  { path: "/cookie-policy",       changeFrequency: "monthly", priority: 0.4 },
  { path: "/therapist-agreement", changeFrequency: "monthly", priority: 0.4 },
  { path: "/compare",             changeFrequency: "monthly", priority: 0.7 },
  ...competitorSlugs.map((slug) => ({
    path: `/compare/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
];

export function buildRobotsRules(): MetadataRoute.Robots["rules"] {
  const searchEngineDisallow = uniqueStrings([...PRIVATE_ROBOTS_PATHS, ...FILTER_ROBOTS_PATHS]);
  return [
    {
      userAgent: SEARCH_ENGINE_BOTS,
      allow: "/",
      disallow: searchEngineDisallow,
    },
    {
      userAgent: SOCIAL_PREVIEW_BOTS,
      allow: "/",
    },
    {
      userAgent: AI_CRAWLER_BOTS,
      allow: "/",
      disallow: PRIVATE_ROBOTS_PATHS,
    },
    {
      userAgent: "*",
      allow: "/",
      disallow: searchEngineDisallow,
    },
  ];
}

// ─── Core sitemap (stable canonical pages) ────────────────────────────────────
export function buildCoreSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return CORE_STATIC_ROUTES.map((route) => ({
    url: `${appUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

// ─── City sitemap (only cities with real inventory) ───────────────────────────
export async function buildCitiesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const cityMap = await getCityInventoryMap();
  return getCities()
    .filter((city) => (cityMap.get(city.name.toLowerCase()) ?? 0) > 0)
    .map((city) => ({
      url: `${appUrl}/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
}

// ─── Service-in-city sitemap (city + segment, inventory-gated) ────────────────
export async function buildServicesCitySitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const cityMap = await getCityInventoryMap();
  const activeCities = getCities().filter(
    (city) => (cityMap.get(city.name.toLowerCase()) ?? 0) > 0,
  );
  return activeCities.flatMap((city) =>
    DIRECTORY_SEGMENTS.map((segment) => ({
      url: `${appUrl}/${city.slug}/${segment.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );
}

// ─── Keyword sitemap (city + segment + keyword, inventory-gated) ──────────────
export async function buildKeywordsSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const cityMap = await getCityInventoryMap();
  const activeCities = getCities().filter(
    (city) => (cityMap.get(city.name.toLowerCase()) ?? 0) > 0,
  );
  return activeCities.flatMap((city) =>
    DIRECTORY_SEGMENTS.flatMap((segment) =>
      SPECIALTY_KEYWORDS.map((keyword) => ({
        url: `${appUrl}/${city.slug}/${segment.slug}/${keyword.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ),
  );
}

// ─── Profiles sitemap (only profiles with stable slugs) ──────────────────────
export async function buildProfilesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const therapistData = await getPublicTherapists({ page: 1, pageSize: 500 });
  return therapistData.items
    .filter((t) => t.slug)
    .map((therapist) => ({
      url: `${appUrl}/therapists/${therapist.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
}

// ─── Blog sitemap ─────────────────────────────────────────────────────────────
export function buildBlogSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return BLOG_POSTS.map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}

// ─── Legacy exports (backward-compatible) ────────────────────────────────────
/** @deprecated Use buildCoreSitemapEntries. */
export function buildStaticSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return buildCoreSitemapEntries(now);
}

/** @deprecated Used by scripts; prefer the segmented sitemap.ts. */
export async function buildSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const [core, cities, services, keywords, profiles, blog] = await Promise.all([
    buildCoreSitemapEntries(now),
    buildCitiesSitemapEntries(now),
    buildServicesCitySitemapEntries(now),
    buildKeywordsSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogSitemapEntries(now),
  ]);
  return [...core, ...cities, ...services, ...keywords, ...profiles, ...blog];
}
