import type { MetadataRoute } from "next";
import { appUrl } from "@/app/_lib/metadata";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Bingbot", "Yandex", "Baiduspider"],
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/pro",
          "/pro/",
          "/login",
          "/register",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/dashboard",
          "/dashboard/",
          "/client",
          "/client/",
          "/portal",
          "/search?*",
          "/*?sort=*",
          "/*?verified=*",
          "/*?availability=*",
          "/*?radius=*",
          "/*?session=*",
          "/*?tag=*",
          "/*?modality=*",
          "/*?page=*",
          "/explore?*",
          "/*?city=*",
          "/*?zip=*",
        ],
        crawlDelay: 0,
      },
      {
        userAgent: ["Twitterbot", "facebookexternalhit", "LinkedInBot", "Discordbot", "WhatsApp", "TelegramBot"],
        allow: "/",
      },
      {
        userAgent: ["*"],
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/pro",
          "/pro/",
          "/login",
          "/register",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/dashboard",
          "/dashboard/",
          "/client",
          "/client/",
          "/portal",
          "/search?*",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: [
      siteUrl("/sitemap.xml"),
      siteUrl("/sitemap/0.xml"),
      siteUrl("/sitemap/1.xml"),
      siteUrl("/sitemap/2.xml"),
      siteUrl("/sitemap/3.xml"),
      siteUrl("/sitemap/4.xml"),
      siteUrl("/sitemap/5.xml"),
      siteUrl("/sitemap/6.xml"),
    ],
    host: appUrl,
  };
}
