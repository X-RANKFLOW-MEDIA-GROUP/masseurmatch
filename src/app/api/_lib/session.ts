import { createServerClient } from "@supabase/ssr";

import { RouteError } from "@/app/api/_lib/http";
import type { Database } from "@/integrations/supabase/types";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";

export interface RequestSession {
  userId: string;
  email: string;
  role: "admin" | "provider" | "client" | null;
  /**
   * ISO timestamp retained for backward compatibility with callers that surface
   * it. Identity is always re-verified against Supabase.
   */
  expiresAt: string;
}

export function normalizeSessionRole(value: unknown): RequestSession["role"] {
  if (value === "admin") return "admin";
  if (value === "provider" || value === "therapist" || value === "masseur") {
    return "provider";
  }
  if (value === "client") return "client";
  return null;
}

interface ParsedCookie {
  name: string;
  value: string;
}

function parseRequestCookies(request: Request): ParsedCookie[] {
  const header = request.headers.get("cookie");
  if (!header) return [];

  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      if (eq === -1) return { name: part, value: "" };
      return {
        name: part.slice(0, eq).trim(),
        value: decodeURIComponent(part.slice(eq + 1).trim()),
      };
    });
}

/**
 * Builds a read-only, cookie-bound Supabase client from an incoming request.
 */
export function supabaseFromRequest(request: Request) {
  const cookies = parseRequestCookies(request);
  const { url, key } = getPublicSupabaseConfig();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookies;
      },
      setAll() {
        // No mutable response in a bare route-handler context.
      },
    },
  });
}

/**
 * Returns the verified session for the request, or null when unauthenticated.
 */
export async function getRequestSession(
  request: Request,
): Promise<RequestSession | null> {
  const supabase = supabaseFromRequest(request);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role =
    normalizeSessionRole(
      (user.app_metadata as Record<string, unknown> | undefined)?.role,
    ) ??
    normalizeSessionRole(
      (user.user_metadata as Record<string, unknown> | undefined)?.role,
    );

  return {
    userId: user.id,
    email: user.email ?? "",
    role,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

export async function requireRequestSession(
  request: Request,
): Promise<RequestSession> {
  const session = await getRequestSession(request);

  if (!session) {
    throw new RouteError(401, "Authentication required.");
  }

  return session;
}
