import { json, errorResponse } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const technique = url.searchParams.get("technique");
    const tier = url.searchParams.get("tier");
    const available = url.searchParams.get("available");
    const normalizedTechnique = technique?.trim().toLowerCase();
    const adminClient = createSupabaseAdminClient();
    let query = adminClient.from("profiles").select("*", { head: false });
    if (city) query = query.eq("city", city);
    if (tier) query = query.eq("subscription_tier", tier);
    if (available) query = query.eq("available_now", available === "true");
    // Adicione outros filtros conforme necessário
    const { data, error } = await query.limit(200);
    if (error) throw error;

    const profiles = (data || []).filter((profile) => {
      if (!normalizedTechnique) {
        return true;
      }

      const techniques = Array.isArray((profile as { massage_techniques?: unknown }).massage_techniques)
        ? ((profile as { massage_techniques: unknown[] }).massage_techniques as unknown[])
        : [];

      return techniques.some((value) =>
        typeof value === "string" && value.trim().toLowerCase() === normalizedTechnique,
      );
    });

    return json({ ok: true, profiles });
  } catch (error) {
    return errorResponse(error);
  }
}
