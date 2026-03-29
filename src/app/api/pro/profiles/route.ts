import { json, errorResponse } from "@/app/api/_lib/http";
import { requireSession } from "@/app/api/_lib/supabase-server";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const SAFE_FIELDS = "id, slug, city, display_name, full_name, bio, avatar_url, specialties, _tier, modality, status, available_now, available_now_expires, is_verified_identity, is_verified_profile, neighborhood_name, primary_area, years_experience";

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const technique = url.searchParams.get("technique");
    const tier = url.searchParams.get("tier");
    const available = url.searchParams.get("available");
    const adminClient = createSupabaseAdminClient() as any;
    let query = adminClient.from("profiles").select(SAFE_FIELDS, { head: false });
    if (city) query = query.eq("city", city);
    if (technique) query = query.contains("massage_techniques", [technique]);
    if (tier) query = query.eq("_tier", tier);
    if (available === "true") {
      query = query.eq("available_now", true).gt("available_now_expires", new Date().toISOString());
    }
    const { data, error } = await query.limit(50);
    if (error) throw error;
    return json({ ok: true, profiles: data });
  } catch (error) {
    return errorResponse(error);
  }
}
