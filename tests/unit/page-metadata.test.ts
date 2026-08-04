import { describe, expect, it } from "vitest";

import { createPageMetadata } from "@/app/_lib/seo";
import { getProfileCanonicalUrl } from "@/app/_lib/profile-metadata";
import { SITE_URL } from "@/lib/site";

describe("createPageMetadata", () => {
  it("builds a self-referential canonical on the configured host", () => {
    const metadata = createPageMetadata({
      title: "Dallas Male Massage Therapists | MasseurMatch",
      description: "Find male massage therapists in Dallas, TX.",
      path: "/dallas",
    });

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/dallas`);
    expect(metadata.openGraph?.url).toBe(`${SITE_URL}/dallas`);
  });

  it("normalizes trailing slashes out of canonicals", () => {
    const metadata = createPageMetadata({
      title: "Test",
      description: "Test",
      path: "/dallas/",
    });

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/dallas`);
  });

  it("marks indexable pages index,follow with rich snippet allowances", () => {
    const metadata = createPageMetadata({ title: "T", description: "D", path: "/dallas" });
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("marks zero-inventory pages noindex,follow", () => {
    const metadata = createPageMetadata({
      title: "T",
      description: "D",
      path: "/empty-city",
      noIndex: true,
    });
    const robots = metadata.robots as { index?: boolean; follow?: boolean };

    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(true);
  });

  it("does not duplicate the site name in provided titles", () => {
    const metadata = createPageMetadata({
      title: "Dallas Male Massage Therapists | MasseurMatch",
      description: "D",
      path: "/dallas",
    });

    expect(metadata.title).toBe("Dallas Male Massage Therapists | MasseurMatch");
  });
});

describe("getProfileCanonicalUrl", () => {
  it("never creates a double slash when the configured origin has a trailing slash", () => {
    expect(getProfileCanonicalUrl("bruno-santos", "https://www.masseurmatch.com/")).toBe(
      "https://www.masseurmatch.com/therapists/bruno-santos",
    );
  });

  it("normalizes accidental slashes around the route parameter", () => {
    expect(getProfileCanonicalUrl("/bruno-santos/", "https://www.masseurmatch.com///")).toBe(
      "https://www.masseurmatch.com/therapists/bruno-santos",
    );
  });
});
