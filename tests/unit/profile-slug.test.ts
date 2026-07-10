import { describe, expect, it } from "vitest";

import { buildProfileSlug } from "@/app/_lib/profile-slug";

const PROFILE_ID = "3890ba48-4376-4609-9b1c-f0f9cf5e7634";
const OTHER_ID = "7a2f91c3-1111-2222-3333-444455556666";

describe("buildProfileSlug", () => {
  it("builds the slug from the display name plus an id fragment", () => {
    expect(buildProfileSlug("Bruno", PROFILE_ID)).toBe("bruno-3890ba48");
  });

  it("keeps two providers with the same display name unique", () => {
    const a = buildProfileSlug("Bruno", PROFILE_ID);
    const b = buildProfileSlug("Bruno", OTHER_ID);
    expect(a).not.toBe(b);
    expect(b).toBe("bruno-7a2f91c3");
  });

  it("normalizes accents, spaces, and casing", () => {
    expect(buildProfileSlug("  João  Da Silva ", PROFILE_ID)).toBe("jo-o-da-silva-3890ba48");
  });

  it("falls back when the display name is empty", () => {
    expect(buildProfileSlug("", PROFILE_ID)).toBe("therapist-3890ba48");
    expect(buildProfileSlug(null, PROFILE_ID)).toBe("therapist-3890ba48");
  });
});
