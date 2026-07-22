import { createServerClient } from "@supabase/ssr";

import { RouteError } from "@/app/api/_lib/http";
import {
  SUPABASE_PUBLIC_URL,
  SUPABASE_PUBLIC_ANON_KEY,
} from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface RequestSession {
  userId: string;
  email: string;
  role: "admin" | "provider" | "client" | null;
  expiresAt: string;
}

export function normalizeSessionRole(value: unknown): RequestSession["role"] {
  if (value === "admin") return "admin";
  if (value === "provider" || value === "therapist" || value === "masseur") return "provider";
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

export function supabaseFromRequest(request: Request) {
  const cookies = parseRequestCookies(request);
  return createServerClient<Database>(
    SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookies;
        },
        setAll() {
          // Middleware rotates cookies on document navigations.
        },
      },
    },
  );
}

export async function getRequestSession(request: Request): Promise<RequestSession | null> {
  const supabase = supabaseFromRequest(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const role =
    normalizeSessionRole((user.app_metadata as Record<string, unknown> | undefined)?.role) ??
    normalizeSessionRole((user.user_metadata as Record<string, unknown> | undefined)?.role);

  return {
    userId: user.id,
    email: user.email ?? "",
    role,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

export async function requireRequestSession(request: Request): Promise<RequestSession> {
  const session = await getRequestSession(request);
  if (!session) throw new RouteError(401, "Authentication required.");
  return session;
}
