import type { MetadataRoute } from "next";
import {
  FIRST_30_URLS_IN_ORDER,
  getLaunchAreaPaths,
  getLaunchCityPaths,
  getLaunchKeywordPaths,
  getLaunchSegmentPaths,
} from "@/app/_lib/launch-urls";
import { GUIDES } from "@/app/guides/data";
import { appUrl } from "@/app/_lib/metadata";
import { absoluteUrl, FEATURED_PROFILE_SLUGS, getSeoBlogPosts, getSeoCities, getSeoTherapists } from "@/app/_lib/seo-data";
import { uniqueStrings } from "@/app/_lib/utils";
import { competitorSlugs } from "@/lib/competitors";

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

/**
 * Query-parameter patterns that generate near-infinite faceted navigation
 * duplicates with no unique indexable content. Blocking these prevents crawl
 * budget waste on filter variants. Canonical SEO landers live at
 * /{city}/{segment-or-service} paths — not at parameterised /search URLs.
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
 * Programmatic SEO targets use /{city}/{segment-or-service} paths.
 */
const CORE_STATIC_ROUTES: StaticSitemapRoute[] = [
  { path: "/",                    changeFrequency: "daily",   priority: 1.0 },
  { path: "/therapists",          changeFrequency: "daily",   priority: 0.9 },
  { path: "/blog",                changeFrequency: "weekly",  priority: 0.8 },
  { path: "/guides",              changeFrequency: "weekly",  priority: 0.76 },
  { path: "/pricing",             changeFrequency: "monthly", priority: 0.7 },
  { path: "/how-it-works",        changeFrequency: "monthly", priority: 0.7 },
  { path: "/about",               changeFrequency: "monthly", priority: 0.7 },
  { path: "/advertise",           changeFrequency: "monthly", priority: 0.7 },
  { path: "/for-therapists",      changeFrequency: "weekly",  priority: 0.7 },
  { path: "/safety",              changeFrequency: "monthly", priority: 0.7 },
  { path: "/trust",               changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact",             changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq",                 changeFrequency: "monthly", priority: 0.6 },
  { path: "/legal",               changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy",             changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms",               changeFrequency: "monthly", priority: 0.5 },
  { path: "/accessibility",       changeFrequency: "monthly", priority: 0.4 },
  { path: "/community-guidelines", changeFrequency: "monthly", priority: 0.4 },
  { path: "/platform-disclaimer",  changeFrequency: "monthly", priority: 0.4 },
  { path: "/cookie-policy",       changeFrequency: "monthly", priority: 0.4 },
  { path: "/therapist-agreement", changeFrequency: "monthly", priority: 0.4 },
  { path: "/compare",            changeFrequency: "monthly", priority: 0.7 },
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

export function buildSitemapSegmentUrls(): string[] {
  return SITEMAP_SEGMENT_IDS.map((id) => absoluteUrl(`/sitemap/${id}.xml`));
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

// ─── City sitemap (dynamic from Supabase with fallback to static list) ────────
export async function buildCitiesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const dbCities = await getSeoCities();

  if (dbCities.length > 0) {
    return dbCities.map((city) => ({
      url: absoluteUrl(`/${city.slug}`),
      lastModified: city.updated_at ? new Date(city.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: city.slug === "dallas" ? 0.8 : 0.7,
    }));
  }

  return getLaunchCityPaths().map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/dallas" ? 0.8 : 0.7,
  }));
}

// ─── Service-in-city sitemap (city + segment, inventory-gated) ────────────────
export async function buildServicesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const launchSegmentPaths = new Set(getLaunchSegmentPaths());
  const launchKeywordPaths = new Set(getLaunchKeywordPaths());
  const orderedServicePaths = FIRST_30_URLS_IN_ORDER.filter(
    (path) => launchSegmentPaths.has(path) || launchKeywordPaths.has(path),
  );
  return orderedServicePaths.map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path.startsWith("/dallas") ? 0.72 : 0.66,
  }));
}

export function buildNeighborhoodsSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return getLaunchAreaPaths().map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

// ─── Profiles sitemap (only profiles with stable slugs) ──────────────────────
export async function buildProfilesSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const therapistData = await getSeoTherapists();
  const featuredSet = new Set(FEATURED_PROFILE_SLUGS);
  return therapistData
    .filter((therapist) => therapist.slug)
    .map((therapist) => ({
      url: absoluteUrl(`/therapists/${therapist.slug}`),
      lastModified: therapist.updated_at ? new Date(therapist.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: featuredSet.has(therapist.slug!) ? 0.9 : 0.7,
    }));
}

// ─── Guides sitemap ───────────────────────────────────────────────────────────
export function buildGuidesSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return GUIDES.map((guide) => ({
    url: `${appUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}

// ─── Blog posts sitemap (dynamic from Supabase) ──────────────────────────────
export async function buildBlogPostsSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const dbPosts = await getSeoBlogPosts();
  return dbPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated_at ? new Date(post.updated_at) : post.published_at ? new Date(post.published_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));
}

// ─── Legacy exports (backward-compatible) ────────────────────────────────────
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
  const neighborhoods = buildNeighborhoodsSitemapEntries(now);
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
