#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const BASE_URL = (process.env.SITEMAP_VALIDATION_BASE_URL || "https://masseurmatch.com").replace(/\/$/, "");
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const repoRoot = process.cwd();

const PRIVATE_PATTERNS = ["/dashboard", "/admin", "/api", "/login", "/register", "/billing", "/checkout"];

function parseLocs(xml) {
  return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()))];
}

function fail(message) {
  console.error(`[sitemap-validator] ERROR: ${message}`);
  process.exit(1);
}

function validateUrls(urls) {
  if (!urls.length) {
    fail("No <loc> entries found in sitemap output.");
  }

  const privateHits = urls.filter((url) => PRIVATE_PATTERNS.some((pattern) => url.includes(pattern)));
  if (privateHits.length > 0) {
    fail(`Private routes detected in sitemap output: ${privateHits.slice(0, 5).join(", ")}`);
  }

  const requiredPublic = ["/", "/therapists", "/blog", "/guides", "/compare", "/legal", "/privacy", "/terms"];
  const missingRequired = requiredPublic.filter((route) => !urls.some((url) => url.endsWith(route)));
  if (missingRequired.length > 0) {
    fail(`Required public routes missing from sitemap output: ${missingRequired.join(", ")}`);
  }
}

async function validateViaHttp() {
  console.log(`[sitemap-validator] Fetching ${SITEMAP_URL}`);
  const response = await fetch(SITEMAP_URL, { headers: { "user-agent": "MasseurMatch-SitemapValidator/1.2" } });

  if (!response.ok) {
    throw new Error(`Unable to fetch sitemap: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  validateUrls(parseLocs(xml));
  console.log("[sitemap-validator] OK (remote fetch)");
}

function validateViaSourceFiles() {
  const seoRoutesPath = path.join(repoRoot, "src/app/_lib/seo-routes.ts");
  const sitemapRoutePath = path.join(repoRoot, "src/app/sitemap.ts");
  const robotsRoutePath = path.join(repoRoot, "src/app/robots.ts");

  for (const filePath of [seoRoutesPath, sitemapRoutePath, robotsRoutePath]) {
    if (!fs.existsSync(filePath)) {
      fail(`Required SEO file missing: ${path.relative(repoRoot, filePath)}`);
    }
  }

  const seoSource = fs.readFileSync(seoRoutesPath, "utf8");
  const sitemapSource = fs.readFileSync(sitemapRoutePath, "utf8");
  const robotsSource = fs.readFileSync(robotsRoutePath, "utf8");

  const mustContain = [
    "/therapists",
    "/blog",
    "/guides",
    "/compare",
    "/privacy",
    "/terms",
    "/legal",
  ];

  const missing = mustContain.filter((token) => !seoSource.includes(token));
  if (missing.length > 0) {
    fail(`SEO routes are missing required public paths: ${missing.join(", ")}`);
  }

  for (const privateRoute of PRIVATE_PATTERNS) {
    if (sitemapSource.includes(privateRoute)) {
      fail(`sitemap.ts appears to include private route pattern: ${privateRoute}`);
    }
  }

  if (!sitemapSource.includes("MetadataRoute.Sitemap")) {
    fail("sitemap.ts does not appear to export a Next.js sitemap route.");
  }

  if (!robotsSource.includes("buildRobotsRules") && !robotsSource.includes("disallow") && !robotsSource.includes("Disallow")) {
    fail("robots.ts does not appear to define robots disallow rules.");
  }

  console.log("[sitemap-validator] OK (source fallback)");
}

async function main() {
  try {
    await validateViaHttp();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[sitemap-validator] Remote sitemap unavailable (${message}). Falling back to source validation.`);
    validateViaSourceFiles();
  }
}

await main();
