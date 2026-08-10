import { describe, expect, it } from "vitest";

import {
  DASHBOARD,
  ONBOARDING_ENTRY,
  resolveAuthDestination,
  sanitizeRedirect,
} from "@/app/auth/callback/destination";

describe("sanitizeRedirect", () => {
  it("falls back to the dashboard when no target is supplied", () => {
    expect(sanitizeRedirect(null)).toBe(DASHBOARD);
    expect(sanitizeRedirect("")).toBe(DASHBOARD);
  });

  it("rejects absolute and protocol-relative URLs (open redirect)", () => {
    expect(sanitizeRedirect("//evil.example.com")).toBe(DASHBOARD);
    expect(sanitizeRedirect("https://evil.example.com")).toBe(DASHBOARD);
    expect(sanitizeRedirect("pro/dashboard")).toBe(DASHBOARD);
  });

  it("keeps same-origin absolute paths", () => {
    expect(sanitizeRedirect("/pro/billing")).toBe("/pro/billing");
    expect(sanitizeRedirect(ONBOARDING_ENTRY)).toBe(ONBOARDING_ENTRY);
  });
});

describe("resolveAuthDestination", () => {
  it("sends brand new accounts into onboarding", () => {
    expect(resolveAuthDestination({ profileCreated: true, next: DASHBOARD })).toBe(
      ONBOARDING_ENTRY,
    );
  });

  it("sends new accounts into onboarding even when next is elsewhere", () => {
    expect(resolveAuthDestination({ profileCreated: true, next: "/pro/billing" })).toBe(
      ONBOARDING_ENTRY,
    );
  });

  it("honours the requested destination for returning users", () => {
    expect(resolveAuthDestination({ profileCreated: false, next: "/pro/billing" })).toBe(
      "/pro/billing",
    );
  });

  // The social buttons on the "Sign up" tab always attach next=/pro/onboard.
  // An existing provider signing in with Google from that tab must reach their
  // dashboard, not be dropped back into the plan picker.
  it("redirects returning users away from the onboarding entry", () => {
    expect(
      resolveAuthDestination({ profileCreated: false, next: ONBOARDING_ENTRY }),
    ).toBe(DASHBOARD);
  });
});
