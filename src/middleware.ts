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

function getSessionSecret(): string {
  const secret =
    process.env.MM_SESSION_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.MM_JWT_SECRET ??
    process.env.JWT_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MM_SESSION_SECRET is required in production.');
  }
  return 'dev-only-masseurmatch-session-secret';
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

// Maps ?city= display values to /explore/usa/{slug} paths.
// Keys are lowercase — always .toLowerCase().trim() before lookup.
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

  // ── 1. Removed routes → 301 redirects ───────────────────────────────────
  if (pathname === "/wireframes" || pathname.startsWith("/wireframes/")) {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }

  if (pathname === "/chat" || pathname.startsWith("/chat/")) {
    return NextResponse.redirect(new URL("/explore", request.url), 301);
  }

  if (pathname === "/pro/travel" || pathname.startsWith("/pro/travel/")) {
    return NextResponse.redirect(new URL("/pro/dashboard", request.url), 301);
  }

  if (pathname === "/Auth") {
    return NextResponse.redirect(new URL("/auth", request.url), 301);
  }

  if (pathname === "/Privacy") {
    return NextResponse.redirect(new URL("/privacy", request.url), 301);
  }

  if (pathname === "/admin/reviews" || pathname.startsWith("/admin/reviews/")) {
    return NextResponse.redirect(new URL("/admin/moderation", request.url), 301);
  }

  // ── 2. /explore?city=X  →  301 /explore/usa/{slug} ───────────────────────
  // Cleans up parameterized browse URLs that Google indexed.
  if (pathname === "/explore" && searchParams.has("city")) {
    const slug = exploreCityToSlug(searchParams.get("city")!);
    const destination = new URL(`/explore/usa/${slug}`, request.url);
    return NextResponse.redirect(destination, 301);
  }

  // ── 2. /pt-br/  →  301 /pt-br ────────────────────────────────────────────
  // Consolidates trailing-slash duplicate that GSC crawled as a separate URL.
  if (pathname === "/pt-br/") {
    const destination = new URL("/pt-br", request.url);
    return NextResponse.redirect(destination, 301);
  }


  // ── 4. /explore/*  →  noindex, follow header ─────────────────────────────
  // Browse/directory pages are navigation aids, not SEO targets.
  // follow keeps link equity flowing to the /massage/ landing pages.
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
        const destination = new URL(`/${citySlug}`, request.url);
        return NextResponse.redirect(destination, 301);
      }
      const destinationPath = legacyParts.length
        ? `/${citySlug}/${legacyParts.join("/")}`
        : `/${citySlug}`;
      const destination = new URL(destinationPath, request.url);
      return NextResponse.redirect(destination, 301);
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
        const destination = new URL(`/${citySlug}`, request.url);
        return NextResponse.redirect(destination, 301);
      }

      if (incomingCategory === "massage-therapists") {
        const destination = new URL(`/${citySlug}`, request.url);
        return NextResponse.redirect(destination, 301);
      }

      if (canonicalNeighborhoods.has(incomingCategory)) {
        const destination = new URL(`/${citySlug}/areas/${incomingCategory}`, request.url);
        return NextResponse.redirect(destination, 301);
      }

      const mappedLegacy = canonicalCategoryToLegacyParts(incomingCategory);
      if (mappedLegacy) {
        const destination = new URL(`/${citySlug}/${mappedLegacy.join("/")}`, request.url);
        return NextResponse.redirect(destination, 301);
      }

      const destination = new URL(`/${citySlug}/${incomingCategory}`, request.url);
      return NextResponse.redirect(destination, 301);
    }
  }

  // ── 7. Legacy /{city}/massage-therapists → /{city} ───────────────────────
  const topLevelParts = pathname.split("/").filter(Boolean);
  if (topLevelParts.length === 2 && topLevelParts[1] === "massage-therapists") {
    const citySlug = resolveCitySlug(topLevelParts[0] || "");
    if (citySlug) {
      const destination = new URL(`/${citySlug}`, request.url);
      return NextResponse.redirect(destination, 301);
    }
  }

  // ── 8. Strip crawlable language query variants (?lang=*) ──────────────────
  if (containsLangParam(searchParams)) {
    const destination = new URL(pathname, request.url);
    const cleaned = removeLangSearchParam(searchParams);
    destination.search = cleaned.toString();
    return NextResponse.redirect(destination, 301);
  }

  // ── 9. Auth guards ────────────────────────────────────────────────────────
  // Unauthenticated → /login (with redirect param)
  // Authenticated but wrong role → / (home, no redirect param)
  if (pathname === "/pro" || pathname.startsWith("/pro/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "provider") {
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
