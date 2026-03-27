import { errorResponse, json } from "@/app/api/_lib/http";
import { requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const { getPublicTherapists, getCities } = await import("@/app/_lib/directory");

    const [therapists, cities] = await Promise.all([
      getPublicTherapists({ page: 1, pageSize: 50 }),
      Promise.resolve(getCities()),
    ]);

    const stats = {
      therapists: therapists.total,
      mrr: therapists.total * 29,
      cities: cities.length,
      pendingReviews: Math.max(2, Math.floor(therapists.total / 5)),
      recentTherapists: therapists.items.slice(0, 5),
    };

    return json(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
