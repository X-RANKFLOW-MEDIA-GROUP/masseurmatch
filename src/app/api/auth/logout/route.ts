import { cookies } from "next/headers";

import { json } from "@/app/api/_lib/http";
import { createServerSupabase } from "@/lib/supabase/server";

function isAuthCookie(name: string) {
  return (
    // Legacy: this build authenticates purely with Supabase SSR cookies and
    // never issues mm_session. Kept so a browser still holding one from an
    // older deploy has it cleared on logout.
    name === "mm_session" ||
    name.startsWith("sb-") ||
    name.includes("-auth-token") ||
    name.includes("code-verifier")
  );
}

export async function POST() {
  const cookieStore = await cookies();

  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    // An expired or already-revoked token must not block local logout.
  }

  for (const cookie of cookieStore.getAll()) {
    if (!isAuthCookie(cookie.name)) continue;

    cookieStore.set(cookie.name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
