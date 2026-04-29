import { errorResponse, json } from "@/app/api/_lib/http";
import { getAvailableNowProfile } from "@/app/_lib/store";
import { requireRequestSession } from "@/app/_lib/session";

function normalizePlanKey(value: string | null | undefined) {
  if (value === "free" || value === "standard" || value === "pro" || value === "elite") {
    return value;
  }

  return "free";
}

function getPlanName(planKey: string) {
  if (planKey === "standard") return "Standard";
  if (planKey === "pro") return "Pro";
  if (planKey === "elite") return "Elite";
  return "Free";
}

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const profile = await getAvailableNowProfile(session.userId);
    const planKey = normalizePlanKey(profile?.subscription_tier);

    return json({
      ok: true,
      subscribed: planKey !== "free",
      plan_key: planKey,
      plan_name: getPlanName(planKey),
      subscription_end: null,
      trial_end: null,
      is_trial: false,
      has_founder_discount: false,
      status: planKey === "free" ? "free" : "active",
      config_error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
