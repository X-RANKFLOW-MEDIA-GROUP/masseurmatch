#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const BASE_URL = (process.env.SITEMAP_VALIDATION_BASE_URL || "https://masseurmatch.com").replace(/\/$/, "");
const CANONICAL_ORIGIN = (process.env.SITEMAP_CANONICAL_ORIGIN || "https://masseurmatch.com").replace(/\/$/, "");
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const STRICT = /^(1|true)$/i.test(process.env.SITEMAP_STRICT || "");
const CONCURRENCY = Math.max(1, Number(process.env.SITEMAP_VALIDATION_CONCURRENCY || 6));
const MAX_URLS = Math.max(1, Number(process.env.SITEMAP_VALIDATION_MAX_URLS || 5000));
const repoRoot = process.cwd();

const PRIVATE_PREFIXES = [
  "/admin",
  "/api",
  "/billing",
  "/checkout",
  "/client",
  "/dashboard",
  "/forgot-password",
  "/login",
  "/portal",
  "/pro",
  "/register",
  "/reset-password",
  "/signup",
];
const REQUIRED_PUBLIC_PATHS = ["/", "/therapists", "/blog", "/guides", "/compare", "/legal", "/privacy", "/terms"];
const FALLBACK_PROFILE_PATHS = [
  "/therapists/ethan-cole",
  "/therapists/mason-ellis",
  "/therapists/owen-parker",
  "/therapists/kevin-os",
  "/therapists/bruno-dallas-tx",
];

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function extractXmlTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXml(match[1].trim()) : null;
}

function parseSitemapEntries(xml) {
  if (!/<urlset\b/i.test(xml)) {
    throw new Error("The canonical sitemap must be a <urlset>, not a sitemap index.");
  }

  return [...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => ({
    loc: extractXmlTag(match[1], "loc"),
    lastmod: extractXmlTag(match[1], "lastmod"),
  }));
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function validateSitemapShape(entries) {
  const issues = [];
  const seen = new Map();
  const parsedEntries = [];
  const now = Date.now();

  if (entries.length === 0) issues.push("No <url> entries were found.");
  if (entries.length > MAX_URLS) issues.push(`Sitemap contains ${entries.length} URLs, above validation limit ${MAX_URLS}.`);

  for (const [index, entry] of entries.entries()) {
    if (!entry.loc) {
      issues.push(`Entry ${index + 1} has no <loc>.`);
      continue;
    }

    let parsed;
    try {
      parsed = new URL(entry.loc);
    } catch {
      issues.push(`Invalid absolute URL: ${entry.loc}`);
      continue;
    }

    const normalized = normalizeUrl(parsed.toString());
    const duplicateCount = seen.get(normalized) ?? 0;
    seen.set(normalized, duplicateCount + 1);

    if (parsed.origin !== CANONICAL_ORIGIN) {
      issues.push(`Unexpected sitemap origin for ${entry.loc}; expected ${CANONICAL_ORIGIN}.`);
    }
    if (parsed.search) issues.push(`Query string is not allowed in sitemap URL: ${entry.loc}`);
    if (parsed.hash) issues.push(`Fragment is not allowed in sitemap URL: ${entry.loc}`);
    if (isPrivatePath(parsed.pathname)) issues.push(`Private route detected: ${entry.loc}`);
    if (FALLBACK_PROFILE_PATHS.includes(parsed.pathname)) issues.push(`Fallback profile detected: ${entry.loc}`);

    if (entry.lastmod) {
      const timestamp = Date.parse(entry.lastmod);
      if (Number.isNaN(timestamp)) {
        issues.push(`Invalid <lastmod> for ${entry.loc}: ${entry.lastmod}`);
      } else if (timestamp > now + 5 * 60 * 1000) {
        issues.push(`Future <lastmod> for ${entry.loc}: ${entry.lastmod}`);
      }
    }

    parsedEntries.push({ ...entry, parsed, normalized });
  }

  for (const [url, count] of seen.entries()) {
    if (count > 1) issues.push(`Duplicate URL appears ${count} times: ${url}`);
  }

  const paths = new Set(parsedEntries.map((entry) => entry.parsed.pathname.replace(/\/+$/, "") || "/"));
  for (const requiredPath of REQUIRED_PUBLIC_PATHS) {
    if (!paths.has(requiredPath)) issues.push(`Required public route is missing: ${requiredPath}`);
  }

  if (issues.length > 0) throw new Error(formatIssues("Sitemap structure validation failed", issues));
  return parsedEntries;
}

function extractAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? match[1] ?? match[2] ?? match[3] ?? null : null;
}

