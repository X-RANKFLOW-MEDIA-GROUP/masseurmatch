import { describe, expect, it } from "vitest";

import {
  FIRST_30_URLS_IN_ORDER,
  getLaunchAreaPaths,
  getLaunchCityPaths,
  getLaunchKeywordPaths,
  getLaunchSegmentPaths,
  isLaunchUrl,
} from "@/app/_lib/launch-urls";
import { getSegmentBySlug, getKeywordBySlug } from "@/app/_lib/directory-taxonomy";

describe("launch URL allowlist", () => {
  it("never lists a redirecting duplicate-intent URL", () => {
    // /{city}/gay-massage, /{city}/verified-therapists and /{city}/services/*
    // 301 to canonical segment pages, so the sitemap source list must not
    // contain them.
    for (const path of FIRST_30_URLS_IN_ORDER) {
      expect(path).not.toMatch(/\/gay-massage$/);
      expect(path).not.toMatch(/\/verified-therapists$/);
      expect(path).not.toContain("/services/");
      expect(path.startsWith("/cities/")).toBe(false);
    }
  });

  it("keeps the canonical Dallas cluster first", () => {
    expect(FIRST_30_URLS_IN_ORDER[0]).toBe("/dallas");
    expect(isLaunchUrl("/dallas/lgbtq-friendly")).toBe(true);
    expect(isLaunchUrl("/dallas/verified-profiles")).toBe(true);
    expect(isLaunchUrl("/dallas/wellness/deep-tissue")).toBe(true);
    expect(isLaunchUrl("/dallas/gay-massage")).toBe(false);
  });

  it("partitions launch paths by depth without overlap", () => {
    const cityPaths = getLaunchCityPaths();
    const segmentPaths = getLaunchSegmentPaths();
    const keywordPaths = getLaunchKeywordPaths();
    const areaPaths = getLaunchAreaPaths();

    for (const path of cityPaths) expect(path.split("/").filter(Boolean)).toHaveLength(1);
    for (const path of segmentPaths) expect(path.split("/").filter(Boolean)).toHaveLength(2);
    for (const path of keywordPaths) expect(path).toContain("/wellness/");
    for (const path of areaPaths) expect(path).toContain("/areas/");
  });

  it("only lists segment and keyword slugs that resolve in the taxonomy", () => {
    for (const path of getLaunchSegmentPaths()) {
      const [, segmentSlug] = path.split("/").filter(Boolean);
      expect(getSegmentBySlug(segmentSlug || ""), `unknown segment for ${path}`).toBeTruthy();
    }
    for (const path of getLaunchKeywordPaths()) {
      const [, , keywordSlug] = path.split("/").filter(Boolean);
      expect(getKeywordBySlug(keywordSlug || ""), `unknown keyword for ${path}`).toBeTruthy();
    }
  });
});
