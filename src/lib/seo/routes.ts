import { SEO_CITIES } from "@/lib/seo/cities";
import { MODALITIES } from "@/lib/seo/modalities";
import { SEO_STATES } from "@/lib/seo/states";
import { SEO_BLOG_POSTS } from "@/lib/seo/contentTemplates";
import { getPublicTherapists } from "@/app/_lib/directory";

export type UrlEntry = { url: string; lastModified: Date; changeFrequency: "daily" | "weekly" | "monthly"; priority: number };

export async function getPublicProfileSlugs(): Promise<string[]> {
  try {
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!hasSupabaseEnv) return ["bruno-dallas-tx", "alex-miami-fl", "jordan-new-york-ny"];
    const results = await getPublicTherapists({ page: 1, pageSize: 500 });
    return results.items
      .filter((item) => item.status !== "suspended")
      .map((item) => item.slug || item.id)
      .filter(Boolean);
  } catch {
    return ["bruno-dallas-tx", "alex-miami-fl", "jordan-new-york-ny"];
  }
}

export function getProgrammaticPublicPaths(): string[] {
  const core = ["/", "/search", "/near-me", "/massage", "/therapists", "/blog"];
  const states = SEO_STATES.map((state) => `/massage/${state.slug}`);
  const cities = SEO_CITIES.flatMap((city) => {
    const base = `/massage/${city.slug}`;
    return [base, ...MODALITIES.map((modality) => `${base}/${modality.slug}`)];
  });
  const blogs = SEO_BLOG_POSTS.map((post) => `/blog/${post.slug}`);
  return [...core, ...states, ...cities, ...blogs];
}
