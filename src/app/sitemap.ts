import type { MetadataRoute } from "next";
import {
  buildCoreSitemapEntries,
  buildCitiesSitemapEntries,
  buildServicesSitemapEntries,
  buildNeighborhoodsSitemapEntries,
  buildProfilesSitemapEntries,
  buildGuidesSitemapEntries,
  buildBlogPostsSitemapEntries,
  buildTourPagesSitemapEntries,
} from "@/app/_lib/seo-routes";
import { getAllCities } from "@/lib/get-city";
import { siteUrl } from "@/lib/site";

// Regenerate sitemap every hour so new profiles and city pages appear promptly
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [cities, services, profiles, blogPosts, neighborhoods, guides, tourPages] = await Promise.all([
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogPostsSitemapEntries(now),
    buildNeighborhoodsSitemapEntries(now),
    buildGuidesSitemapEntries(now),
    buildTourPagesSitemapEntries(now),
  ]);

  const core = buildCoreSitemapEntries(now);

  // Provider signup landing pages (/providers/[citySlug]) — surfaced so the
  // pre-rendered per-city SEO pages are discoverable by crawlers.
  const providerLandingPages: MetadataRoute.Sitemap = getAllCities().map((city) => ({
    url: siteUrl(`/providers/${city.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // High-priority hub pages
  const hubs: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: siteUrl("/therapists"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: siteUrl("/explore"), lastModified: now, changeFrequency: "daily", priority: 0.93 },
    { url: siteUrl("/near-me"), lastModified: now, changeFrequency: "daily", priority: 0.90 },
    { url: siteUrl("/states"), lastModified: now, changeFrequency: "weekly", priority: 0.88 },
    { url: siteUrl("/how-it-works"), lastModified: now, changeFrequency: "monthly", priority: 0.80 },
    { url: siteUrl("/how-ranking-works"), lastModified: now, changeFrequency: "monthly", priority: 0.72 },
    { url: siteUrl("/trust"), lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: siteUrl("/verification"), lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: siteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.70 },
    { url: siteUrl("/pricing"), lastModified: now, changeFrequency: "monthly", priority: 0.70 },
    { url: siteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.80 },
    { url: siteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.60 },
  ];

  return [
    ...hubs,
    ...core,
    ...providerLandingPages,
    ...cities,
    ...services,
    ...neighborhoods,
    ...profiles,
    ...guides,
    ...blogPosts,
    ...tourPages,
  ];
}
