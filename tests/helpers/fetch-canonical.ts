import type { APIRequestContext } from "@playwright/test";

const REDIRECT_STATUSES = new Set([301, 302, 307, 308]);
const MAX_INFRASTRUCTURE_REDIRECTS = 3;

/**
 * Follow infrastructure-level host canonicalization transparently so the test
 * sees the application-level redirect. Vercel may use 301, 302, 307, or 308
 * for a same-path cross-origin hop (e.g. apex → www), and that status may
 * change independently of the application redirect configuration — so we skip
 * any redirect whose path+query is unchanged but whose origin differs, and
 * stop at the first response that isn't one.
 */
export async function fetchCanonical(
  request: APIRequestContext,
  url: string,
): Promise<Awaited<ReturnType<APIRequestContext["get"]>>> {
  let currentUrl = url;

  for (let hop = 0; hop < MAX_INFRASTRUCTURE_REDIRECTS; hop += 1) {
    const res = await request.get(currentUrl, { maxRedirects: 0 });
    const location = res.headers()["location"];

    if (!REDIRECT_STATUSES.has(res.status()) || !location) {
      return res;
    }

    const sourceUrl = new URL(currentUrl);
    const locationUrl = new URL(location, currentUrl);
    const samePathAndQuery =
      locationUrl.pathname === sourceUrl.pathname &&
      locationUrl.search === sourceUrl.search;
    const differentOrigin = locationUrl.origin !== sourceUrl.origin;

    if (!samePathAndQuery || !differentOrigin) {
      return res;
    }

    currentUrl = locationUrl.toString();
  }

  throw new Error(
    `Exceeded ${MAX_INFRASTRUCTURE_REDIRECTS} same-path host redirects for ${url}`,
  );
}
