import type { MetadataRoute } from "next";
import {
  SITEMAP_SEGMENT_IDS,
  buildCoreSitemapEntries,
  buildCitiesSitemapEntries,
  buildServicesSitemapEntries,
  buildNeighborhoodsSitemapEntries,
  buildProfilesSitemapEntries,
  buildGuidesSitemapEntries,
  buildBlogPostsSitemapEntries,
} from "@/app/_lib/seo-routes";

export const revalidate = 3600;

/**
 * Segmented sitemap entries served by Next.js at /sitemap/[id].xml.
 * A dedicated index is exposed from src/app/sitemap.xml/route.ts.
 */
export async function generateSitemaps() {
  return SITEMAP_SEGMENT_IDS.map((id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  switch (id) {
    case 0: return buildCoreSitemapEntries(now);
    case 1: return buildCitiesSitemapEntries(now);
    case 2: return buildServicesSitemapEntries(now);
    case 3: return buildNeighborhoodsSitemapEntries(now);
    case 4: return buildProfilesSitemapEntries(now);
    case 5: return buildGuidesSitemapEntries(now);
    case 6: return buildBlogPostsSitemapEntries(now);
    default: return [];
  }
}
