import { describe, expect, it } from "vitest";

import { getProfileIndexRobots } from "@/lib/index-eligibility";

describe("getProfileIndexRobots", () => {
  it("indexes verified public profiles", () => {
    expect(getProfileIndexRobots({ verification_status: "verified", city: "Dallas" } as never)).toBe(
      "index, follow",
    );
  });

  it("keeps unverified profiles out of the sitemap-compatible directive", () => {
    expect(getProfileIndexRobots({ verification_status: "pending", city: "Dallas" } as never)).toBe(
      "noindex, follow",
    );
  });
});
