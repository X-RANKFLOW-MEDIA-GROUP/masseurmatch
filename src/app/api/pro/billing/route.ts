import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/_lib/session";
import { proBillingSchema } from "@/app/_lib/validation";
import { updateSubscriptionTier } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const session = requireRequestSession(request);
    const body = await parseJsonBody(request, proBillingSchema);
    const subscription = await updateSubscriptionTier(session.userId, body.tier);

    return json({
      ok: true,
      subscription,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
