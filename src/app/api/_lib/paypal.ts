import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import type { TablesInsert } from "@/integrations/supabase/types";

export type PayPalPlanKey = "standard" | "pro" | "elite";
type LocalSubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
type PayPalEnvironment = "live" | "sandbox";

export const PAYPAL_PLAN_IDS: Record<PayPalPlanKey, string> = {
  standard: "P-0LK9851678808213YNJ5TSKQ",
  pro: "P-6DG73865LJ933653NNJ5TU4Q",
  elite: "P-9US760508D1062104NJ5TX7Y",
};

const PLAN_BY_ID = new Map(Object.entries(PAYPAL_PLAN_IDS).map(([key, id]) => [id, key as PayPalPlanKey]));

export function getPayPalPlanKey(planId: string | null | undefined): PayPalPlanKey | null {
  if (!planId) return null;
  return PLAN_BY_ID.get(planId) ?? null;
}

export function getPayPalEnvironment(): PayPalEnvironment {
  const environment = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase();
  if (environment !== "live" && environment !== "sandbox") {
    throw new Error("PAYPAL_ENVIRONMENT must be configured as either live or sandbox.");
  }
  if (process.env.VERCEL_ENV === "production" && environment !== "live") {
    throw new Error("Production PayPal billing requires PAYPAL_ENVIRONMENT=live.");
  }
  return environment;
}

export function getPayPalBaseUrl() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) throw new Error("PayPal credentials are not configured.");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Could not authenticate with PayPal.");
  }
  return payload.access_token;
}

export async function paypalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as T & { message?: string; details?: Array<{ description?: string }> };
  if (!response.ok) {
    const description = payload.details?.[0]?.description;
    throw new Error(description || payload.message || `PayPal request failed (${response.status}).`);
  }
  return payload;
}

type PayPalSubscription = {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  start_time?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: { time?: string };
    failed_payments_count?: number;
  };
};

function mapPayPalStatus(status: string, hasPayment: boolean): LocalSubscriptionStatus {
  const value = status.toUpperCase();
  if (value === "ACTIVE") return hasPayment ? "active" : "trialing";
  if (value === "SUSPENDED") return "past_due";
  if (value === "CANCELLED") return "canceled";
  if (value === "EXPIRED") return "expired";
  return "past_due";
}

export async function syncPayPalSubscription(subscription: PayPalSubscription) {
  const planKey = getPayPalPlanKey(subscription.plan_id);
  if (!planKey) throw new Error(`Unknown PayPal plan: ${subscription.plan_id}`);

  const userId = subscription.custom_id;
  if (!userId) throw new Error("PayPal subscription is missing custom_id.");

  const admin = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (profileError || !profile) throw new Error("Provider profile not found for PayPal subscription.");

  const { data: plan, error: planError } = await admin
    .from("subscription_plans")
    .select("id")
    .eq("code", planKey)
    .single();
  if (planError || !plan) throw new Error(`Subscription plan ${planKey} not found.`);

  const hasPayment = Boolean(subscription.billing_info?.last_payment?.time);
  const localStatus = mapPayPalStatus(subscription.status, hasPayment);
  const isEntitled = localStatus === "trialing" || localStatus === "active";
  const nextBilling = subscription.billing_info?.next_billing_time ?? null;
  const currentTier = isEntitled ? planKey : "free";

  const { data: existing } = await admin
    .from("therapist_subscriptions")
    .select("id")
    .eq("provider", "paypal")
    .eq("provider_subscription_id", subscription.id)
    .maybeSingle();

  const row: TablesInsert<"therapist_subscriptions"> = {
    therapist_profile_id: profile.id,
    profile_id: profile.id,
    plan_id: plan.id,
    provider: "paypal",
    provider_subscription_id: subscription.id,
    status: localStatus,
    current_period_start: subscription.start_time ?? null,
    current_period_end: nextBilling,
    cancel_at_period_end: localStatus === "canceled",
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await admin.from("therapist_subscriptions").update(row).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("therapist_subscriptions").insert(row);
    if (error) throw new Error(error.message);
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      subscription_tier: currentTier,
      subscription_status: localStatus,
      current_period_end: nextBilling,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);
  if (updateError) throw new Error(updateError.message);

  return { planKey, localStatus, profileId: profile.id, nextBilling };
}

export async function fetchPayPalSubscription(subscriptionId: string) {
  return paypalRequest<PayPalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}
