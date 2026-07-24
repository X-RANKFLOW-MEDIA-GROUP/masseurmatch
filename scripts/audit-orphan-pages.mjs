#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.join(root, "src", "app");
const args = new Set(process.argv.slice(2));
const jsonOutput = readArg("--json", "artifacts/orphan-pages-report.json");
const markdownOutput = readArg("--markdown", "artifacts/orphan-pages-report.md");
const failOnOrphans = args.has("--fail-on-orphans");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".md", ".mdx"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "node_modules",
  "artifacts",
  "coverage",
  "dist",
  "build",
  ".vercel",
]);

const ALWAYS_REACHABLE = new Set([
  "/",
  "/login",
  "/register",
  "/signup",
  "/admin",
  "/dashboard",
  "/pro/dashboard",
]);

const SPIKE_PATTERNS = [
  /(^|\/)design-system(\/|$)/i,
  /(^|\/)spikes?(\/|$)/i,
  /(^|\/)labs?(\/|$)/i,
  /(^|\/)playgrounds?(\/|$)/i,
  /(^|\/)experiments?(\/|$)/i,
  /(^|\/)ab-tests?(\/|$)/i,
  /(^|\/)home-3d(\/|$)/i,
  /(^|\/)keyword-trends(\/|$)/i,
];

function readArg(name, fallback) {
  const values = process.argv.slice(2);
  const index = values.indexOf(name);
  return index >= 0 && values[index + 1] ? values[index + 1] : fallback;
}

function walk(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  const queue = [directory];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);

      if (entry.isDirectory()) {
        queue.push(absolute);
      } else if (entry.isFile() && predicate(absolute, entry.name)) {
        results.push(absolute);
      }
    }
  }

  return results.sort();
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function routeFromPage(pageFile) {
  const relativeDirectory = path.relative(appRoot, path.dirname(pageFile));
  const segments = relativeDirectory === "" ? [] : toPosix(relativeDirectory).split("/");
  const routeSegments = segments.filter((segment) => !/^\(.+\)$/.test(segment) && !segment.startsWith("@"));
  return `/${routeSegments.join("/")}`.replace(/\/$/, "") || "/";
}

function isDynamicRoute(route) {
  return /\[[^\]]+\]/.test(route);
}

function isSpikeRoute(route) {
  return SPIKE_PATTERNS.some((pattern) => pattern.test(route));
}

function isPrivateRoute(route) {
  return /^(\/admin(?:\/|$)|\/dashboard(?:\/|$)|\/pro(?:\/|$)|\/client(?:\/|$)|\/account(?:\/|$)|\/api(?:\/|$))/.test(route);
}

function literalRouteReferences(source) {
  const routes = new Set();
  const pattern = /(["'`])(\/(?!\/)[^"'`\s?#]*)\1/g;
  for (const match of source.matchAll(pattern)) {
    const value = match[2];
    if (!value || value.startsWith("/_next") || value.startsWith("/api/")) continue;
    routes.add(value.length > 1 ? value.replace(/\/$/, "") : value);
  }
  return routes;
}

function routeMatchesReference(route, reference) {
  if (route === reference) return true;
  if (!isDynamicRoute(route)) return false;

  const expression = route
    .split("/")
    .map((segment) => {
      if (!segment) return "";
      if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return ".+";
      if (/^\[\[\.\.\.[^\]]+\]\]$/.test(segment)) return ".*";
      if (/^\[[^\]]+\]$/.test(segment)) return "[^/]+";
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");

  return new RegExp(`^${expression}$`).test(reference);
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const pageFiles = walk(appRoot, (_absolute, name) => name === "page.tsx" || name === "page.ts" || name === "page.jsx" || name === "page.js");
const sourceFiles = walk(root, (absolute) => SOURCE_EXTENSIONS.has(path.extname(absolute)) && !absolute.endsWith("scripts/audit-orphan-pages.mjs"));
const references = new Map();

for (const sourceFile of sourceFiles) {
  const relative = toPosix(path.relative(root, sourceFile));
  const source = fs.readFileSync(sourceFile, "utf8");
  for (const route of literalRouteReferences(source)) {
    const existing = references.get(route) ?? [];
    existing.push(relative);
    references.set(route, existing);
  }
}

const results = pageFiles.map((pageFile) => {
  const route = routeFromPage(pageFile);
  const sourceFile = toPosix(path.relative(root, pageFile));
  const matchedReferences = [];

  for (const [reference, files] of references.entries()) {
    if (!routeMatchesReference(route, reference)) continue;
    for (const file of files) {
      if (file !== sourceFile) matchedReferences.push({ reference, file });
    }
  }

  const category = isSpikeRoute(route)
    ? "spike"
    : isPrivateRoute(route)
      ? "private"
      : isDynamicRoute(route)
        ? "dynamic"
        : "public";

  const protectedRoute = ALWAYS_REACHABLE.has(route) || category === "spike" || category === "private" || category === "dynamic";
  const status = matchedReferences.length > 0 || protectedRoute ? "reachable" : "review";

  return {
    route,
    sourceFile,
    category,
    status,
    references: matchedReferences,
    reason:
      matchedReferences.length > 0
        ? "Referenced by another source file"
        : protectedRoute
          ? `Protected ${category} route; manual deletion is not allowed`
          : "No literal route reference found; manually verify sitemap, redirects, middleware, external links, and programmatic navigation",
  };
});

const review = results.filter((entry) => entry.status === "review");
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    pages: results.length,
    reachable: results.length - review.length,
    review: review.length,
  },
  rules: {
    automaticDeletion: false,
    protectedCategories: ["spike", "private", "dynamic"],
  },
  pages: results,
};

const jsonPath = path.join(root, jsonOutput);
ensureParent(jsonPath);
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  "# Orphan Page Audit",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `- Pages scanned: ${report.summary.pages}`,
  `- Reachable or protected: ${report.summary.reachable}`,
  `- Manual review candidates: ${report.summary.review}`,
  "",
  "> This audit never deletes files. Dynamic, private, and spike routes are protected by design.",
  "",
  "## Manual Review Candidates",
  "",
];

if (review.length === 0) {
  lines.push("No unreferenced public static pages were found.");
} else {
  lines.push("| Route | Source | Reason |", "|---|---|---|");
  for (const entry of review) {
    lines.push(`| \`${entry.route}\` | \`${entry.sourceFile}\` | ${entry.reason} |`);
  }
}

lines.push("", "## Protected Internal Routes", "", "| Route | Category | Source |", "|---|---|---|");
for (const entry of results.filter((item) => item.category === "spike" || item.category === "private")) {
  lines.push(`| \`${entry.route}\` | ${entry.category} | \`${entry.sourceFile}\` |`);
}

const markdownPath = path.join(root, markdownOutput);
ensureParent(markdownPath);
fs.writeFileSync(markdownPath, `${lines.join("\n")}\n`);

console.log(`[audit-orphans] scanned ${results.length} pages; ${review.length} require manual review`);
console.log(`[audit-orphans] JSON: ${jsonOutput}`);
console.log(`[audit-orphans] Markdown: ${markdownOutput}`);

if (failOnOrphans && review.length > 0) {
  process.exit(1);
}
