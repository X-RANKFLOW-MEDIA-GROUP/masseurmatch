import type { MetadataRoute } from "next";
import {
  buildCoreSitemapEntries,
  buildCitiesSitemapEntries,
  buildServicesSitemapEntries,
  buildNeighborhoodsSitemapEntries,
  buildProfilesSitemapEntries,
  buildGuidesSitemapEntries,
  buildBlogPostsSitemapEntries,
  buildCompetitorSitemapEntries,
} from "@/app/_lib/seo-routes";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [cities, services, neighborhoods, profiles, blogPosts, guides] = await Promise.all([
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildNeighborhoodsSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogPostsSitemapEntries(now),
    buildGuidesSitemapEntries(now),
  ]);
  const core = buildCoreSitemapEntries(now);
  const competitors = buildCompetitorSitemapEntries(now);

  return [...core, ...cities, ...services, ...neighborhoods, ...profiles, ...guides, ...blogPosts, ...competitors];
}
