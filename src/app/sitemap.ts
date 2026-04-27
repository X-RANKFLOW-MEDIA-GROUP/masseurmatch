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

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [cities, services, profiles, blogPosts, neighborhoods, guides] = await Promise.all([
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildNeighborhoodsSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogPostsSitemapEntries(now),
    buildNeighborhoodsSitemapEntries(now),
    buildGuidesSitemapEntries(now),
  ]);
  const core = buildCoreSitemapEntries(now);

  return [...core, ...cities, ...services, ...neighborhoods, ...profiles, ...guides, ...blogPosts];
}
