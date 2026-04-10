import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { fetchTherapistSearchResults, parseSearchFilters } from "@/lib/search";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = parseSearchFilters(url.searchParams);

    const adminClient = createSupabaseAdminClient();
    const profiles = await fetchTherapistSearchResults(adminClient, filters);

    return json({ ok: true, count: profiles.length, profiles, filters });
  } catch (error) {
    return errorResponse(error);
  }
}
