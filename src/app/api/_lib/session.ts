import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

import { envAny, envOptional } from "@/app/api/_lib/env";
import { parseCookieHeader } from "@/app/api/_lib/http";

export interface RequestSession {
  userId: string;
  email: string;
  role: "admin" | "provider" | "client" | null;
  expiresAt: string;
}

const COOKIE_NAME = "mm_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function sessionSecret(): string {
  const secret = envOptional(["MM_SESSION_SECRET", "SESSION_SECRET"]);
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MM_SESSION_SECRET is required in production. Set it in your environment variables.");
  }
  return "dev-only-masseurmatch-session-secret";
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "Lax" | "Strict" | "None";
    secure?: boolean;
  } = {},
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  parts.push(`Path=${options.path ?? "/"}`);
  parts.push(`SameSite=${options.sameSite ?? "Lax"}`);

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function parseSessionValue(value: string): RequestSession | null {
  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as RequestSession;
    if (!parsed?.userId || !parsed?.email || !parsed?.expiresAt) {
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

export function setSessionCookie(session: Omit<RequestSession, "expiresAt"> & { expiresAt?: string }): string {
  const expiresAt =
    session.expiresAt ?? new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const payload = encodeBase64Url(
    JSON.stringify({
      ...session,
      expiresAt,
    } satisfies RequestSession),
  );

  const secure = envAny(["NODE_ENV"], "development") === "production";
  const signedValue = `${payload}.${signPayload(payload)}`;

  return serializeCookie(COOKIE_NAME, signedValue, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "Lax",
    secure,
  });
}

export function clearSessionCookie(): string {
  const secure = envAny(["NODE_ENV"], "development") === "production";

  return serializeCookie(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "Lax",
    secure,
  });
}

export function getRequestSession(request: Request): RequestSession | null {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const raw = cookies[COOKIE_NAME];

  if (!raw) {
    return null;
  }

  return parseSessionValue(raw);
}
