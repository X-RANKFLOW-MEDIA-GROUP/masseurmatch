import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canonicalCategoryToLegacyParts,
  resolveCitySlug,
} from "@/app/_lib/city-routing";
import { containsLangParam, removeLangSearchParam } from "@/app/_lib/route-normalization";
import { updateSession, type EdgeSession } from "@/lib/supabase/middleware";

function permanentRedirect(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url), { status: 301 });
}

function withSessionCookies(response: NextResponse, sessionResponse: NextResponse | null) {
  sessionResponse?.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

const PUBLIC_RATE_LIMIT = { windowMs: 60_000, max: 240 };
const publicHits = new Map<string, { count: number; resetAt: number }>();

function requestIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
}

function isPublicRateLimited(request: NextRequest) {
  if (request.method !== "GET") return false;
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return false;

  const key = requestIp(request);
  const now = Date.now();
  const current = publicHits.get(key);
  if (!current || now >= current.resetAt) {
    publicHits.set(key, { count: 1, resetAt: now + PUBLIC_RATE_LIMIT.windowMs });
    return false;
  }
  if (current.count >= PUBLIC_RATE_LIMIT.max) return true;
  current.count += 1;
  return false;
}

const EXPLORE_CITY_SLUG_MAP: Record<string, string> = {
  dallas: "dallas",
  miami: "miami",
  austin: "austin",
  "new york": "new-york",
  "new york city": "new-york",
  nyc: "new-york",
  houston: "houston",
  "los angeles": "los-angeles",
  chicago: "chicago",
  atlanta: "atlanta",
  phoenix: "phoenix",
  philadelphia: "philadelphia",
  "san antonio": "san-antonio",
  "san diego": "san-diego",
  "san jose": "san-jose",
  denver: "denver",
  seattle: "seattle",
  boston: "boston",
  portland: "portland",
  nashville: "nashville",
  "las vegas": "las-vegas",
  memphis: "memphis",
  baltimore: "baltimore",
  louisville: "louisville",
  milwaukee: "milwaukee",
  "kansas city": "kansas-city",
  "fort worth": "fort-worth",
  "washington dc": "washington-dc",
};

function exploreCityToSlug(rawCity: string) {
  const normalized = rawCity.toLowerCase().trim();
  return EXPLORE_CITY_SLUG_MAP[normalized] ??
    normalized.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function loginRedirect(request: NextRequest, pathname: string, sessionResponse: NextResponse | null) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return withSessionCookies(NextResponse.redirect(loginUrl), sessionResponse);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublicRateLimited(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const host = request.headers.get("host") ?? "";
  const isAdminSubdomain =
    host.startsWith("admin.masseurmatch.com") ||
    host.startsWith("admin.masseurmatch.local");

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
    const refreshed = await updateSession(request);
    session = refreshed.session;
    sessionResponse = refreshed.response;
  }

  if (isAdminSubdomain) {
    const adminPathname = pathname === "/"
      ? "/admin"
      : pathname.startsWith("/admin")
        ? pathname
        : `/admin${pathname}`;

    if (!session) {
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
    const response = NextResponse.rewrite(rewriteUrl);
    sessionResponse?.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  if (pathname === "/" && searchParams.has("code")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    searchParams.forEach((value, key) => callbackUrl.searchParams.set(key, value));
    return NextResponse.redirect(callbackUrl, { status: 302 });
  }

  if (pathname === "/wireframes" || pathname.startsWith("/wireframes/")) {
    return permanentRedirect("/", request);
  }
  if (pathname === "/chat" || pathname.startsWith("/chat/")) {
    return permanentRedirect("/explore", request);
  }
  if (pathname === "/pro/travel" || pathname.startsWith("/pro/travel/")) {
    return permanentRedirect("/pro/growth", request);
  }
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

  if (pathname === "/explore" && searchParams.get("city")) {
    const slug = exploreCityToSlug(searchParams.get("city")!);
    if (slug) return permanentRedirect(`/explore/usa/${slug}`, request);
  }

  if (pathname === "/pt-br/") {
    return permanentRedirect("/pt-br", request);
  }

  if (pathname.startsWith("/city/") || pathname.startsWith("/cities/")) {
    const parts = pathname.split("/").filter(Boolean);
    const cityCandidate = parts[1] || "";
    const citySlug = resolveCitySlug(cityCandidate);
    if (citySlug) {
      const incoming = parts[2];
      if (!incoming || incoming === "massage-therapists") {
        return permanentRedirect(`/${citySlug}`, request);
      }
      const mapped = canonicalCategoryToLegacyParts(incoming);
      return permanentRedirect(
        mapped ? `/${citySlug}/${mapped.join("/")}` : `/${citySlug}/${incoming}`,
        request,
      );
    }
  }

  const topLevelParts = pathname.split("/").filter(Boolean);
  if (topLevelParts.length === 3 && topLevelParts[1] === "therapist") {
    const citySlug = resolveCitySlug(topLevelParts[0] || "");
    if (citySlug) return permanentRedirect(`/therapists/${topLevelParts[2]}`, request);
  }
  if (topLevelParts.length === 2 && topLevelParts[1] === "massage-therapists") {
    const citySlug = resolveCitySlug(topLevelParts[0] || "");
    if (citySlug) return permanentRedirect(`/${citySlug}`, request);
  }

  if (containsLangParam(searchParams)) {
    const cleaned = removeLangSearchParam(searchParams);
    const search = cleaned.toString();
    return permanentRedirect(search ? `${pathname}?${search}` : pathname, request);
  }

  if (pathname === "/pro/join" && !session) {
    return NextResponse.redirect(new URL("/for-therapists", request.url));
  }

  if (pathname === "/pro" || pathname.startsWith("/pro/")) {
    if (!session) return loginRedirect(request, pathname, sessionResponse);
    if (session.role !== "provider" && session.role !== "admin") {
      return withSessionCookies(NextResponse.redirect(new URL("/", request.url)), sessionResponse);
    }
  }

  if (pathname === "/client" || pathname.startsWith("/client/")) {
    if (!session) return loginRedirect(request, pathname, sessionResponse);
    if (session.role !== "client") {
      return withSessionCookies(NextResponse.redirect(new URL("/", request.url)), sessionResponse);
    }
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) return loginRedirect(request, pathname, sessionResponse);
    if (session.role !== "admin") {
      return withSessionCookies(NextResponse.redirect(new URL("/", request.url)), sessionResponse);
    }
  }

  if (pathname === "/explore" || pathname.startsWith("/explore/")) {
    const response = sessionResponse ?? NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }

  return sessionResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|.*\\..*).*)",
  ],
};
