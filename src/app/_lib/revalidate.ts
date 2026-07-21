import { envOptional } from "@/app/_lib/env";
import { getCities } from "@/app/_lib/directory";
import { getSeoCities, getSeoSegments } from "@/app/_lib/seo-data";
import { slugify, uniqueStrings } from "@/app/_lib/utils";

const GLOBAL_REVALIDATE_PATHS = ["/", "/explore", "/search", "/therapists"];
const SITEMAP_REVALIDATE_PATHS = [
  "/sitemap.xml",
  "/sitemaps/0.xml",
  "/sitemaps/1.xml",
  "/sitemaps/2.xml",
  "/sitemaps/3.xml",
  "/sitemaps/4.xml",
  "/sitemaps/5.xml",
];

type TriggerRevalidateOptions = {
  request?: Request;
  includeSitemaps?: boolean;
};

type TriggerRevalidateResult = {
  ok: boolean;
  revalidated: string[];
  skipped?: string;
};

type RevalidateApiResponse = {
  ok: boolean;
  error?: string;
  revalidated?: string[];
};

type TherapistRevalidateInput = {
  id?: string | null;
  slug?: string | null;
  city?: string | null;
};

function normalizePath(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  const trimmed = path.trim();

  if (!trimmed.startsWith("/")) {
    return null;
  }

  if (trimmed === "/") {
    return "/";
  }

  return trimmed.replace(/\/+$/, "");
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function resolveOrigin(request?: Request) {
  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      // Fall back to explicit environment configuration below.
    }
  }

  return normalizeOrigin(
    envOptional([
      "NEXT_PUBLIC_SITE_URL",
      "SITE_URL",
      "NEXT_PUBLIC_APP_URL",
      "VERCEL_PROJECT_PRODUCTION_URL",
      "VERCEL_URL",
    ]),
  );
}

function resolveCitySlug(city: string | null | undefined) {
  if (!city) {
    return null;
  }

  const trimmed = city.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.toLowerCase();
  const matchedCity = getCities().find(
    (entry) => entry.slug === normalized || entry.name.toLowerCase() === normalized,
  );

  return matchedCity?.slug || slugify(trimmed);
}

export function getSitemapRevalidatePaths() {
  return [...SITEMAP_REVALIDATE_PATHS];
}

export function normalizeRevalidatePaths(paths: Array<string | null | undefined>) {
  return uniqueStrings(paths.map((path) => normalizePath(path)));
}

export async function buildCityRevalidatePaths(citySlug: string) {
  const normalizedCitySlug = slugify(citySlug);

  if (!normalizedCitySlug) {
    return normalizeRevalidatePaths([...GLOBAL_REVALIDATE_PATHS, ...SITEMAP_REVALIDATE_PATHS]);
  }

  const segments = await getSeoSegments();
  const cityRoot = `/${normalizedCitySlug}`;

  return normalizeRevalidatePaths([
    ...GLOBAL_REVALIDATE_PATHS,
    cityRoot,
    ...segments.map((segment) => `${cityRoot}/${segment.slug}`),
    ...SITEMAP_REVALIDATE_PATHS,
  ]);
}

export async function buildKeywordRevalidatePaths(keywordSlug: string, city?: string | null) {
  const normalizedKeywordSlug = slugify(keywordSlug);

  if (!normalizedKeywordSlug) {
    return normalizeRevalidatePaths([...GLOBAL_REVALIDATE_PATHS, ...SITEMAP_REVALIDATE_PATHS]);
  }

  const [segments, seoCities] = await Promise.all([getSeoSegments(), getSeoCities()]);
  const resolvedCitySlug = resolveCitySlug(city);
  const citySlugs =
    resolvedCitySlug
      ? [resolvedCitySlug]
      : seoCities.map((entry) => entry.slug).filter((slug) => typeof slug === "string" && slug.length > 0);

  return normalizeRevalidatePaths([
    ...GLOBAL_REVALIDATE_PATHS,
    ...citySlugs.flatMap((citySlug) =>
      segments.map((segment) => `/${citySlug}/${segment.slug}/${normalizedKeywordSlug}`),
    ),
    ...SITEMAP_REVALIDATE_PATHS,
  ]);
}

export async function buildTherapistRevalidatePaths(profile: TherapistRevalidateInput) {
  const therapistPathSlug = profile.slug || profile.id;
  const therapistPaths = normalizeRevalidatePaths([
    therapistPathSlug ? `/therapists/${therapistPathSlug}` : null,
    profile.slug && profile.id && profile.slug !== profile.id ? `/therapists/${profile.id}` : null,
  ]);
  const citySlug = resolveCitySlug(profile.city);
  const cityPaths = citySlug ? await buildCityRevalidatePaths(citySlug) : [];

  return normalizeRevalidatePaths([
    ...GLOBAL_REVALIDATE_PATHS,
    ...therapistPaths,
    ...cityPaths,
    ...SITEMAP_REVALIDATE_PATHS,
  ]);
}

export async function triggerRevalidate(
  paths: string[],
  options: TriggerRevalidateOptions = {},
): Promise<TriggerRevalidateResult> {
  const secret = envOptional(["REVALIDATE_SECRET"]);
  const origin = resolveOrigin(options.request);
  const revalidatePaths = normalizeRevalidatePaths([
    ...paths,
    ...(options.includeSitemaps === false ? [] : SITEMAP_REVALIDATE_PATHS),
  ]);

  if (!secret) {
    return {
      ok: false,
      revalidated: [],
      skipped: "REVALIDATE_SECRET is not configured.",
    };
  }

  if (!origin) {
    return {
      ok: false,
      revalidated: [],
      skipped: "Could not resolve a base URL for revalidation.",
    };
  }

  if (revalidatePaths.length === 0) {
    return {
      ok: true,
      revalidated: [],
    };
  }

  const response = await fetch(`${origin}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": secret,
    },
    body: JSON.stringify({
      paths: revalidatePaths,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as RevalidateApiResponse | null;

  if (!response.ok) {
    throw new Error(payload?.error || `Revalidation failed with status ${response.status}.`);
  }

  return {
    ok: true,
    revalidated: payload?.revalidated || revalidatePaths,
  };
}
