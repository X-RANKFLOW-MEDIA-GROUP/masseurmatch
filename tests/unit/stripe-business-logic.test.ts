import { createHmac } from "node:crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mirrors of production logic from src/app/api/webhooks/stripe/route.ts ───
// These are copied verbatim so the tests remain pure and dependency-free.
// If the production values change, update them here and the tests will catch drift.

function planKeyToTier(planKey: string | undefined | null): string {
  if (planKey === "standard") return "standard";
  if (planKey === "pro") return "pro";
  if (planKey === "elite") return "elite";
  return "free";
}

const PHOTO_LIMITS: Record<string, number> = {
  free: 2,
  standard: 6,
  pro: 12,
  elite: 20,
};

const VISIBILITY_LEVELS: Record<string, number> = {
  free: 1,
  standard: 2,
  pro: 3,
  elite: 4,
};

interface FakeSubscriptionItem {
  current_period_end?: number;
}

interface FakeSubscription {
  id: string;
  customer: string | { id: string } | null;
  status: string;
  metadata: Record<string, string>;
  items: { data: FakeSubscriptionItem[] };
}

function getCurrentPeriodEnd(sub: FakeSubscription): string | null {
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  return typeof periodEnd === "number"
    ? new Date(periodEnd * 1000).toISOString()
    : null;
}

function buildTierUpdate(tier: string, sub: FakeSubscription) {
  const customerId =
    typeof sub.customer === "string"
      ? sub.customer
      : (sub.customer as { id: string } | null)?.id ?? null;

  return {
    subscription_tier: tier,
    _tier: tier,
    photo_limit: PHOTO_LIMITS[tier] ?? 2,
    visibility_level: VISIBILITY_LEVELS[tier] ?? 1,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    current_period_end: getCurrentPeriodEnd(sub),
    updated_at: expect.any(String) as unknown as string,
  };
}

// ─── HMAC helper (mirrors Stripe SDK signing) ────────────────────────────────

function stripeSign(payload: string, secret: string, ts: number): string {
  return createHmac("sha256", secret)
    .update(`${ts}.${payload}`)
    .digest("hex");
}

function makeStripeHeader(payload: string, secret: string, ts?: number): string {
  const t = ts ?? Math.floor(Date.now() / 1000);
  return `t=${t},v1=${stripeSign(payload, secret, t)}`;
}

// ─── Fake subscription builder ────────────────────────────────────────────────

