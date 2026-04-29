import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/near-me", "/massage", "/therapists", "/blog"],
        disallow: [
          "/admin/",
          "/dashboard/",
          "/client/",
          "/login",
          "/register",
          "/billing",
          "/api/",
          "/verification",
          "/checkout",
          "/account",
          "/auth/callback",
          "/signup/",
        ],
      },
    ],
    sitemap: `${siteUrl("/")}/sitemap.xml`,
    host: siteUrl("/"),
  };
}
