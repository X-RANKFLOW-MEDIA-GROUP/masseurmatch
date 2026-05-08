"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  billing_interval: string;
  max_photos: number;
  can_feature: boolean;
};

export default function BillingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [therapistProfileId, setTherapistProfileId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      setProfileId(userId);

      const { data: planRows } = await (supabase as any)
        .from("subscription_plans")
        .select("id, code, name, description, price_cents, currency, billing_interval, max_photos, can_feature")
        .eq("is_active", true)
        .order("priority_rank", { ascending: true });

      setPlans(planRows || []);

      if (userId) {
        const { data: therapist } = await (supabase as any)
          .from("therapist_profiles")
          .select("id")
          .eq("profile_id", userId)
          .maybeSingle();

        setTherapistProfileId(therapist?.id ?? null);

        if (therapist?.id) {
          const { data: sub } = await (supabase as any)
            .from("therapist_subscriptions")
            .select("status, current_period_end, subscription_plans(name, code)")
            .eq("therapist_profile_id", therapist.id)
            .maybeSingle();
          setSubscription(sub);
        }
      }

      setLoading(false);
    }

    load();
  }, []);

  async function checkout(planCode: string) {
    if (!profileId || !therapistProfileId) {
      setMessage("Sign in and complete your therapist profile before checkout.");
      return;
    }

    setMessage("Opening secure checkout...");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planCode, profileId, therapistProfileId }),
    });

    const result = await response.json();
    if (!response.ok || !result.url) {
      setMessage(result.error || "Checkout could not be started.");
      return;
    }

    window.location.href = result.url;
  }

  if (loading) return <main className="mx-auto max-w-6xl p-6">Loading billing...</main>;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Billing</p>
        <h1 className="mt-2 text-3xl font-semibold">Manage your subscription</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">Upgrade profile visibility, unlock more photos, and activate priority placement across city pages.</p>
        {subscription && (
          <div className="mt-6 rounded-2xl bg-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Current plan</p>
            <p className="text-xl font-semibold">{subscription.subscription_plans?.name || "Active plan"}</p>
            <p className="text-sm capitalize text-neutral-600">Status: {subscription.status}</p>
          </div>
        )}
        {message && <p className="mt-4 rounded-2xl bg-neutral-100 p-3 text-sm">{message}</p>}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="flex flex-col rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-2 min-h-12 text-sm text-neutral-600">{plan.description}</p>
            <p className="mt-5 text-4xl font-semibold">${(plan.price_cents / 100).toFixed(0)}<span className="text-base font-normal text-neutral-500">/{plan.billing_interval}</span></p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-neutral-700">
              <li>{plan.max_photos} profile photos</li>
              <li>{plan.can_feature ? "Featured placement eligible" : "Standard city placement"}</li>
              <li>Direct contact profile</li>
              <li>SEO city page visibility</li>
            </ul>
            <button onClick={() => checkout(plan.code)} className="mt-6 rounded-2xl bg-black px-5 py-3 font-semibold text-white">Choose {plan.name}</button>
          </article>
        ))}
      </section>
    </main>
  );
}
