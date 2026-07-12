import type { MetadataRoute } from "next";

import { appUrl } from "@/app/_lib/metadata";
import { buildRobotsRules } from "@/app/_lib/seo-routes";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

const EXTRA_FILTER_DISALLOWS = ["/explore?*", "/*?city=*", "/*?zip=*"];
const SEARCH_ENGINE_AGENTS = new Set(["Googlebot", "Bingbot", "Yandex", "Baiduspider", "*"]);

function buildReleaseRobotsRules(): MetadataRoute.Robots["rules"] {
  const baseRules = buildRobotsRules();
  if (!Array.isArray(baseRules)) return baseRules;

  return baseRules.map((rule) => {
    const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
    if (!userAgents.some((agent) => SEARCH_ENGINE_AGENTS.has(agent))) return rule;

    const existingDisallows = Array.isArray(rule.disallow)
      ? rule.disallow
      : rule.disallow
        ? [rule.disallow]
        : [];

    return {
      ...rule,
      disallow: [...new Set([...existingDisallows, ...EXTRA_FILTER_DISALLOWS])],
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
