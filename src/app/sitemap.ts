import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/app/_lib/seo-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries(new Date());
}
