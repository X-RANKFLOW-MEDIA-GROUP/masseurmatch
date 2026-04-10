const LANG_PARAM = "lang";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
]);

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized !== "/" ? normalized.replace(/\/+$/, "") : normalized;
}

export function removeLangSearchParam(searchParams: URLSearchParams): URLSearchParams {
  const normalized = new URLSearchParams(searchParams);
  normalized.delete(LANG_PARAM);
  return normalized;
}

export function sanitizeCanonicalSearchParams(searchParams: URLSearchParams): URLSearchParams {
  const normalized = removeLangSearchParam(searchParams);
  for (const [key] of normalized.entries()) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      normalized.delete(key);
    }
  }
  return normalized;
}

export function buildCanonicalPath(pathname: string): string {
  return normalizePathname(pathname);
}

export function buildCanonicalPathWithSearch(pathname: string, searchParams?: URLSearchParams): string {
  const cleanPath = buildCanonicalPath(pathname);
  if (!searchParams) return cleanPath;

  const filtered = sanitizeCanonicalSearchParams(searchParams);
  const query = filtered.toString();
  return query ? `${cleanPath}?${query}` : cleanPath;
}

export function containsLangParam(searchParams: URLSearchParams): boolean {
  return searchParams.has(LANG_PARAM);
}

export const ROUTE_NORMALIZATION = {
  LANG_PARAM,
};
