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

  // High-priority hub pages
  const hubs: MetadataRoute.Sitemap = [
    { url: siteUrl("/states"), lastModified: now, changeFrequency: "weekly", priority: 0.84 },
    { url: siteUrl("/near-me"), lastModified: now, changeFrequency: "daily", priority: 0.87 },
    { url: siteUrl("/therapists"), lastModified: now, changeFrequency: "daily", priority: 0.92 },
  ];

  return [
    ...core,
    ...hubs,
    ...cities,
    ...services,
    ...neighborhoods,
    ...profiles,
    ...guides,
    ...blogPosts,
    ...tourPages,
  ];
}
