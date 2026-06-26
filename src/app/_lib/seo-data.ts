import { createSupabasePublicClient } from "@/app/api/_lib/supabase-server";
import { getCities } from "@/app/_lib/directory";
import { DIRECTORY_SEGMENTS, SPECIALTY_KEYWORDS } from "@/app/_lib/directory-taxonomy";
import { siteUrl } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

export type SeoCity = {
  slug: string;
  updated_at?: string | null;
};

export type SeoSegment = {
  slug: string;
  updated_at?: string | null;
};

export type SeoKeyword = {
  slug: string;
  updated_at?: string | null;
};

export type SeoTherapist = {
  slug: string;
  updated_at?: string | null;
};

const PAGE_SIZE = 1000;
type SeoTableName = keyof Database["public"]["Tables"];

export function absoluteUrl(path: string) {
  return siteUrl(path);
}

export async function fetchAllRows<T>(
  table: SeoTableName,
  columns: string,
  queryBuilder?: (query: any) => any,
): Promise<T[]> {
  const supabase = createSupabasePublicClient();
  const rows: T[] = [];
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(columns).range(from, from + PAGE_SIZE - 1);

    if (queryBuilder) {
      query = queryBuilder(query);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch ${table}: ${error.message}`);
    }

    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    rows.push(...(data as T[]));

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

async function tryFetchAllRows<T>(
  table: SeoTableName,
  columns: string,
  queryBuilder?: (query: any) => any,
): Promise<T[] | null> {
  try {
    return await fetchAllRows<T>(table, columns, queryBuilder);
  } catch {
    return null;
  }
}

export async function getSeoCities(): Promise<SeoCity[]> {
  const dbCities = await tryFetchAllRows<SeoCity>(
    "cities",
    "slug, updated_at",
    (query) => query.eq("is_active", true).not("slug", "is", null).order("slug"),
  );

  if (dbCities) {
    return dbCities.filter((city) => typeof city.slug === "string" && city.slug.length > 0);
  }

  return getCities().map((city) => ({
    slug: city.slug,
    updated_at: null,
  }));
}

export async function getSeoSegments(): Promise<SeoSegment[]> {
  // The "segments" table was removed from the live schema.
  // Fall back to the static directory taxonomy.
  return DIRECTORY_SEGMENTS.map((segment) => ({
    slug: segment.slug,
    updated_at: null,
  }));
}

export async function getSeoKeywords(): Promise<SeoKeyword[]> {
  const dbKeywords = await tryFetchAllRows<SeoKeyword>(
    "keywords",
    "slug, updated_at",
    (query) => query.eq("is_active", true).not("slug", "is", null).order("slug"),
  );

  if (dbKeywords) {
    return dbKeywords.filter((keyword) => typeof keyword.slug === "string" && keyword.slug.length > 0);
  }

  return SPECIALTY_KEYWORDS.map((keyword) => ({
    slug: keyword.slug,
    updated_at: null,
  }));
}

// Featured profiles that should always appear in sitemap (exported for priority boost)
export const FEATURED_PROFILE_SLUGS = [
  "bruno-dallas-tx",
];

export async function getSeoTherapists(): Promise<SeoTherapist[]> {
  const therapistsTableRows = await tryFetchAllRows<SeoTherapist>(
    "therapists",
    "slug, updated_at",
    (query) =>
      query
        .eq("status", "approved")
        .not("slug", "is", null)
        .order("slug"),
  );

  if (therapistsTableRows && therapistsTableRows.length > 0) {
    const slugSet = new Set(therapistsTableRows.map((t) => t.slug));
    // Ensure featured profiles are always included
    const featuredToAdd = FEATURED_PROFILE_SLUGS
      .filter((slug) => !slugSet.has(slug))
      .map((slug) => ({ slug, updated_at: new Date().toISOString() }));
    return [
      ...therapistsTableRows.filter((therapist) => typeof therapist.slug === "string" && therapist.slug.length > 0),
      ...featuredToAdd,
    ];
  }

  const profileRows = await tryFetchAllRows<SeoTherapist>(
    "profiles",
    "slug, updated_at",
    (query) =>
      query
        .eq("visibility_status", "public")
        .eq("profile_status", "approved")
        .eq("is_suspended", false)
        .eq("is_banned", false)
        .not("slug", "is", null)
        .order("slug"),
  );

  const profiles = (profileRows ?? []).filter((therapist) => typeof therapist.slug === "string" && therapist.slug.length > 0);
  
  // Ensure featured profiles are always included
  const slugSet = new Set(profiles.map((t) => t.slug));
  const featuredToAdd = FEATURED_PROFILE_SLUGS
    .filter((slug) => !slugSet.has(slug))
    .map((slug) => ({ slug, updated_at: new Date().toISOString() }));
  
  return [...profiles, ...featuredToAdd];
}

export type SeoBlogPost = {
  slug: string;
  updated_at?: string | null;
  published_at?: string | null;
};

export async function getSeoBlogPosts(): Promise<SeoBlogPost[]> {
  const dbPosts = await tryFetchAllRows<SeoBlogPost>(
    "blog_posts",
    "slug, updated_at, published_at",
    (query) =>
      query
        .not("slug", "is", null)
        .order("published_at", { ascending: false }),
  );

  return (dbPosts ?? []).filter((post) => typeof post.slug === "string" && post.slug.length > 0);
}
