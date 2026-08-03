import { describe, expect, it } from "vitest";

import { getLocalSeoCityContent } from "@/app/_lib/local-seo-content";

describe("local SEO city content", () => {
  it("provides a complete Dallas intent cluster aligned with priority queries", () => {
    const content = getLocalSeoCityContent("dallas");

    expect(content).not.toBeNull();
    expect(content?.title).toContain("Dallas Male Massage");
    expect(content?.description).toContain("Dallas, TX");
    expect(content?.description).toContain("incall and outcall");
    expect(content?.relatedCitySlugs).toContain("fort-worth");
    expect(content?.faqs.length).toBeGreaterThanOrEqual(3);
    // The Semrush gap report shows ranking m4m queries — covered via FAQ, not a doorway page.
    expect(content?.faqs.some((faq) => faq.question.toLowerCase().includes("m4m"))).toBe(true);
  });

  it("provides unique Houston content", () => {
    const content = getLocalSeoCityContent("houston");

    expect(content).not.toBeNull();
    expect(content?.title).toContain("Houston Male Massage");
    expect(content?.intro).toContain("Montrose");
    expect(content?.intro).not.toContain("Oak Lawn");
    expect(content?.relatedCitySlugs).toContain("austin");
    expect(content?.faqs.length).toBeGreaterThanOrEqual(3);
  });

  it("provides unique Austin content", () => {
    const content = getLocalSeoCityContent("austin");

    expect(content).not.toBeNull();
    expect(content?.title).toContain("Austin Male Massage");
    expect(content?.intro).toContain("South Congress");
    expect(content?.intro).not.toContain("Montrose");
    expect(content?.relatedCitySlugs).toContain("houston");
    expect(content?.faqs.length).toBeGreaterThanOrEqual(3);
  });

  it("does not duplicate city copy across markets", () => {
    const dallas = getLocalSeoCityContent("dallas");
    const houston = getLocalSeoCityContent("houston");
    const austin = getLocalSeoCityContent("austin");

    const intros = [dallas?.intro, houston?.intro, austin?.intro];
    expect(new Set(intros).size).toBe(intros.length);

    const questions = [dallas, houston, austin].flatMap((c) => c?.faqs.map((f) => f.question) ?? []);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("provides Chicago and Indianapolis content without creating generic fallbacks", () => {
    expect(getLocalSeoCityContent("chicago")?.title).toContain("Chicago, IL");
    expect(getLocalSeoCityContent("indianapolis")?.title).toContain("Indianapolis, IN");
    expect(getLocalSeoCityContent("unknown-city")).toBeNull();
  });
});
