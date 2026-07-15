import { createHmac, randomBytes } from "node:crypto";
import { envOptional } from "@/app/api/_lib/env";

const CSRF_COOKIE_NAME = "mm_csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCsrfSecret(): string {
  const secret = envOptional(["MM_CSRF_SECRET", "CSRF_SECRET"]);
  if (secret) return secret;
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return "dev-only-csrf-secret";
  }
  throw new Error("MM_CSRF_SECRET is required in production");
}

export function generateCsrfToken(): { token: string; cookie: string } {
  const randomPart = randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const payload = `${randomPart}.${timestamp}`;
  const signature = createHmac("sha256", getCsrfSecret()).update(payload).digest("hex");
  const token = `${payload}.${signature}`;

  const secure = process.env.NODE_ENV === "production";
  const cookieValue = encodeURIComponent(randomPart);
  const cookieParts = [
    `${CSRF_COOKIE_NAME}=${cookieValue}`,
    `Path=/`,
    `SameSite=Strict`,
    `HttpOnly`,
    `Max-Age=${CSRF_TTL_MS / 1000}`,
  ];

  if (secure) {
    cookieParts.push("Secure");
    cookieParts.push("Domain=.masseurmatch.com");
  }

  return {
    token,
    cookie: cookieParts.join("; "),
  };
}

export function verifyCsrfToken(token: string, cookieValue: string): boolean {
  try {
    const [randomPart, timestamp, signature] = token.split(".");

    if (!randomPart || !timestamp || !signature) {
      return false;
    }

    // Verify timestamp is not too old
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > CSRF_TTL_MS || tokenAge < 0) {
      return false;
    }

    // Verify signature
    const payload = `${randomPart}.${timestamp}`;
    const expectedSignature = createHmac("sha256", getCsrfSecret())
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return false;
    }

    // Verify cookie matches token random part
    const decodedCookie = decodeURIComponent(cookieValue);
    if (randomPart !== decodedCookie) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function extractCsrfToken(headers: Headers): { token: string; cookieValue: string } | null {
  const token = headers.get(CSRF_HEADER_NAME);
  const cookies = headers.get("cookie");

  if (!token || !cookies) {
    return null;
  }

  const cookieMatch = cookies.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
  if (!cookieMatch?.[1]) {
    return null;
  }

  return {
    token,
    cookieValue: cookieMatch[1],
  };
}

export function clearCsrfCookie(): string {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${CSRF_COOKIE_NAME}=`,
    "Path=/",
    "SameSite=Strict",
    "HttpOnly",
    "Max-Age=0",
  ];

  if (secure) {
    parts.push("Secure");
    parts.push("Domain=.masseurmatch.com");
  }

  return parts.join("; ");
}
