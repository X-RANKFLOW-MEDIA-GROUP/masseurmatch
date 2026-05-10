import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setSessionCookie } from "@/app/api/_lib/session";
import { withSetCookie } from "@/app/api/_lib/http";
import { envAny } from "@/app/api/_lib/env";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { isRateLimited } from "@/app/api/_lib/rate-limit";

function secureJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function POST(request: NextRequest) {
  if (
    isRateLimited(request, {
      keyPrefix: "auth-sync",
      windowMs: 60000,
      max: 15,
    })
  ) {
    return secureJson({ error: "Too many requests" }, 429);
  }

  let body: { access_token?: string };

  try {
    body = await request.json();
  } catch {
    return secureJson({ error: "Invalid body" }, 400);
  }

  const accessToken = body.access_token;

  if (!accessToken || typeof accessToken !== "string") {
    return secureJson({ error: "Missing access_token" }, 400);
  }

  const supabaseUrl = envAny(
    ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"],
    "",
  );

  const serviceKey = envAny(["SUPABASE_SERVICE_ROLE_KEY"], "");

  if (!supabaseUrl || !serviceKey) {
    return secureJson({ error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return secureJson({ error: "Invalid token" }, 401);
  }

  const { role } = await ensureUserProfileAndRole(user, {
    defaultRole: "provider",
  });

  const cookie = setSessionCookie({
    userId: user.id,
    email: user.email || user.phone || "",
    role,
  });

  return withSetCookie(secureJson({ ok: true }), cookie);
}
