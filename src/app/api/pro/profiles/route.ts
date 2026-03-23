import { json, errorResponse } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const technique = url.searchParams.get("technique");
    const tier = url.searchParams.get("tier");
    const available = url.searchParams.get("available");
    const adminClient = createSupabaseAdminClient() as any;
    let query = adminClient.from("profiles").select("*", { head: false });
    if (city) query = query.eq("city", city);
    if (technique) query = query.contains("massage_techniques", [technique]);
    if (tier) query = query.eq("tier", tier);
    if (available) query = query.eq("available_now", available === "true");
    // Adicione outros filtros conforme necessário
    const { data, error } = await query.limit(50);
    if (error) throw error;
    return json({ ok: true, profiles: data });
  } catch (error) {
    return errorResponse(error);
  }
}
