import type { MetadataRoute } from "next";

import { appUrl } from "@/app/_lib/metadata";
import { buildRobotsRules } from "@/app/_lib/seo-routes";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: buildRobotsRules(),
    sitemap: siteUrl("/sitemap.xml"),
    host: appUrl,
  };
}
