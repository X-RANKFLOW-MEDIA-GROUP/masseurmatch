import Stripe from "npm:stripe@17.7.0";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim() ?? "";
  if (!value) throw new Error(`missing_${name}`);
  return value;
}

async function beginEventProcessing(
  db: SupabaseClient,
  event: Stripe.Event,
): Promise<"process" | "duplicate"> {
  const now = new Date().toISOString();
  const { error: insertError } = await db.from("stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
    processing_status: "processing",
    processed_at: now,
    processing_error: null,
    failed_at: null,
  });

  if (!insertError) return "process";
  if (insertError.code !== "23505") {
    throw new Error(`stripe_event_persist_failed:${insertError.code || "unknown"}`);
  }

  const { data: existing, error: existingError } = await db
    .from("stripe_events")
    .select("processing_status, processed_at")
    .eq("stripe_event_id", event.id)
    .single();
  if (existingError || !existing) {
    throw new Error(`stripe_event_lookup_failed:${existingError?.code || "unknown"}`);
  }

  if (existing.processing_status === "processed") return "duplicate";

  const lastAttemptAt = new Date(existing.processed_at).getTime();
  const stale = !Number.isFinite(lastAttemptAt) || Date.now() - lastAttemptAt > 10 * 60_000;
  if (existing.processing_status === "processing" && !stale) {
    throw new Error("stripe_event_already_processing");
  }

  const { error: retryError } = await db
    .from("stripe_events")
    .update({
      processing_status: "processing",
      processed_at: now,
      processing_error: null,
      failed_at: null,
      payload: event as unknown as Record<string, unknown>,
    })
    .eq("stripe_event_id", event.id);
  if (retryError) throw new Error(`stripe_event_retry_state_failed:${retryError.code || "unknown"}`);

  return "process";
}

async function resolveCanonicalProfileId(
  db: SupabaseClient,
  metadata: Record<string, string> | null | undefined,
): Promise<string | null> {
  const profileId = metadata?.profile_id?.trim();
  if (profileId) return profileId;

  const legacyId = metadata?.therapist_profile_id?.trim();
  if (!legacyId) return null;

  const { data, error } = await db
    .from("therapist_profiles")
    .select("profile_id")
    .eq("id", legacyId)
    .maybeSingle();
  if (error) throw new Error(`legacy_profile_mapping_failed:${error.code || "unknown"}`);
  return data?.profile_id ?? null;
}

async function resolvePlanId(db: SupabaseClient, planCode: string): Promise<string> {
  const { data: plan, error } = await db
    .from("subscription_plans")
    .select("id")
    .eq("code", planCode)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !plan) throw new Error("subscription_plan_not_found");
  return plan.id;
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "expired",
    paused: "expired",
  };
  return statusMap[status] ?? "past_due";
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply({ error: "method_not_allowed" }, 405);

  let db: SupabaseClient | null = null;
  let eventId: string | null = null;

  try {
    const stripeSecretKey = requiredEnv("STRIPE_SECRET_KEY");
    const endpointSecret = requiredEnv("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const signature = request.headers.get("stripe-signature")?.trim() ?? "";
    if (!signature) return reply({ error: "missing_signature" }, 400);

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });
    const rawBody = await request.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, endpointSecret);
    } catch {
      return reply({ error: "invalid_webhook_signature" }, 400);
    }

    eventId = event.id;
    db = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if ((await beginEventProcessing(db, event)) === "duplicate") {
      return reply({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};
      const profileId = await resolveCanonicalProfileId(db, metadata);
      const legacyProfileId = metadata.therapist_profile_id?.trim() || null;
      const planCode = metadata.plan_code?.trim() || metadata.masseurmatch_plan?.trim() || "";

      if (!profileId || !planCode) throw new Error("checkout_metadata_incomplete");
      const planId = await resolvePlanId(db, planCode);
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || "";

      if (customerId) {
        const { error: profileError } = await db
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", profileId);
        if (profileError) throw new Error(`profile_billing_update_failed:${profileError.code || "unknown"}`);
      }

      const { error: checkoutError } = await db.from("checkout_sessions").upsert(
        {
          profile_id: profileId,
          therapist_profile_id: legacyProfileId,
          plan_id: planId,
          stripe_checkout_session_id: session.id,
          stripe_customer_id: customerId || null,
          status: "complete",
          metadata: session as unknown as Record<string, unknown>,
        },
        { onConflict: "stripe_checkout_session_id" },
      );
      if (checkoutError) throw new Error(`checkout_persist_failed:${checkoutError.code || "unknown"}`);

      if (typeof session.subscription === "string" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const { error: subscriptionError } = await db.from("therapist_subscriptions").upsert(
          {
            profile_id: profileId,
            therapist_profile_id: legacyProfileId,
            plan_id: planId,
            status: mapSubscriptionStatus(subscription.status),
            provider: "stripe",
            provider_subscription_id: subscription.id,
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: "profile_id" },
        );
        if (subscriptionError) throw new Error(`subscription_persist_failed:${subscriptionError.code || "unknown"}`);
      }
    }

    if (event.type.startsWith("customer.subscription.")) {
      const subscription = event.data.object as Stripe.Subscription;
      const metadata = subscription.metadata ?? {};
      const profileId = await resolveCanonicalProfileId(db, metadata);
      const legacyProfileId = metadata.therapist_profile_id?.trim() || null;
      const planCode = metadata.plan_code?.trim() || metadata.masseurmatch_plan?.trim() || "";

      if (!profileId || !planCode) throw new Error("subscription_metadata_incomplete");
      const planId = await resolvePlanId(db, planCode);

      const { error: subscriptionError } = await db.from("therapist_subscriptions").upsert(
        {
          profile_id: profileId,
          therapist_profile_id: legacyProfileId,
          plan_id: planId,
          status: mapSubscriptionStatus(subscription.status),
          provider: "stripe",
          provider_subscription_id: subscription.id,
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : null,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        { onConflict: "profile_id" },
      );
      if (subscriptionError) throw new Error(`subscription_persist_failed:${subscriptionError.code || "unknown"}`);
    }

    const { error: completeError } = await db
      .from("stripe_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
        processing_error: null,
        failed_at: null,
      })
      .eq("stripe_event_id", event.id);
    if (completeError) throw new Error(`stripe_event_complete_state_failed:${completeError.code || "unknown"}`);

    return reply({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stripe-webhook] Processing failed", { eventId, error: message });

    if (db && eventId) {
      await db
        .from("stripe_events")
        .update({
          processing_status: "failed",
          processing_error: message.slice(0, 1000),
          failed_at: new Date().toISOString(),
        })
        .eq("stripe_event_id", eventId);
    }

    if (message.startsWith("missing_")) return reply({ error: "webhook_not_configured" }, 503);
    if (message === "stripe_event_already_processing") return reply({ error: "event_processing" }, 409);
    return reply({ error: "webhook_processing_failed" }, 500);
  }
});
