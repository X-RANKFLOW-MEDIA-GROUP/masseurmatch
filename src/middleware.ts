import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canonicalCategoryToLegacyParts,
  resolveCitySlug,
} from "@/app/_lib/city-routing";
import { containsLangParam, removeLangSearchParam } from "@/app/_lib/route-normalization";

const SESSION_COOKIE_NAME = "mm_session";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type MiddlewareSession = {
  userId: string;
  email: string;
  role: "admin" | "provider" | "client" | null;
  expiresAt: string;
};

function permanentRedirect(path: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), { status: 301 });
}

function getSessionSecret(): string {
  const secret =
    process.env.MM_SESSION_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.MM_JWT_SECRET ??
    process.env.JWT_SECRET;
  if (secret) return secret;
  // Only fall back to a constant for genuine local development/testing. Any
  // deployed environment (production, preview, staging) must provide a real
  // secret so an attacker cannot forge a signed admin cookie.
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return 'dev-only-masseurmatch-session-secret';
  }
  throw new Error('MM_SESSION_SECRET is required outside local development.');
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function signPayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

async function readSessionCookie(request: NextRequest): Promise<MiddlewareSession | null> {
  const rawValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!rawValue) return null;

  const [payload, signature] = rawValue.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  if (!constantTimeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(decoder.decode(fromBase64Url(payload))) as MiddlewareSession;
    if (!parsed.userId || !parsed.email || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
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
  const session = await readSessionCookie(request);

  if (isPublicRateLimited(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

  if (pathname === "/Auth") {
    return permanentRedirect("/auth", request);
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
  if (pathname === "/explore" && searchParams.has("city")) {
    const slug = exploreCityToSlug(searchParams.get("city")!);
    return permanentRedirect(`/explore/usa/${slug}`, request);
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
  if (pathname === "/pro" || pathname.startsWith("/pro/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "provider" && session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname === "/client" || pathname.startsWith("/client/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "client") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|.*\\..*).*)",
  ],
};
