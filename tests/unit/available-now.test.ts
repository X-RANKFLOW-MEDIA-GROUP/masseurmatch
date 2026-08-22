import { describe, expect, it } from "vitest";
import { resolveAvailableNowTransition } from "@/app/_lib/available-now";

describe("Available Now transitions", () => {
  const now = new Date("2026-08-21T20:00:00.000Z");

  it("deactivates and clears expiry", () => {
    const transition = resolveAvailableNowTransition(
      { subscription_tier: "pro", available_now: true, available_now_expires: "2026-08-21T22:00:00.000Z" },
      false,
      now,
    );
    expect(transition.updates).toEqual({ available_now: false, available_now_expires: null });
  });

  it("activates Standard for one hour", () => {
    const transition = resolveAvailableNowTransition(
      { subscription_tier: "standard", available_now: false, available_now_expires: null },
      true,
      now,
    );
    expect(transition.durationHours).toBe(1);
    expect(transition.expiresAt).toBe("2026-08-21T21:00:00.000Z");
  });

  it("does not extend an already active timer when the profile form is saved", () => {
    const transition = resolveAvailableNowTransition(
      { subscription_tier: "pro", available_now: true, available_now_expires: "2026-08-21T22:00:00.000Z" },
      true,
      now,
    );
    expect(transition.changed).toBe(false);
    expect(transition.expiresAt).toBe("2026-08-21T22:00:00.000Z");
  });

  it("blocks a new activation on Free", () => {
    expect(() =>
      resolveAvailableNowTransition(
        { subscription_tier: "free", available_now: false, available_now_expires: null },
        true,
        now,
      ),
    ).toThrow("Available Now is not available on the Free plan");
  });
});
