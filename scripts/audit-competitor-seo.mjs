import fs from "node:fs";

const page = fs.readFileSync("src/app/massage-directories/[slug]/page.tsx", "utf8").toLowerCase();
const metadata = fs.readFileSync("src/app/massage-directories/[slug]/metadata.ts", "utf8").toLowerCase();
const sitemap = fs.readFileSync("src/app/_lib/seo-routes.ts", "utf8").toLowerCase();

const BLOCKED_ADULT_TERMS = ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"];
const BLOCKED_CLAIMS = ["better than", "the best replacement", "official alternative", "safer than", "verified licensed therapists", "book now"];

for (const term of BLOCKED_ADULT_TERMS) {
  if (page.includes(term) || metadata.includes(term)) {
    throw new Error(`[seo:audit:competitors] unsafe term found: ${term}`);
  }
}
for (const term of BLOCKED_CLAIMS) {
  if (page.includes(term) || metadata.includes(term)) {
    throw new Error(`[seo:audit:competitors] unsupported claim found: ${term}`);
  }
}
for (const pattern of ["feature comparison table", "faq", "canonical", "article", "/near-me", "/therapists", "/register"]) {
  if (!page.includes(pattern) && !metadata.includes(pattern)) {
    throw new Error(`[seo:audit:competitors] missing required block: ${pattern}`);
  }
}
if (page.includes("aggregaterating") || page.includes('"@type": "review"')) {
  throw new Error("[seo:audit:competitors] fake review schema detected");
}
if (!sitemap.includes("buildcompetitorsitemapentries")) {
  throw new Error("[seo:audit:competitors] competitor sitemap entries missing");
}
if (sitemap.includes("rentmen-alternative") || sitemap.includes("masseurfinder-vs-rentmen")) {
  throw new Error("[seo:audit:competitors] excluded competitor route is exposed");
}
console.log("[seo:audit:competitors] OK");
