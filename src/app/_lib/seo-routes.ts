import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/app/blog/posts";
import { DIRECTORY_SEGMENTS, SPECIALTY_KEYWORDS } from "@/app/_lib/directory-taxonomy";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { appUrl } from "@/app/_lib/metadata";
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

const STATIC_SITEMAP_ROUTES: StaticSitemapRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/search", changeFrequency: "daily", priority: 0.9 },
  { path: "/therapists", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/advertise", changeFrequency: "monthly", priority: 0.7 },
  { path: "/chat", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/safety", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/cookie-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/therapist-agreement", changeFrequency: "monthly", priority: 0.4 },
];

export function buildRobotsRules(): MetadataRoute.Robots["rules"] {
  return [
    {
      userAgent: SEARCH_ENGINE_BOTS,
      allow: "/",
      disallow: PRIVATE_ROBOTS_PATHS,
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
      disallow: PRIVATE_ROBOTS_PATHS,
    },
  ];
}

export function buildStaticSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  return STATIC_SITEMAP_ROUTES.map((route) => ({
    url: `${appUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

export async function buildSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const cities = getCities();
  const therapistData = await getPublicTherapists({ page: 1, pageSize: 500 });

  const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${appUrl}/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const segmentRoutes: MetadataRoute.Sitemap = cities.flatMap((city) =>
    DIRECTORY_SEGMENTS.map((segment) => ({
      url: `${appUrl}/${city.slug}/${segment.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const keywordRoutes: MetadataRoute.Sitemap = cities.flatMap((city) =>
    DIRECTORY_SEGMENTS.flatMap((segment) =>
      SPECIALTY_KEYWORDS.map((keyword) => ({
        url: `${appUrl}/${city.slug}/${segment.slug}/${keyword.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ),
  );

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const therapistRoutes: MetadataRoute.Sitemap = therapistData.items.map((therapist) => ({
    url: `${appUrl}/therapists/${therapist.slug || therapist.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...buildStaticSitemapEntries(now),
    ...cityRoutes,
    ...segmentRoutes,
    ...keywordRoutes,
    ...blogRoutes,
    ...therapistRoutes,
  ];
}
