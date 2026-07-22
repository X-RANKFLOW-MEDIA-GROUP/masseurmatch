import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canonicalCategoryToLegacyParts,
  resolveCitySlug,
} from "@/app/_lib/city-routing";
import { containsLangParam, removeLangSearchParam } from "@/app/_lib/route-normalization";
import { updateSession, type EdgeSession } from "@/lib/supabase/middleware";

function permanentRedirect(path: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), { status: 301 });
}

// Carry any auth cookies that updateSession rotated (a refreshed access/refresh
// token pair) onto a redirect response. Without this, redirecting after a
// silent token refresh discards the new cookies and the browser keeps the old,
// now-revoked refresh token — silently logging the user out.
function withSessionCookies(
  response: NextResponse,
  sessionResponse: NextResponse | null,
): NextResponse {
  sessionResponse?.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

const PUBLIC_RATE_LIMIT = { windowMs: 60_000, max: 240 };
const publicHits = new Map<string, { count: number; resetAt: number }>();

function getRequestIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
}

function isPublicRateLimited(request: NextRequest): boolean {
  if (request.method !== "GET") return false;
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return false;

  const ip = getRequestIp(request);
  const now = Date.now();
  const current = publicHits.get(ip);
  if (!current || now >= current.resetAt) {
    publicHits.set(ip, { count: 1, resetAt: now + PUBLIC_RATE_LIMIT.windowMs });
    return false;
  }

  if (current.count >= PUBLIC_RATE_LIMIT.max) {
    return true;
  }

  current.count += 1;
  return false;
}

const EXPLORE_CITY_SLUG_MAP: Record<string, string> = {
  "dallas": "dallas",
  "miami": "miami",
  "austin": "austin",
  "new york": "new-york",
  "new york city": "new-york",
  "nyc": "new-york",
  "houston": "houston",
  "los angeles": "los-angeles",
  "chicago": "chicago",
  "atlanta": "atlanta",
  "phoenix": "phoenix",
  "philadelphia": "philadelphia",
  "san antonio": "san-antonio",
  "san diego": "san-diego",
  "san jose": "san-jose",
  "denver": "denver",
  "seattle": "seattle",
  "boston": "boston",
  "portland": "portland",
  "nashville": "nashville",
  "las vegas": "las-vegas",
  "memphis": "memphis",
  "baltimore": "baltimore",
  "louisville": "louisville",
  "milwaukee": "milwaukee",
  "albuquerque": "albuquerque",
  "tucson": "tucson",
  "fresno": "fresno",
  "sacramento": "sacramento",
  "mesa": "mesa",
  "kansas city": "kansas-city",
  "omaha": "omaha",
  "raleigh": "raleigh",
  "cleveland": "cleveland",
  "minneapolis": "minneapolis",
  "tulsa": "tulsa",
  "tampa": "tampa",
  "st. louis": "st-louis",
  "st louis": "st-louis",
  "washington dc": "washington-dc",
  "washington": "washington-dc",
  "cincinnati": "cincinnati",
  "bakersfield": "bakersfield",
  "anaheim": "anaheim",
  "aurora": "aurora",
  "wichita": "wichita",
  "detroit": "detroit",
  "oklahoma city": "oklahoma-city",
  "el paso": "el-paso",
  "salt lake city": "salt-lake-city",
  "fort worth": "fort-worth",
  "virginia beach": "virginia-beach",
};

