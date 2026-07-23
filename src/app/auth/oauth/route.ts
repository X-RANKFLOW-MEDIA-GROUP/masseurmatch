import { createServerClient } from "@supabase/ssr";
import type { Provider } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  SUPABASE_PUBLIC_ANON_KEY,
  SUPABASE_PUBLIC_URL,
} from "@/integrations/supabase/client";

const CANONICAL_ORIGIN = "https://www.masseurmatch.com";
const ALLOWED_PROVIDERS = new Set<Provider>(["google", "apple"]);

function sanitizeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/pro/dashboard";
  }
  return value;
}

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get("provider") as Provider | null;
  const next = sanitizeNext(requestUrl.searchParams.get("next"));

  if (!provider || !ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.redirect(new URL("/login?error=unsupported_oauth_provider", requestUrl.origin));
  }

  // PKCE's verifier cookie must be created and consumed on the same host.
  // Supabase falls back to the configured Site URL when a preview/deployment
  // hostname is not allow-listed, which previously moved the callback to www
  // and caused `bad_code_verifier`. Start production OAuth only on the
  // canonical host so the verifier and callback always share one cookie jar.
  if (process.env.NODE_ENV === "production" && !isLocalHost(requestUrl.hostname) && requestUrl.origin !== CANONICAL_ORIGIN) {
    const canonicalStart = new URL("/auth/oauth", CANONICAL_ORIGIN);
    canonicalStart.searchParams.set("provider", provider);
    canonicalStart.searchParams.set("next", next);
    return NextResponse.redirect(canonicalStart);
  }

  const cookiesToSet: Array<{
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }> = [];

  const supabase = createServerClient(SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value, options }) => {
          cookiesToSet.push({ name, value, options });
        });
      },
    },
  });

  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error("[auth/oauth] failed to start OAuth:", error?.message);
    return NextResponse.redirect(new URL("/login?error=oauth_start_failed", requestUrl.origin));
  }

  const response = NextResponse.redirect(data.url);
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
