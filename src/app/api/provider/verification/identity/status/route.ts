import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    // Delegate to the existing Stripe identity check-status route
    const res = await fetch(
      new URL("/api/stripe/identity/check-status", request.url).toString(),
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new RouteError(res.status as 400 | 401 | 403 | 404 | 500, data.error ?? "Failed to check identity status.");
    return json({ ok: true, ...data });
  } catch (error) {
    return errorResponse(error);
  }
}
