import { describe, expect, it } from "vitest";

import { buildProfileSlug } from "@/app/_lib/profile-slug";

const PROFILE_ID = "3890ba48-4376-4609-9b1c-f0f9cf5e7634";
const OTHER_ID = "7a2f91c3-1111-2222-3333-444455556666";

describe("buildProfileSlug", () => {
  it("builds the slug from display name, city, specialty for optimal SEO", () => {
    expect(buildProfileSlug("John Doe", PROFILE_ID, "New York", "Deep Tissue"))
      .toBe("deep-tissue-therapist-new-york-john-doe-3890ba48");
  });

  it("includes city when specialty is missing", () => {
    expect(buildProfileSlug("Jane Smith", PROFILE_ID, "Los Angeles"))
      .toBe("jane-smith-los-angeles-3890ba48");
  });

  it("builds the slug from the display name plus an id fragment when city and specialty are missing", () => {
    expect(buildProfileSlug("Bruno", PROFILE_ID)).toBe("bruno-3890ba48");
  });

  it("keeps two providers with the same display name unique", () => {
    const a = buildProfileSlug("Bruno", PROFILE_ID, "New York", "Swedish");
    const b = buildProfileSlug("Bruno", OTHER_ID, "New York", "Swedish");
    expect(a).not.toBe(b);
    expect(b).toBe("swedish-therapist-new-york-bruno-7a2f91c3");
  });

  it("normalizes spaces, casing, and special chars in all slug components", () => {
    expect(buildProfileSlug("  João  Da Silva ", PROFILE_ID, "São Paulo", "Relaxamento"))
      .toBe("relaxamento-therapist-s-o-paulo-jo-o-da-silva-3890ba48");
  });

  it("handles specialty as an array by using the first element", () => {
    expect(buildProfileSlug("Bruno", PROFILE_ID, "Miami", ["Deep Tissue", "Swedish"]))
      .toBe("deep-tissue-therapist-miami-bruno-3890ba48");
  });

  it("falls back when the display name is empty", () => {
    expect(buildProfileSlug("", PROFILE_ID)).toBe("therapist-3890ba48");
    expect(buildProfileSlug(null, PROFILE_ID)).toBe("therapist-3890ba48");
  });

  it("falls back gracefully when only specialty is provided", () => {
    expect(buildProfileSlug(null, PROFILE_ID, null, "Swedish"))
      .toBe("therapist-3890ba48");
  });
});