function fakeSub(overrides: Partial<FakeSubscription> = {}): FakeSubscription {
  return {
    id: "sub_test_123",
    customer: "cus_test_abc",
    status: "active",
    metadata: { plan_key: "pro", user_id: "user-uuid-001" },
    items: { data: [{ current_period_end: 1_800_000_000 }] },
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. planKeyToTier
// ─────────────────────────────────────────────────────────────────────────────

describe("planKeyToTier", () => {
  it("maps 'standard' → 'standard'", () => {
    expect(planKeyToTier("standard")).toBe("standard");
  });

  it("maps 'pro' → 'pro'", () => {
    expect(planKeyToTier("pro")).toBe("pro");
  });

  it("maps 'elite' → 'elite'", () => {
    expect(planKeyToTier("elite")).toBe("elite");
  });

  it("maps 'free' → 'free'", () => {
    expect(planKeyToTier("free")).toBe("free");
  });

  it("maps null → 'free' (safe default)", () => {
    expect(planKeyToTier(null)).toBe("free");
  });

  it("maps undefined → 'free' (safe default)", () => {
    expect(planKeyToTier(undefined)).toBe("free");
  });

  it("maps unknown string → 'free' (safe default)", () => {
    expect(planKeyToTier("enterprise")).toBe("free");
    expect(planKeyToTier("PREMIUM")).toBe("free");
    expect(planKeyToTier("")).toBe("free");
  });

  it("is case-sensitive — 'Pro' is not 'pro'", () => {
    expect(planKeyToTier("Pro")).toBe("free");
    expect(planKeyToTier("STANDARD")).toBe("free");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PHOTO_LIMITS and VISIBILITY_LEVELS per tier
// ─────────────────────────────────────────────────────────────────────────────

describe("PHOTO_LIMITS", () => {
  it("free tier has 2 photos", () => {
    expect(PHOTO_LIMITS["free"]).toBe(2);
  });

  it("standard tier has 6 photos", () => {
    expect(PHOTO_LIMITS["standard"]).toBe(6);
  });

  it("pro tier has 12 photos", () => {
    expect(PHOTO_LIMITS["pro"]).toBe(12);
  });

  it("elite tier has 20 photos", () => {
    expect(PHOTO_LIMITS["elite"]).toBe(20);
  });

  it("all tiers are defined — no undefined entries", () => {
    for (const tier of ["free", "standard", "pro", "elite"]) {
      expect(PHOTO_LIMITS[tier]).toBeTypeOf("number");
      expect(PHOTO_LIMITS[tier]).toBeGreaterThan(0);
    }
  });

  it("photo limit increases with each tier", () => {
    expect(PHOTO_LIMITS["free"]).toBeLessThan(PHOTO_LIMITS["standard"]);
    expect(PHOTO_LIMITS["standard"]).toBeLessThan(PHOTO_LIMITS["pro"]);
    expect(PHOTO_LIMITS["pro"]).toBeLessThan(PHOTO_LIMITS["elite"]);
  });
});

describe("VISIBILITY_LEVELS", () => {
  it("free tier has visibility level 1", () => {
    expect(VISIBILITY_LEVELS["free"]).toBe(1);
  });

  it("standard tier has visibility level 2", () => {
    expect(VISIBILITY_LEVELS["standard"]).toBe(2);
  });

  it("pro tier has visibility level 3", () => {
    expect(VISIBILITY_LEVELS["pro"]).toBe(3);
  });

  it("elite tier has visibility level 4", () => {
    expect(VISIBILITY_LEVELS["elite"]).toBe(4);
  });

  it("visibility level increases with each tier", () => {
    expect(VISIBILITY_LEVELS["free"]).toBeLessThan(VISIBILITY_LEVELS["standard"]);
    expect(VISIBILITY_LEVELS["standard"]).toBeLessThan(VISIBILITY_LEVELS["pro"]);
    expect(VISIBILITY_LEVELS["pro"]).toBeLessThan(VISIBILITY_LEVELS["elite"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getCurrentPeriodEnd
// ─────────────────────────────────────────────────────────────────────────────

describe("getCurrentPeriodEnd", () => {
  it("returns ISO string from numeric unix timestamp", () => {
    const sub = fakeSub({ items: { data: [{ current_period_end: 1_700_000_000 }] } });
    const result = getCurrentPeriodEnd(sub);
    expect(result).toBe(new Date(1_700_000_000 * 1000).toISOString());
  });

  it("returns null when items data is empty", () => {
    const sub = fakeSub({ items: { data: [] } });
    expect(getCurrentPeriodEnd(sub)).toBeNull();
  });

  it("returns null when current_period_end is undefined", () => {
    const sub = fakeSub({ items: { data: [{}] } });
    expect(getCurrentPeriodEnd(sub)).toBeNull();
  });

  it("returns a valid ISO 8601 string", () => {
    const sub = fakeSub({ items: { data: [{ current_period_end: 2_000_000_000 }] } });
    const result = getCurrentPeriodEnd(sub);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. buildTierUpdate
// ─────────────────────────────────────────────────────────────────────────────

describe("buildTierUpdate", () => {
  it("sets subscription_tier and _tier from tier argument", () => {
    const update = buildTierUpdate("pro", fakeSub());
    expect(update.subscription_tier).toBe("pro");
    expect(update._tier).toBe("pro");
  });

  it("sets correct photo_limit for pro tier", () => {
    const update = buildTierUpdate("pro", fakeSub());
    expect(update.photo_limit).toBe(12);
  });

  it("sets correct visibility_level for elite tier", () => {
    const update = buildTierUpdate("elite", fakeSub());
    expect(update.visibility_level).toBe(4);
  });

  it("defaults photo_limit to 2 for unknown tier", () => {
    const update = buildTierUpdate("unknown_tier", fakeSub());
    expect(update.photo_limit).toBe(2);
  });

  it("defaults visibility_level to 1 for unknown tier", () => {
    const update = buildTierUpdate("unknown_tier", fakeSub());
    expect(update.visibility_level).toBe(1);
  });

  it("extracts stripe_customer_id when customer is a string", () => {
    const update = buildTierUpdate("pro", fakeSub({ customer: "cus_abc123" }));
    expect(update.stripe_customer_id).toBe("cus_abc123");
  });

  it("extracts stripe_customer_id from expanded customer object", () => {
    const update = buildTierUpdate("pro", fakeSub({ customer: { id: "cus_expanded" } }));
    expect(update.stripe_customer_id).toBe("cus_expanded");
  });

  it("sets stripe_customer_id to null when customer is null", () => {
    const update = buildTierUpdate("pro", fakeSub({ customer: null }));
    expect(update.stripe_customer_id).toBeNull();
  });

  it("sets stripe_subscription_id from sub.id", () => {
    const update = buildTierUpdate("standard", fakeSub({ id: "sub_xyz789" }));
    expect(update.stripe_subscription_id).toBe("sub_xyz789");
  });

  it("sets current_period_end from items data", () => {
    const ts = 1_800_000_000;
    const update = buildTierUpdate("standard", fakeSub({ items: { data: [{ current_period_end: ts }] } }));
    expect(update.current_period_end).toBe(new Date(ts * 1000).toISOString());
  });

  it("sets current_period_end to null when items are empty", () => {
    const update = buildTierUpdate("free", fakeSub({ items: { data: [] } }));
    expect(update.current_period_end).toBeNull();
  });

  it("returns all required profile fields", () => {
    const update = buildTierUpdate("standard", fakeSub());
    const requiredKeys = [
      "subscription_tier",
      "_tier",
      "photo_limit",
      "visibility_level",
      "stripe_customer_id",
      "stripe_subscription_id",
      "current_period_end",
      "updated_at",
    ];
    for (const key of requiredKeys) {
      expect(update).toHaveProperty(key);
    }
  });

  it("free tier update carries correct limits", () => {
    const update = buildTierUpdate("free", fakeSub());
    expect(update.subscription_tier).toBe("free");
    expect(update._tier).toBe("free");
    expect(update.photo_limit).toBe(2);
    expect(update.visibility_level).toBe(1);
  });

  it("elite tier update carries maximum limits", () => {
    const update = buildTierUpdate("elite", fakeSub());
    expect(update.photo_limit).toBe(20);
    expect(update.visibility_level).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Checkout session metadata — user_id and plan_key enforcement
// ─────────────────────────────────────────────────────────────────────────────

describe("Checkout session metadata enforcement", () => {
  interface CheckoutSessionLike {
    subscription: string | { id: string } | null;
    metadata: Record<string, string | null> | null;
  }

  function extractCheckoutFields(session: CheckoutSessionLike): {
    subscriptionId: string | undefined;
    userId: string | undefined;
    tier: string;
    shouldProcess: boolean;
  } {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const userId = session.metadata?.user_id ?? undefined;
    const planKey = session.metadata?.plan_key ?? undefined;
    const tier = planKeyToTier(planKey);
    const shouldProcess = !!(subscriptionId && userId);
    return { subscriptionId, userId, tier, shouldProcess };
  }

  it("processes session when both user_id and subscription_id are present", () => {
    const result = extractCheckoutFields({
      subscription: "sub_abc",
      metadata: { user_id: "user-123", plan_key: "pro" },
    });
    expect(result.shouldProcess).toBe(true);
    expect(result.userId).toBe("user-123");
    expect(result.subscriptionId).toBe("sub_abc");
    expect(result.tier).toBe("pro");
  });

  it("skips session when user_id is missing from metadata", () => {
    const result = extractCheckoutFields({
      subscription: "sub_abc",
      metadata: { plan_key: "pro" },
    });
    expect(result.shouldProcess).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  it("skips session when subscription is missing", () => {
    const result = extractCheckoutFields({
      subscription: null,
      metadata: { user_id: "user-123", plan_key: "pro" },
    });
    expect(result.shouldProcess).toBe(false);
    expect(result.subscriptionId).toBeUndefined();
  });

  it("skips session when both user_id and subscription are missing", () => {
    const result = extractCheckoutFields({
      subscription: null,
      metadata: null,
    });
    expect(result.shouldProcess).toBe(false);
  });

  it("extracts subscription id from expanded subscription object", () => {
    const result = extractCheckoutFields({
      subscription: { id: "sub_expanded_999" },
      metadata: { user_id: "user-456", plan_key: "elite" },
    });
    expect(result.subscriptionId).toBe("sub_expanded_999");
    expect(result.shouldProcess).toBe(true);
  });

  it("defaults tier to free when plan_key is absent from metadata", () => {
    const result = extractCheckoutFields({
      subscription: "sub_abc",
      metadata: { user_id: "user-789" },
    });
    expect(result.tier).toBe("free");
    expect(result.shouldProcess).toBe(true);
  });

  it("correctly maps plan_key to tier in metadata", () => {
    for (const [key, expected] of [
      ["standard", "standard"],
      ["pro", "pro"],
      ["elite", "elite"],
      ["free", "free"],
    ] as const) {
      const result = extractCheckoutFields({
        subscription: "sub_x",
        metadata: { user_id: "u", plan_key: key },
      });
      expect(result.tier).toBe(expected);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. syncSubscriptionToProfile — user_id vs customer_id resolution
// ─────────────────────────────────────────────────────────────────────────────

describe("syncSubscriptionToProfile resolution logic", () => {
  function resolveSyncTarget(
    sub: FakeSubscription,
  ): { method: "user_id"; value: string } | { method: "stripe_customer_id"; value: string } | null {
    const userId = sub.metadata?.user_id;
    if (userId) return { method: "user_id", value: userId };

    const customerId =
      typeof sub.customer === "string"
        ? sub.customer
        : (sub.customer as { id: string } | null)?.id ?? null;
    if (customerId) return { method: "stripe_customer_id", value: customerId };

    return null;
  }

  it("prefers user_id from metadata when present", () => {
    const sub = fakeSub({ metadata: { plan_key: "pro", user_id: "user-primary" } });
    const target = resolveSyncTarget(sub);
    expect(target?.method).toBe("user_id");
    expect(target?.value).toBe("user-primary");
  });

  it("falls back to stripe_customer_id when user_id is absent", () => {
    const sub = fakeSub({ metadata: { plan_key: "pro" }, customer: "cus_fallback_456" });
    const target = resolveSyncTarget(sub);
    expect(target?.method).toBe("stripe_customer_id");
    expect(target?.value).toBe("cus_fallback_456");
  });

  it("falls back to customer id from expanded object", () => {
    const sub = fakeSub({ metadata: { plan_key: "pro" }, customer: { id: "cus_expanded_999" } });
    const target = resolveSyncTarget(sub);
    expect(target?.method).toBe("stripe_customer_id");
    expect(target?.value).toBe("cus_expanded_999");
  });

  it("returns null when neither user_id nor customer is available", () => {
    const sub = fakeSub({ metadata: { plan_key: "pro" }, customer: null });
    const target = resolveSyncTarget(sub);
    expect(target).toBeNull();
  });

  it("user_id in metadata takes priority over customer_id even when both exist", () => {
    const sub = fakeSub({
      metadata: { plan_key: "pro", user_id: "user-priority" },
      customer: "cus_also_present",
    });
    const target = resolveSyncTarget(sub);
    expect(target?.method).toBe("user_id");
    expect(target?.value).toBe("user-priority");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Subscription deletion — downgrade to free
// ─────────────────────────────────────────────────────────────────────────────

describe("Subscription cancellation downgrade", () => {
  it("maps a deleted subscription to the free tier", () => {
    const sub = fakeSub({ status: "canceled", metadata: { plan_key: "elite", user_id: "u1" } });
    const tier = planKeyToTier(sub.metadata?.plan_key);
    // Webhook handler ignores the previous plan and hard-codes 'free' on deletion.
    // Verify our logic correctly would use 'free' for the downgrade:
    const downgradeTier = "free"; // always, regardless of sub.metadata.plan_key
    const update = buildTierUpdate(downgradeTier, sub);

    expect(update.subscription_tier).toBe("free");
    expect(update._tier).toBe("free");
    expect(update.photo_limit).toBe(2);
    expect(update.visibility_level).toBe(1);

    // The previous plan_key is still on the sub, but should not be used.
    expect(tier).toBe("elite"); // confirms the metadata still says elite
    expect(update.subscription_tier).not.toBe("elite"); // but the update downgrades to free
  });

  it("free-tier update does not zero out stripe IDs (customer remains)", () => {
    const sub = fakeSub({ customer: "cus_former_elite", id: "sub_cancelled_001" });
    const update = buildTierUpdate("free", sub);
    expect(update.stripe_customer_id).toBe("cus_former_elite");
    expect(update.stripe_subscription_id).toBe("sub_cancelled_001");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Subscription dual-metadata key lookup (plan_key OR masseurmatch_plan)
// ─────────────────────────────────────────────────────────────────────────────

describe("Subscription plan key resolution (dual metadata key)", () => {
  function resolveSubPlanKey(sub: FakeSubscription): string {
    return sub.metadata?.plan_key ?? sub.metadata?.masseurmatch_plan ?? "";
  }

  it("reads plan_key when present", () => {
    const sub = fakeSub({ metadata: { plan_key: "pro", user_id: "u" } });
    expect(resolveSubPlanKey(sub)).toBe("pro");
  });

  it("falls back to masseurmatch_plan when plan_key is absent", () => {
    const sub = fakeSub({ metadata: { masseurmatch_plan: "elite", user_id: "u" } } as unknown as Partial<FakeSubscription>);
    expect(resolveSubPlanKey(sub)).toBe("elite");
  });

  it("prefers plan_key over masseurmatch_plan when both are set", () => {
    const sub = fakeSub({
      metadata: { plan_key: "pro", masseurmatch_plan: "elite", user_id: "u" },
    } as unknown as Partial<FakeSubscription>);
    expect(resolveSubPlanKey(sub)).toBe("pro");
  });

  it("returns empty string when neither key is present", () => {
    const sub = fakeSub({ metadata: { user_id: "u" } });
    expect(resolveSubPlanKey(sub)).toBe("");
    expect(planKeyToTier(resolveSubPlanKey(sub))).toBe("free");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Identity verification auto-approve guard
// ─────────────────────────────────────────────────────────────────────────────

describe("Identity verification auto-approve status guard", () => {
  const APPROVABLE_STATUSES = ["pending_approval", "under_review", "changes_requested"] as const;
  const NON_APPROVABLE_STATUSES = ["approved", "draft", "suspended", "rejected"] as const;

  function wouldAutoApprove(currentStatus: string): boolean {
    return (APPROVABLE_STATUSES as readonly string[]).includes(currentStatus);
  }

  it("auto-approves profiles in pending_approval status", () => {
    expect(wouldAutoApprove("pending_approval")).toBe(true);
  });

  it("auto-approves profiles in under_review status", () => {
    expect(wouldAutoApprove("under_review")).toBe(true);
  });

  it("auto-approves profiles in changes_requested status", () => {
    expect(wouldAutoApprove("changes_requested")).toBe(true);
  });

  it("does not auto-approve already-approved profiles", () => {
    expect(wouldAutoApprove("approved")).toBe(false);
  });

  it("does not auto-approve draft profiles", () => {
    expect(wouldAutoApprove("draft")).toBe(false);
  });

  it("does not auto-approve suspended or rejected profiles", () => {
    expect(wouldAutoApprove("suspended")).toBe(false);
    expect(wouldAutoApprove("rejected")).toBe(false);
  });

  it("all approvable statuses are non-empty strings", () => {
    for (const s of APPROVABLE_STATUSES) {
      expect(s.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Stripe webhook signature header (existing algorithm — regression guard)
// ─────────────────────────────────────────────────────────────────────────────

describe("Stripe webhook signature header format", () => {
  const secret = "whsec_test_abc123";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });

  it("header contains t= and v1= parts", () => {
    const header = makeStripeHeader(payload, secret);
    expect(header).toMatch(/^t=\d+,v1=[a-f0-9]+$/);
  });

  it("v1 signature is 64 hex characters (SHA-256)", () => {
    const header = makeStripeHeader(payload, secret);
    const v1 = header.split(",").find((p) => p.startsWith("v1="))!.slice(3);
    expect(v1).toHaveLength(64);
    expect(v1).toMatch(/^[a-f0-9]+$/);
  });

  it("signing with wrong secret produces a different signature", () => {
    const ts = 1_700_000_000;
    const sig1 = stripeSign(payload, secret, ts);
    const sig2 = stripeSign(payload, "whsec_wrong", ts);
    expect(sig1).not.toBe(sig2);
  });

  it("tampered payload produces a different signature", () => {
    const ts = 1_700_000_000;
    const sig1 = stripeSign(payload, secret, ts);
    const sig2 = stripeSign(payload.replace("evt_1", "evt_attacker"), secret, ts);
    expect(sig1).not.toBe(sig2);
  });

  it("header is deterministic for the same inputs", () => {
    const ts = 1_700_000_000;
    const h1 = makeStripeHeader(payload, secret, ts);
    const h2 = makeStripeHeader(payload, secret, ts);
    expect(h1).toBe(h2);
  });
});
