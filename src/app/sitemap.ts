import type { MetadataRoute } from "next";
import { getBlogPosts, getCities, getKeywords, getPublicTherapists, identitySegments } from "@/mm/lib/directory";
import { appUrl } from "@/mm/lib/env";

const staticRoutes = [
  "/",
  "/about",
  "/advertise",
  "/blog",
  "/chat",
  "/contact",
  "/cookie-policy",
  "/forgot-password",
  "/login",
  "/near-me",
  "/privacy",
  "/pro/join",
  "/register",
  "/search",
  "/terms",
  "/therapist-agreement",
  "/therapists",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, keywords, posts, therapists] = await Promise.all([
    getCities(),
    getKeywords(),
    getBlogPosts(),
    getPublicTherapists(),
  ]);

  const keywordSlice = keywords.slice(0, 10);
  const cityUrls = cities.flatMap((city) => {
    const segmentUrls = identitySegments.map((segment) => `/${city.slug}/${segment}`);
    const keywordUrls = identitySegments.flatMap((segment) =>
      keywordSlice.map((keyword) => `/${city.slug}/${segment}/${keyword.slug}`),
    );

    return [`/${city.slug}`, ...segmentUrls, ...keywordUrls];
  });

  const urls = [
    ...staticRoutes,
    ...cityUrls,
    ...posts.map((post) => `/blog/${post.slug}`),
    ...therapists.map((therapist) => `/therapists/${therapist.slug}`),
  ];

  return urls.map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: path.startsWith("/blog/") ? "weekly" : "daily",
    priority: path === "/" ? 1 : path.startsWith("/therapists/") || cityUrls.includes(path) ? 0.8 : 0.6,
  }));
}
