import type { MetadataRoute } from "next";
import { appUrl } from "@/app/_lib/metadata";
import { buildRobotsRules } from "@/app/_lib/seo-routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: buildRobotsRules(),
    sitemap: [`${appUrl}/sitemap.xml`],
    host: appUrl,
  };
}
