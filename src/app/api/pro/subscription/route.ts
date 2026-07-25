import { errorResponse, json } from "@/app/api/_lib/http";
import { getAvailableNowProfile } from "@/app/_lib/store";
import { requireRequestSession } from "@/app/api/_lib/session";

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
    const session = await requireRequestSession(request);
    const profile = await getAvailableNowProfile(session.userId);
    const planKey = normalizePlanKey(profile?.subscription_tier);
    // During a Stripe trial the current period end IS the trial end.
    const isTrial = planKey !== "free" && profile?.subscription_status === "trialing";

    return json({
      ok: true,
      subscribed: planKey !== "free",
      plan_key: planKey,
      plan_name: getPlanName(planKey),
      subscription_end: profile?.current_period_end ?? null,
      trial_end: isTrial ? profile?.current_period_end ?? null : null,
      is_trial: isTrial,
      has_founder_discount: false,
      status: planKey === "free" ? "free" : isTrial ? "trialing" : "active",
      config_error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
