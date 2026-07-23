import { createSupabasePublicClient } from "@/app/api/_lib/supabase-server";
import { getCities, getSitemapProfileSlugs } from "@/app/_lib/directory";
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
  // NB: no `is_active` filter — that column does not exist on public.cities, and
  // querying it made every sitemap build log `42703 column cities.is_active does
  // not exist`. Use DB rows only when the table actually returns some; otherwise
  // fall back to the static city taxonomy.
  const dbCities = await tryFetchAllRows<SeoCity>(
    "cities",
    "slug, updated_at",
    (query) => query.not("slug", "is", null).order("slug"),
  );

  if (dbCities && dbCities.length > 0) {
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
  // No `is_active` filter — the column does not exist on public.keywords (same
  // 42703 as cities). Use DB rows only when present, else the static taxonomy.
  const dbKeywords = await tryFetchAllRows<SeoKeyword>(
    "keywords",
    "slug, updated_at",
    (query) => query.not("slug", "is", null).order("slug"),
  );

  if (dbKeywords && dbKeywords.length > 0) {
    return dbKeywords.filter((keyword) => typeof keyword.slug === "string" && keyword.slug.length > 0);
  }

  return SPECIALTY_KEYWORDS.map((keyword) => ({
    slug: keyword.slug,
    updated_at: null,
  }));
}

// Kept for the sitemap priority boost. Only slugs that are genuinely public
// (i.e. returned by the public directory query) are ever emitted, so a slug
// listed here that is not live will simply not appear.
export const FEATURED_PROFILE_SLUGS = [
  "bruno-dallas-tx",
];

// Source therapist sitemap entries from the exact same query that serves the
// public profile route (`getPublicTherapistBySlug`). This guarantees the
// sitemap and the live pages agree: every URL resolves (no 404s) and every
// live profile is included. Previously this read a separate `therapists` table
// whose approved rows had slugs the public route rejected — producing sitemap
// 404s and omitting the profiles that actually resolve.
export async function getSeoTherapists(): Promise<SeoTherapist[]> {
  const rows = await getSitemapProfileSlugs();
  return rows.filter((row) => typeof row.slug === "string" && row.slug.length > 0);
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
