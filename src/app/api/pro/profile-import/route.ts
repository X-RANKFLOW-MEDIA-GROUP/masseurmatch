export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

async function getProviderProfile(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new RouteError(500, "Could not load your provider profile.");
  }

  if (!profile) {
    throw new RouteError(404, "Complete your provider profile before viewing historical import requests.");
  }

  return profile;
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const profile = await getProviderProfile(admin, session.userId);

    const { data, error } = await (admin as any)
      .from("profile_migrations")
      .select(
        "id, platform, source_url, status, imported_review_count, is_verified, created_at, updated_at, completed_at",
      )
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      throw new RouteError(500, "Could not load your historical import requests.");
    }

    return json({ ok: true, imports: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST() {
  return errorResponse(
    new RouteError(
      410,
      "Review import requests are no longer available. Manage your MasseurMatch profile directly from the provider dashboard.",
    ),
  );
}
