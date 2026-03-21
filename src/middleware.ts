import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canonicalCategoryToLegacyParts,
  resolveCitySlug,
} from "@/app/_lib/city-routing";

const SESSION_COOKIE_NAME = "mm_session";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type MiddlewareSession = {
  userId: string;
  email: string;
  role: "admin" | "provider" | "client" | null;
  expiresAt: string;
};

function getSessionSecret() {
  return process.env.MM_SESSION_SECRET || process.env.SESSION_SECRET || "dev-only-masseurmatch-session-secret";
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
  if (a.length !== b.length) {
    return false;
  }

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
  if (!rawValue) {
    return null;
  }

  const [payload, signature] = rawValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await signPayload(payload);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decoder.decode(fromBase64Url(payload))) as MiddlewareSession;
    if (!parsed.userId || !parsed.email || !parsed.expiresAt) {
      return null;
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const session = await readSessionCookie(request);

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
      const destinationPath = legacyParts.length ? `/${citySlug}/${legacyParts.join("/")}` : `/${citySlug}`;
      const destination = new URL(destinationPath, request.url);
      return NextResponse.redirect(destination, 301);
    }
  }

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

  if (pathname.startsWith("/pro")) {
    if (!session || session.role !== "provider") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|.*\\..*).*)",
  ],
};
