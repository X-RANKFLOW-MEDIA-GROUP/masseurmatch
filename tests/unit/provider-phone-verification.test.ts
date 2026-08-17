import { describe, expect, it } from "vitest";

import {
  getProviderPhoneVerificationState,
  normalizeProviderPhone,
} from "@/lib/provider-phone-verification";

describe("provider phone verification", () => {
  it("normalizes US phone numbers to E.164", () => {
    expect(normalizeProviderPhone("(773) 916-5656")).toBe("+17739165656");
  });

  it("requires the profile flag, matching auth phone, and confirmed auth timestamp", () => {
    expect(
      getProviderPhoneVerificationState({
        profilePhone: "+17739165656",
        isVerifiedPhone: true,
        authPhone: "+17739165656",
        phoneConfirmedAt: "2026-08-17T12:00:00.000Z",
      }).verified,
    ).toBe(true);
  });

  it("rejects a provider when Supabase Auth has not confirmed the phone", () => {
    expect(
      getProviderPhoneVerificationState({
        profilePhone: "+17739165656",
        isVerifiedPhone: true,
        authPhone: "+17739165656",
        phoneConfirmedAt: null,
      }).verified,
    ).toBe(false);
  });

  it("rejects a provider when the authenticated phone differs from the profile phone", () => {
    expect(
      getProviderPhoneVerificationState({
        profilePhone: "+17739165656",
        isVerifiedPhone: true,
        authPhone: "+12145550123",
        phoneConfirmedAt: "2026-08-17T12:00:00.000Z",
      }).verified,
    ).toBe(false);
  });
});
