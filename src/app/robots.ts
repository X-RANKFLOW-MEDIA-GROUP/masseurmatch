import type { MetadataRoute } from "next";

import { appUrl } from "@/app/_lib/metadata";
import { buildRobotsRules } from "@/app/_lib/seo-routes";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

const EXTRA_FILTER_DISALLOWS = ["/explore?*", "/*?city=*", "/*?zip=*"];
const SEARCH_ENGINE_AGENTS = new Set(["Googlebot", "Bingbot", "Yandex", "Baiduspider", "*"]);
const EXACT_PRIVATE_DISALLOWS = new Set([
  "/admin",
  "/api",
  "/pro",
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/client",
  "/portal",
  "/auth",
]);
const PRIVATE_ROUTE_PREFIXES = [
  "/admin/",
  "/api/",
  "/pro/",
  "/login/",
  "/register/",
  "/signup/",
  "/forgot-password/",
  "/reset-password/",
  "/dashboard/",
  "/client/",
  "/portal/",
  "/auth/",
];

function normalizePrivateDisallow(pattern: string): string {
  return EXACT_PRIVATE_DISALLOWS.has(pattern) ? `${pattern}$` : pattern;
}

function buildReleaseRobotsRules(): MetadataRoute.Robots["rules"] {
  const baseRules = buildRobotsRules();
  if (!Array.isArray(baseRules)) return baseRules;

  return baseRules.map((rule) => {
    const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
    const existingDisallows = Array.isArray(rule.disallow)
      ? rule.disallow
      : rule.disallow
        ? [rule.disallow]
        : [];
    const normalizedPrivateRules = [
      ...existingDisallows.map(normalizePrivateDisallow),
      ...PRIVATE_ROUTE_PREFIXES,
    ];
    const extraFilters = userAgents.some((agent) => SEARCH_ENGINE_AGENTS.has(agent))
      ? EXTRA_FILTER_DISALLOWS
      : [];

    return {
      ...rule,
      disallow: [...new Set([...normalizedPrivateRules, ...extraFilters])],
    };
  });
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: buildReleaseRobotsRules(),
    sitemap: siteUrl("/sitemap.xml"),
    host: appUrl,
  };
}
