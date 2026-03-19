import type { MetadataRoute } from "next";
import {
  buildCoreSitemapEntries,
  buildCitiesSitemapEntries,
  buildServicesCitySitemapEntries,
  buildKeywordsSitemapEntries,
  buildProfilesSitemapEntries,
  buildBlogSitemapEntries,
} from "@/app/_lib/seo-routes";

/**
 * Segmented sitemap index.
 * Next.js serves /sitemap.xml as the index pointing to /sitemap/[id].xml
 * IDs: 0=core, 1=cities, 2=services, 3=keywords, 4=profiles, 5=blog
 */
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  switch (id) {
    case 0: return buildCoreSitemapEntries(now);
    case 1: return buildCitiesSitemapEntries(now);
    case 2: return buildServicesCitySitemapEntries(now);
    case 3: return buildKeywordsSitemapEntries(now);
    case 4: return buildProfilesSitemapEntries(now);
    case 5: return buildBlogSitemapEntries(now);
    default: return [];
  }
}
