import { describe, expect, it } from "vitest";

import { sanitizeResendTag } from "../../supabase/functions/_shared/resend-tags";

describe("sanitizeResendTag", () => {
  it("normalizes spaces and punctuation from lifecycle segments", () => {
    expect(sanitizeResendTag("Therapist - Profile Incomplete", "none")).toBe(
      "Therapist_-_Profile_Incomplete",
    );
  });

  it("uses a safe fallback for empty or non-ASCII-only values", () => {
    expect(sanitizeResendTag("✨", "none")).toBe("none");
    expect(sanitizeResendTag(null, "custom")).toBe("custom");
  });

  it("caps values at the provider limit", () => {
    expect(sanitizeResendTag("a".repeat(300), "none")).toHaveLength(256);
  });
});