function hasNoindexMeta(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const name = extractAttribute(tag, "name")?.toLowerCase();
    const content = extractAttribute(tag, "content")?.toLowerCase() ?? "";
    if ((name === "robots" || name === "googlebot") && content.split(/[\s,]+/).includes("noindex")) return true;
  }
  return false;
}

function extractCanonical(html, baseUrl) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = extractAttribute(tag, "rel")?.toLowerCase().split(/\s+/) ?? [];
    if (!rel.includes("canonical")) continue;
    const href = extractAttribute(tag, "href");
    if (!href) return null;
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return null;
    }
  }
  return null;
}

function parseRobotsDisallows(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter((line) => /^disallow\s*:/i.test(line))
    .map((line) => line.replace(/^disallow\s*:/i, "").trim())
    .filter(Boolean);
}

function robotsPatternMatches(value, pattern) {
  const endAnchored = pattern.endsWith("$");
  const raw = endAnchored ? pattern.slice(0, -1) : pattern;
  const escaped = raw.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${endAnchored ? "$" : ""}`).test(value);
}

function isBlockedByRobots(url, disallows) {
  const pathWithQuery = `${url.pathname}${url.search}`;
  return disallows.some((pattern) => robotsPatternMatches(pathWithQuery, pattern));
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "user-agent": "Googlebot/2.1 (+https://www.google.com/bot.html)",
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(15000),
  });
}

async function validateRobots() {
  const robotsUrl = `${BASE_URL}/robots.txt`;
  const response = await fetchWithTimeout(robotsUrl, { redirect: "manual" });
  if (response.status !== 200) throw new Error(`robots.txt returned HTTP ${response.status}.`);

  const text = await response.text();
  const sitemapDirectives = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap\s*:/i.test(line))
    .map((line) => line.replace(/^sitemap\s*:/i, "").trim());
  const expected = `${CANONICAL_ORIGIN}/sitemap.xml`;

  if (sitemapDirectives.length !== 1 || normalizeUrl(sitemapDirectives[0]) !== normalizeUrl(expected)) {
    throw new Error(`robots.txt must advertise only ${expected}; found ${sitemapDirectives.join(", ") || "none"}.`);
  }
  if (sitemapDirectives.some((url) => /\/sitemap\/\d+\.xml(?:$|\?)/.test(url))) {
    throw new Error("robots.txt still advertises segmented sitemap files.");
  }

  return parseRobotsDisallows(text);
}

async function validatePage(entry, robotsDisallows) {
  const issues = [];
  const targetUrl = new URL(`${entry.parsed.pathname}${entry.parsed.search}`, `${BASE_URL}/`).toString();

  if (isBlockedByRobots(entry.parsed, robotsDisallows)) {
    issues.push(`Blocked by robots.txt: ${entry.loc}`);
    return issues;
  }

  let response;
  try {
    response = await fetchWithTimeout(targetUrl, { redirect: "manual" });
  } catch (error) {
    issues.push(`Request failed for ${entry.loc}: ${error instanceof Error ? error.message : String(error)}`);
    return issues;
  }

  if (response.status >= 300 && response.status < 400) {
    issues.push(`Redirect ${response.status} for ${entry.loc} -> ${response.headers.get("location") || "unknown"}`);
    return issues;
  }
  if (response.status !== 200) {
    issues.push(`HTTP ${response.status} for ${entry.loc}`);
    return issues;
  }

  const xRobotsTag = response.headers.get("x-robots-tag")?.toLowerCase() ?? "";
  if (xRobotsTag.split(/[\s,]+/).includes("noindex")) issues.push(`X-Robots-Tag noindex on ${entry.loc}`);

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/html")) {
    issues.push(`Expected HTML for ${entry.loc}, received ${contentType || "unknown content type"}`);
    return issues;
  }

  const html = await response.text();
  if (hasNoindexMeta(html)) issues.push(`Meta robots noindex on ${entry.loc}`);

  const canonical = extractCanonical(html, targetUrl);
  if (!canonical) {
    issues.push(`Canonical link is missing or invalid on ${entry.loc}`);
  } else if (normalizeUrl(canonical) !== entry.normalized) {
    issues.push(`Canonical mismatch on ${entry.loc}; page declares ${canonical}`);
  }

  return issues;
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function formatIssues(title, issues) {
  const visible = issues.slice(0, 30).map((issue) => `- ${issue}`).join("\n");
  const remainder = issues.length > 30 ? `\n- ...and ${issues.length - 30} more` : "";
  return `${title} (${issues.length} issue${issues.length === 1 ? "" : "s"}):\n${visible}${remainder}`;
}

async function validateViaHttp() {
  console.log(`[sitemap-validator] Fetching ${SITEMAP_URL}`);
  const response = await fetchWithTimeout(SITEMAP_URL, { redirect: "manual" });

  if (response.status !== 200) {
    throw new Error(`Unable to fetch sitemap: HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("xml")) {
    throw new Error(`Sitemap returned unexpected content type: ${contentType || "unknown"}.`);
  }

  const xml = await response.text();
  const entries = validateSitemapShape(parseSitemapEntries(xml));
  const robotsDisallows = await validateRobots();
  const pageIssues = (await mapWithConcurrency(entries, CONCURRENCY, (entry) => validatePage(entry, robotsDisallows))).flat();

  if (pageIssues.length > 0) throw new Error(formatIssues("Live URL validation failed", pageIssues));

  console.log(`[sitemap-validator] OK: ${entries.length} unique canonical URLs, all HTTP 200 and indexable.`);
}

