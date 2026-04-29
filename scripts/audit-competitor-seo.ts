import fs from "node:fs";
import path from "node:path";
import { ALL_COMPETITOR_ROUTE_SLUGS, getSitemapCompetitorRoutes } from "../src/lib/seo/competitorComparisonRoutes";
import { BLOCKED_ADULT_TERMS, BLOCKED_CLAIMS } from "../src/lib/seo/competitorSafeLanguage";
import { COMPETITORS } from "../src/lib/seo/competitors";

function fail(message: string): never {
  throw new Error(`[seo:audit:competitors] ${message}`);
}

function run() {
  const pageFile = path.resolve("src/app/massage-directories/[slug]/page.tsx");
  const metadataFile = path.resolve("src/app/massage-directories/[slug]/metadata.ts");
  const sitemapFile = path.resolve("src/app/_lib/seo-routes.ts");

  const page = fs.readFileSync(pageFile, "utf8").toLowerCase();
  const metadata = fs.readFileSync(metadataFile, "utf8").toLowerCase();
  const sitemap = fs.readFileSync(sitemapFile, "utf8").toLowerCase();

  for (const term of BLOCKED_ADULT_TERMS) {
    if (page.includes(term) || metadata.includes(term)) {
      fail(`unsafe term found in competitor page files: ${term}`);
    }
  }

  for (const claim of BLOCKED_CLAIMS) {
    if (page.includes(claim) || metadata.includes(claim)) {
      fail(`unsupported superiority claim found: ${claim}`);
    }
  }

  const requiredPatterns = ["feature comparison table", "faq", "canonical", "article", "/near-me", "/therapists", "/register"];
  for (const pattern of requiredPatterns) {
    if (!page.includes(pattern) && !metadata.includes(pattern)) {
      fail(`missing required competitor SEO block: ${pattern}`);
    }
  }

  if (page.includes("aggregaterating") || page.includes("review")) {
    // allow FAQ review mention but block schema usage
    if (page.includes("aggregaterating") || page.includes('"@type": "review"')) {
      fail("review or aggregate rating schema found");
    }
  }

  const excluded = COMPETITORS.find((competitor) => competitor.slug === "rentmen");
  if (!excluded || excluded.allowedForComparison || excluded.indexable) {
    fail("excluded competitor RentMen is not properly blocked");
  }

  const sitemapRoutes = getSitemapCompetitorRoutes();
  for (const route of sitemapRoutes) {
    if (!ALL_COMPETITOR_ROUTE_SLUGS.includes(route.slug)) {
      fail(`unknown route in competitor sitemap: ${route.slug}`);
    }
    if (!sitemap.includes("buildcompetitorsitemapentries")) {
      fail("main sitemap does not include competitor sitemap entries");
    }
  }

  console.log(`[seo:audit:competitors] OK (${sitemapRoutes.length} indexable routes)`);
}

run();
