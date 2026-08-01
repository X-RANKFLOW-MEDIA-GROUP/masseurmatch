import { describe, expect, it } from "vitest";

import { evaluateProfileSeoQuality, PROFILE_INDEX_MIN_SCORE } from "@/app/_lib/profile-seo-quality";

const longBio = Array.from({ length: 160 }, (_, index) => `word${index}`).join(" ");

function completeProfile() {
  return {
    display_name: "Marcus",
    bio: longBio,
    headline: "Experienced massage therapist serving Dallas",
    city: "Dallas",
    state: "TX",
    profile_photo: "https://example.com/profile.jpg",
    gallery_photos: ["https://example.com/2.jpg", "https://example.com/3.jpg"],
    services: ["Deep tissue", "Sports massage", "Swedish massage"],
    incall_available: true,
    starting_price: 150,
    availability_days: ["Monday", "Tuesday"],
    verification_status: "verified",
    phone: "+12145550100",
  };
}

describe("evaluateProfileSeoQuality", () => {
  it("allows a complete, contactable public profile to be indexed", () => {
    const result = evaluateProfileSeoQuality(completeProfile());
    expect(result.score).toBe(100);
    expect(result.indexEligible).toBe(true);
    expect(result.missingChecks).toEqual([]);
  });

  it("keeps thin profiles public but out of search indexing", () => {
    const result = evaluateProfileSeoQuality({ display_name: "Marcus", city: "Dallas", state: "TX", phone: "+12145550100" });
    expect(result.score).toBeLessThan(PROFILE_INDEX_MIN_SCORE);
    expect(result.indexEligible).toBe(false);
    expect(result.missingChecks).toContain("Add an original bio of at least 150 words");
  });

  it("requires a direct contact method even when content score is high", () => {
    const profile = completeProfile();
    delete (profile as Partial<typeof profile>).phone;
    const result = evaluateProfileSeoQuality(profile);
    expect(result.score).toBe(100);
    expect(result.indexEligible).toBe(false);
  });
});
