import { NextRequest, NextResponse } from "next/server";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isRateLimited } from "@/app/api/_lib/rate-limit";

function secureJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

/**
 * Compatibility endpoint. Supabase SSR stores the browser session in auth
 * cookies, so this only confirms the current cookie session and ensures the
 * profile and role rows exist.
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(request, { keyPrefix: "auth-sync", windowMs: 60000, max: 15 })) {
    return secureJson({ error: "Too many requests" }, 429);
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return secureJson({ ok: false, error: "Not authenticated" }, 401);
  }

  const { role } = await ensureUserProfileAndRole(user, { defaultRole: "provider" });
  return secureJson({ ok: true, role });
}
