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
  const [cities, services, profiles, blogPosts] = await Promise.all([
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogPostsSitemapEntries(now),
  ]);
  const core = buildCoreSitemapEntries(now);
  const neighborhoods = buildNeighborhoodsSitemapEntries(now);
  const guides = buildGuidesSitemapEntries(now);

  return [...core, ...cities, ...services, ...neighborhoods, ...profiles, ...guides, ...blogPosts];
}
