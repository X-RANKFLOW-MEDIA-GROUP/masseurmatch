import { describe, expect, it } from "vitest";

import { getLocalSeoCityContent } from "@/app/_lib/local-seo-content";

describe("local SEO city content", () => {
  it("provides a complete Dallas intent cluster", () => {
    const content = getLocalSeoCityContent("dallas");

    expect(content).not.toBeNull();
    expect(content?.title).toContain("Dallas, TX");
    expect(content?.description).toContain("incall and outcall");
    expect(content?.relatedCitySlugs).toContain("fort-worth");
    expect(content?.faqs.length).toBeGreaterThanOrEqual(3);
  });

  it("provides Chicago and Indianapolis content without creating generic fallbacks", () => {
    expect(getLocalSeoCityContent("chicago")?.title).toContain("Chicago, IL");
    expect(getLocalSeoCityContent("indianapolis")?.title).toContain("Indianapolis, IN");
    expect(getLocalSeoCityContent("unknown-city")).toBeNull();
  });
});
