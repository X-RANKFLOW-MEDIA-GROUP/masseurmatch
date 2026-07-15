import type { MetadataRoute } from "next";

import { buildReleaseSitemapEntries } from "@/app/_lib/sitemap-release";

// Refresh hourly so newly approved profiles and inventory-qualified cities appear promptly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildReleaseSitemapEntries();
}
