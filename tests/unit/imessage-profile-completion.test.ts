import { describe, expect, it } from "vitest";

import {
  getProfileCompletionAudit,
  normalizePhoneE164,
  parseProfileFieldAnswer,
  profilePatchForField,
} from "@/lib/messaging/profile-completion";

describe("iMessage profile completion", () => {
  it("normalizes US phone numbers to E.164", () => {
    expect(normalizePhoneE164("(415) 215-2104")).toBe("+14152152104");
    expect(normalizePhoneE164("+1 (727) 238-7650")).toBe("+17272387650");
    expect(normalizePhoneE164("not a phone")).toBeNull();
  });

  it("detects the core missing profile fields deterministically", () => {
    const audit = getProfileCompletionAudit(
      {
        headline: "Deep Tissue Specialist",
        bio: "Professional massage provider focused on therapeutic bodywork.",
        city: "Miami",
        state: "FL",
        languages: ["English", "Portuguese"],
        massage_techniques: ["Deep Tissue"],
        years_experience: 10,
        offers_incall: true,
        offers_outcall: false,
        incall_price: 140,
      },
      1,
    );

    expect(audit.complete).toBe(true);
    expect(audit.missing).toEqual([]);
  });

  it("does not treat an empty profile as complete", () => {
    const audit = getProfileCompletionAudit({}, 0);
    expect(audit.complete).toBe(false);
    expect(audit.missing).toEqual([
      "headline",
      "bio",
      "city",
      "state",
      "languages",
      "massage_techniques",
      "years_experience",
      "service_mode",
      "pricing",
      "photo",
    ]);
  });

  it("parses list fields without inventing entries", () => {
    const parsed = parseProfileFieldAnswer("languages", "English, Spanish and Portuguese");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toEqual(["English", "Spanish", "Portuguese"]);
  });

  it("requires a valid years-of-experience answer", () => {
    expect(parseProfileFieldAnswer("years_experience", "12 years")).toEqual({
      ok: true,
      value: 12,
      preview: "12 years",
    });
    expect(parseProfileFieldAnswer("years_experience", "a lot").ok).toBe(false);
  });

  it("maps service mode only to the approved boolean fields", () => {
    const parsed = parseProfileFieldAnswer("service_mode", "both");
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(profilePatchForField("service_mode", parsed.value)).toEqual({
      offers_incall: true,
      offers_outcall: true,
      incall: true,
      outcall: true,
    });
  });

  it("requires pricing labels when both service modes are enabled", () => {
    const profile = { offers_incall: true, offers_outcall: true };
    expect(parseProfileFieldAnswer("pricing", "150", profile).ok).toBe(false);

    const parsed = parseProfileFieldAnswer("pricing", "incall 120, outcall 150", profile);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(profilePatchForField("pricing", parsed.value)).toEqual({
      incall_price: 120,
      outcall_price: 150,
    });
  });
});