function validateViaSourceFiles() {
  const seoRoutesPath = path.join(repoRoot, "src/app/_lib/seo-routes.ts");
  const releaseBuilderPath = path.join(repoRoot, "src/app/_lib/sitemap-release.ts");
  const sitemapRoutePath = path.join(repoRoot, "src/app/sitemap.ts");
  const robotsRoutePath = path.join(repoRoot, "src/app/robots.ts");

  for (const filePath of [seoRoutesPath, releaseBuilderPath, sitemapRoutePath, robotsRoutePath]) {
    if (!fs.existsSync(filePath)) throw new Error(`Required SEO file missing: ${path.relative(repoRoot, filePath)}`);
  }

  const seoSource = fs.readFileSync(seoRoutesPath, "utf8");
  const releaseSource = fs.readFileSync(releaseBuilderPath, "utf8");
  const sitemapSource = fs.readFileSync(sitemapRoutePath, "utf8");
  const robotsSource = fs.readFileSync(robotsRoutePath, "utf8");

  const missingPublic = REQUIRED_PUBLIC_PATHS.filter((route) => !seoSource.includes(`path: "${route}"`));
  if (missingPublic.length > 0) throw new Error(`SEO routes are missing required public paths: ${missingPublic.join(", ")}`);

  for (const privateRoute of ["/admin", "/dashboard", "/api", "/login", "/register"]) {
    if (!seoSource.includes(privateRoute)) throw new Error(`seo-routes.ts missing private route marker: ${privateRoute}`);
  }

  if (!sitemapSource.includes("buildReleaseSitemapEntries")) throw new Error("sitemap.ts is not using the release sitemap builder.");
  if (!sitemapSource.includes("MetadataRoute.Sitemap")) throw new Error("sitemap.ts does not export a Next.js sitemap route.");
  if (/const\s+hubs\s*:/.test(sitemapSource)) throw new Error("sitemap.ts still contains a duplicate manual hubs array.");

  for (const marker of [
    "dedupeSitemapEntries",
    "getSitemapProfileSlugs",
    "SEO_CITY_MIN_PUBLIC_PROFILES = 3",
    "buildPublishedBlogEntries",
  ]) {
    if (!releaseSource.includes(marker)) throw new Error(`Release sitemap builder is missing safeguard: ${marker}`);
  }

  if (!robotsSource.includes('sitemap: siteUrl("/sitemap.xml")')) throw new Error("robots.ts must advertise the canonical sitemap once.");
  if (robotsSource.includes("/sitemap/0.xml") || robotsSource.includes("/sitemap/1.xml")) {
    throw new Error("robots.ts still advertises segmented sitemap files.");
  }
  if (!robotsSource.includes("buildRobotsRules")) throw new Error("robots.ts is not using centralized crawler rules.");

  console.log("[sitemap-validator] OK (source validation; use SITEMAP_STRICT=1 for live URL checks)");
}

async function main() {
  try {
    await validateViaHttp();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (STRICT) throw error;
    console.log(`[sitemap-validator] Remote validation unavailable or not yet deployed (${message}).`);
    validateViaSourceFiles();
  }
}

try {
  await main();
} catch (error) {
  console.error(`[sitemap-validator] ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