function exploreCityToSlug(rawCity: string): string {
  const normalized = rawCity.toLowerCase().trim();
  return EXPLORE_CITY_SLUG_MAP[normalized]
    ?? normalized.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublicRateLimited(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const host = request.headers.get("host") ?? "";
  const isAdminSubdomain =
    host.startsWith("admin.masseurmatch.com") || host.startsWith("admin.masseurmatch.local");

  // Only touch Supabase Auth on routes that actually gate on identity. Public
  // pages (the bulk of traffic) skip the network round-trip entirely.
  const needsSession =
    isAdminSubdomain ||
    pathname === "/pro" ||
    pathname.startsWith("/pro/") ||
    pathname === "/client" ||
    pathname.startsWith("/client/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  let session: EdgeSession | null = null;
  let sessionResponse: NextResponse | null = null;
  if (needsSession) {
    const result = await updateSession(request);
    session = result.session;
    sessionResponse = result.response;
  }

  // ── 0a. Admin subdomain routing ──────────────────────────────────────────
  // Rewrite admin.masseurmatch.com/* → /admin/* (requires domain alias in Vercel)
  if (isAdminSubdomain) {
    const adminPathname = pathname === "/" ? "/admin" : pathname.startsWith("/admin") ? pathname : `/admin${pathname}`;
    if (!session) {
      // Redirect to the login page on the *apex* host, not this admin host —
      // otherwise the login page itself is caught by this branch and loops.
      const baseHost = host.replace(/^admin\./, "");
      const loginUrl = new URL(`${request.nextUrl.protocol}//${baseHost}/login`);
      loginUrl.searchParams.set("redirect", adminPathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      const baseHost = host.replace(/^admin\./, "");
      return withSessionCookies(
        NextResponse.redirect(new URL(`${request.nextUrl.protocol}//${baseHost}/`)),
        sessionResponse,
      );
    }
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = adminPathname;
    const rewrite = NextResponse.rewrite(rewriteUrl);
    sessionResponse?.cookies.getAll().forEach((cookie) => rewrite.cookies.set(cookie));
    return rewrite;
  }

  // ── 0. Supabase auth callback guard ─────────────────────────────────────
  // Supabase sometimes sends the ?code= param to the site root URL instead of
  // /auth/callback (e.g. when the Redirect URL in the Supabase dashboard is set
  // to https://www.masseurmatch.com instead of https://www.masseurmatch.com/auth/callback).
  // Forward it to the real handler so the session exchange can complete.
  if (pathname === "/" && searchParams.has("code")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    // Preserve all query params (code, next, error, etc.)
    searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(callbackUrl, { status: 302 });
  }

  // ── 1. Removed routes → 301 redirects ───────────────────────────────────
  if (pathname === "/wireframes" || pathname.startsWith("/wireframes/")) {
    return permanentRedirect("/", request);
  }

  if (pathname === "/chat" || pathname.startsWith("/chat/")) {
    return permanentRedirect("/explore", request);
  }

  if (pathname === "/pro/travel" || pathname.startsWith("/pro/travel/")) {
    return permanentRedirect("/pro/dashboard", request);
  }

  // The standalone /auth page was removed; /login is the canonical entry.
  if (pathname === "/Auth" || pathname === "/auth") {
    return permanentRedirect("/login", request);
  }

  if (pathname === "/Privacy") {
    return permanentRedirect("/privacy", request);
  }

  if (pathname === "/admin/reviews" || pathname.startsWith("/admin/reviews/")) {
    return permanentRedirect("/admin/moderation", request);
  }


  if (pathname === "/register") {
    return permanentRedirect("/signup/account", request);
  }

  if (pathname === "/pro/onboard") {
    return permanentRedirect("/signup/plan", request);
  }

  // ── 2. /explore?city=X  →  301 /explore/usa/{slug} ───────────────────────
  if (pathname === "/explore" && searchParams.get("city")) {
    const slug = exploreCityToSlug(searchParams.get("city")!);
    // Guard against an empty slug, which would redirect to /explore/usa (404).
    if (slug) {
      return permanentRedirect(`/explore/usa/${slug}`, request);
    }
  }

  // ── 3. /pt-br/  →  301 /pt-br ────────────────────────────────────────────
  if (pathname === "/pt-br/") {
    return permanentRedirect("/pt-br", request);
  }

  // ── 4. /explore/* →  noindex, follow header ─────────────────────────────
  if (pathname === "/explore" || pathname.startsWith("/explore/")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }

  // ── 5. Legacy /city/{slug}/... → 301 canonical city slug ─────────────────
  const canonicalNeighborhoods = new Set([
    "oak-lawn",
    "turtle-creek",
    "uptown",
    "medical-district",
    "love-field",
    "dfw-airport",
    "highland-park",
    "university-park",
    "downtown",
    "design-district",
  ]);

  if (pathname.startsWith("/city/")) {
    const parts = pathname.split("/").filter(Boolean);
    const cityCandidate = parts[1] || "";
    const citySlug = resolveCitySlug(cityCandidate);

    if (citySlug) {
      const legacyParts = parts.slice(2);
      if (legacyParts[0] === "massage-therapists") {
        return permanentRedirect(`/${citySlug}`, request);
      }
      const destinationPath = legacyParts.length
        ? `/${citySlug}/${legacyParts.join("/")}`
        : `/${citySlug}`;
      return permanentRedirect(destinationPath, request);
    }
  }

  // ── 6. Legacy /cities/{slug}/... → 301 canonical city slug ───────────────
  if (pathname.startsWith("/cities/")) {
    const parts = pathname.split("/").filter(Boolean);
    const canonicalCityCandidate = parts[1] || "";
    const citySlug = resolveCitySlug(canonicalCityCandidate);

    if (citySlug) {
      const incomingCategory = parts[2];

      if (!incomingCategory) {
        return permanentRedirect(`/${citySlug}`, request);
      }

      if (incomingCategory === "massage-therapists") {
        return permanentRedirect(`/${citySlug}`, request);
      }

      if (canonicalNeighborhoods.has(incomingCategory)) {
        return permanentRedirect(`/${citySlug}/areas/${incomingCategory}`, request);
      }

      const mappedLegacy = canonicalCategoryToLegacyParts(incomingCategory);
      if (mappedLegacy) {
        return permanentRedirect(`/${citySlug}/${mappedLegacy.join("/")}`, request);
      }

      return permanentRedirect(`/${citySlug}/${incomingCategory}`, request);
    }
  }

  // ── 7. Legacy /{city}/massage-therapists → /{city} ───────────────────────
  const topLevelParts = pathname.split("/").filter(Boolean);

  // ── 7a. Legacy /{city}/therapist/{slug} → /therapists/{slug} ─────────────
  if (topLevelParts.length === 3 && topLevelParts[1] === "therapist") {
    const citySlug = resolveCitySlug(topLevelParts[0] || "");
    if (citySlug) {
      return permanentRedirect(`/therapists/${topLevelParts[2]}`, request);
    }
  }
  if (topLevelParts.length === 2 && topLevelParts[1] === "massage-therapists") {
    const citySlug = resolveCitySlug(topLevelParts[0] || "");
    if (citySlug) {
      return permanentRedirect(`/${citySlug}`, request);
    }
  }

  // ── 8. Strip crawlable language query variants (?lang=*) ──────────────────
  if (containsLangParam(searchParams)) {
    const cleaned = removeLangSearchParam(searchParams);
    const search = cleaned.toString();
    return permanentRedirect(search ? `${pathname}?${search}` : pathname, request);
  }

  // ── 9. Auth guards ────────────────────────────────────────────────────────
  // /pro/join is the therapist entry point: signed-out visitors go to the
  // public recruitment page instead of hitting a login wall, while providers
  // who are already signed in fall through to the portal hub below.
  if (pathname === "/pro/join" && !session) {
    return NextResponse.redirect(new URL("/for-therapists", request.url));
  }

  if (pathname === "/pro" || pathname.startsWith("/pro/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "provider" && session.role !== "admin") {
      return withSessionCookies(NextResponse.redirect(new URL("/", request.url)), sessionResponse);
    }
  }

  if (pathname === "/client" || pathname.startsWith("/client/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "client") {
      return withSessionCookies(NextResponse.redirect(new URL("/", request.url)), sessionResponse);
    }
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      return withSessionCookies(NextResponse.redirect(new URL("/", request.url)), sessionResponse);
    }
  }

  return sessionResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|.*\\..*).*)",
  ],
};
