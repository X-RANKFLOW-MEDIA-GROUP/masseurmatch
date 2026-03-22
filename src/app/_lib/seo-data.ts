import { createSupabasePublicClient } from "@/app/api/_lib/supabase-server";
import { getCities } from "@/app/_lib/directory";
import { DIRECTORY_SEGMENTS, SPECIALTY_KEYWORDS } from "@/app/_lib/directory-taxonomy";
import { siteUrl } from "@/lib/site";

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

export function absoluteUrl(path: string) {
  return siteUrl(path);
}

export async function fetchAllRows<T>(
  table: string,
  columns: string,
  queryBuilder?: (query: any) => any,
): Promise<T[]> {
  const supabase = createSupabasePublicClient() as any;
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
  table: string,
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
  const dbSegments = await tryFetchAllRows<SeoSegment>(
    "segments",
    "slug, updated_at",
    (query) => query.eq("is_active", true).not("slug", "is", null).order("slug"),
  );

  if (dbSegments) {
    return dbSegments.filter((segment) => typeof segment.slug === "string" && segment.slug.length > 0);
  }

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

export async function getSeoTherapists(): Promise<SeoTherapist[]> {
  const therapistsTableRows = await tryFetchAllRows<SeoTherapist>(
    "therapists",
    "slug, updated_at",
    (query) =>
      query
        .eq("is_active", true)
        .eq("profile_visible", true)
        .not("slug", "is", null)
        .order("slug"),
  );

  if (therapistsTableRows) {
    return therapistsTableRows.filter((therapist) => typeof therapist.slug === "string" && therapist.slug.length > 0);
  }

  const profileRows = await tryFetchAllRows<SeoTherapist>(
    "profiles",
    "slug, updated_at",
    (query) =>
      query
        .or("is_active.eq.true,is_active.is.null")
        .in("status", ["active", "approved"])
        .not("slug", "is", null)
        .order("slug"),
  );

  return (profileRows ?? []).filter((therapist) => typeof therapist.slug === "string" && therapist.slug.length > 0);
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
