import type { MetadataRoute } from "next";
import {
  buildCoreSitemapEntries,
  buildCitiesSitemapEntries,
  buildServicesSitemapEntries,
  buildNeighborhoodsSitemapEntries,
  buildProfilesSitemapEntries,
  buildGuidesSitemapEntries,
  buildBlogPostsSitemapEntries,
} from "@/app/_lib/seo-routes";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [cities, services, profiles, blogPosts, neighborhoods, guides] = await Promise.all([
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogPostsSitemapEntries(now),
    buildNeighborhoodsSitemapEntries(now),
    buildGuidesSitemapEntries(now),
  ]);

  const core = buildCoreSitemapEntries(now);
  const statesHub = [{ url: siteUrl("/states"), lastModified: now, changeFrequency: "weekly" as const, priority: 0.84 }];

  return [...core, ...statesHub, ...cities, ...services, ...neighborhoods, ...profiles, ...guides, ...blogPosts];
}
