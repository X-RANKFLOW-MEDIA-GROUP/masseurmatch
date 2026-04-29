import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    // Delegate to the existing Stripe identity session creator
    const res = await fetch(
      new URL("/api/stripe/identity/create-session", request.url).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({}),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new RouteError(res.status as 400 | 401 | 403 | 404 | 500, data.error ?? "Failed to start identity verification.");
    return json({ ok: true, ...data });
  } catch (error) {
    return errorResponse(error);
  }
}
