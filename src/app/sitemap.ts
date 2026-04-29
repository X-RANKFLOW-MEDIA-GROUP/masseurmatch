import type { MetadataRoute } from "next";
import { SEO_BLOG_POSTS } from "@/lib/seo/contentTemplates";
import { SEO_CITIES } from "@/lib/seo/cities";
import { MODALITIES } from "@/lib/seo/modalities";
import { getPublicProfileSlugs } from "@/lib/seo/routes";
import { SEO_STATES } from "@/lib/seo/states";
import { siteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const profileSlugs = await getPublicProfileSlugs();

  const base: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/search"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/near-me"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/massage"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: siteUrl("/therapists"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
  ];

  const stateEntries = SEO_STATES.map((state) => ({ url: siteUrl(`/massage/${state.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.75 }));
  const cityEntries = SEO_CITIES.flatMap((city) => {
    const baseUrl = `/massage/${city.slug}`;
    return [
      { url: siteUrl(baseUrl), lastModified: now, changeFrequency: "weekly" as const, priority: 0.85 },
      ...MODALITIES.map((modality) => ({ url: siteUrl(`${baseUrl}/${modality.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.72 })),
    ];
  });
  const profileEntries = profileSlugs.map((slug) => ({ url: siteUrl(`/therapists/${slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }));
  const blogEntries = SEO_BLOG_POSTS.map((post) => ({ url: siteUrl(`/blog/${post.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.62 }));

  return [...base, ...stateEntries, ...cityEntries, ...profileEntries, ...blogEntries];
}
