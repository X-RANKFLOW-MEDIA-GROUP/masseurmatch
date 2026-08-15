import { describe, expect, it } from "vitest";

import { getKnottyProfileSlug } from "@/lib/knotty/profile-chat";

describe("getKnottyProfileSlug", () => {
  it("extracts the exact therapist slug from a public profile page", () => {
    expect(getKnottyProfileSlug("/therapists/bruno-3890ba48")).toBe("bruno-3890ba48");
    expect(getKnottyProfileSlug("/therapists/damian-1d366325/")).toBe("damian-1d366325");
  });

  it("does not activate profile grounding outside a therapist profile", () => {
    expect(getKnottyProfileSlug("/search")).toBeNull();
    expect(getKnottyProfileSlug("/near-me")).toBeNull();
    expect(getKnottyProfileSlug("/pro/dashboard")).toBeNull();
    expect(getKnottyProfileSlug(null)).toBeNull();
  });

  it("decodes encoded profile slugs safely", () => {
    expect(getKnottyProfileSlug("/therapists/test%2Dprofile")).toBe("test-profile");
  });
});
