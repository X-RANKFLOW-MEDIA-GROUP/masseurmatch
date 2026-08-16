import { describe, expect, it } from "vitest";

import {
  canStartPaidSubscription,
  shouldPublishInitialPaidActivation,
} from "@/app/api/_lib/provider-billing-gates";

describe("provider billing gates", () => {
  it("blocks paid checkout until profile moderation is approved", () => {
    for (const status of [null, "draft", "pending", "pending_approval", "under_review", "changes_requested", "rejected", "suspended"]) {
      expect(canStartPaidSubscription(status)).toBe(false);
    }
    expect(canStartPaidSubscription("approved")).toBe(true);
  });

  it("publishes an approved hidden profile on its first matching paid entitlement", () => {
    expect(
      shouldPublishInitialPaidActivation({
        isEntitled: true,
        profileStatus: "approved",
        visibilityStatus: "hidden",
        isActive: false,
        requestedTier: "pro",
        planKey: "pro",
        subscriptionStatus: null,
      }),
    ).toBe(true);
  });

  it("does not publish before PayPal entitlement becomes active or trialing", () => {
    expect(
      shouldPublishInitialPaidActivation({
        isEntitled: false,
        profileStatus: "approved",
        visibilityStatus: "hidden",
        isActive: false,
        requestedTier: "pro",
        planKey: "pro",
        subscriptionStatus: null,
      }),
    ).toBe(false);
  });

  it("does not publish a mismatched plan", () => {
    expect(
      shouldPublishInitialPaidActivation({
        isEntitled: true,
        profileStatus: "approved",
        visibilityStatus: "hidden",
        isActive: false,
        requestedTier: "standard",
        planKey: "elite",
        subscriptionStatus: null,
      }),
    ).toBe(false);
  });

  it("does not republish a profile after subscription history already exists", () => {
    expect(
      shouldPublishInitialPaidActivation({
        isEntitled: true,
        profileStatus: "approved",
        visibilityStatus: "hidden",
        isActive: false,
        requestedTier: "pro",
        planKey: "pro",
        subscriptionStatus: "canceled",
      }),
    ).toBe(false);
  });

  it("does not override moderation or manual visibility states", () => {
    expect(
      shouldPublishInitialPaidActivation({
        isEntitled: true,
        profileStatus: "suspended",
        visibilityStatus: "suspended",
        isActive: false,
        requestedTier: "pro",
        planKey: "pro",
        subscriptionStatus: null,
      }),
    ).toBe(false);

    expect(
      shouldPublishInitialPaidActivation({
        isEntitled: true,
        profileStatus: "approved",
        visibilityStatus: "paused",
        isActive: false,
        requestedTier: "pro",
        planKey: "pro",
        subscriptionStatus: null,
      }),
    ).toBe(false);
  });
});
