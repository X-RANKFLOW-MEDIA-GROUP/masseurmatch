import type { MetadataRoute } from "next";
import { appUrl } from "@/mm/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
