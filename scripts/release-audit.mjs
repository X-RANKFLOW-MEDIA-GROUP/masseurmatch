#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function exists(path) {
  return existsSync(join(root, path));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assertFile(path, label = path) {
  if (!exists(path)) {
    fail(`Missing required file: ${label}`);
  }
}

function walk(dir, files = []) {
  const absolute = join(root, dir);
  if (!existsSync(absolute)) return files;

  for (const entry of readdirSync(absolute)) {
    const current = join(absolute, entry);
    const stats = statSync(current);

    if (stats.isDirectory()) {
      if ([".next", "node_modules", ".git", "coverage", "playwright-report"].includes(entry)) continue;
      walk(relative(root, current), files);
      continue;
    }

    if (/\.(ts|tsx|js|jsx|md|json|mjs|css)$/.test(entry)) {
      files.push(relative(root, current));
    }
  }

  return files;
}

const requiredFiles = [
  "package.json",
  "pnpm-lock.yaml",
  "next.config.mjs",
  "tsconfig.json",
  "tsconfig.typecheck.json",
  "tailwind.config.ts",
  ".env.example",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/therapists/page.tsx",
  "src/app/therapists/[slug]/page.tsx",
  "src/app/search/page.tsx",
  "src/app/register/page.tsx",
  "src/app/login/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/seo/page.tsx",
  "src/app/api/webhooks/stripe/route.ts",
  "src/app/_lib/directory.ts",
  "src/app/_lib/directory-fallback.ts",
  "src/app/_lib/seo-routes.ts",
  "src/app/_lib/launch-urls.ts",
  ".github/workflows/ci.yml",
];

requiredFiles.forEach((file) => assertFile(file));

const requiredRouteFiles = [
  "src/app/about/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/for-therapists/page.tsx",
  "src/app/safety/page.tsx",
  "src/app/trust/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/faq/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/guides/page.tsx",
  "src/app/compare/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/[city]/page.tsx",
  "src/app/[city]/[segment]/page.tsx",
  "src/app/[city]/[segment]/[keyword]/page.tsx",
  "src/app/[city]/areas/[area]/page.tsx",
];

requiredRouteFiles.forEach((file) => assertFile(file));

if (exists("package.json")) {
  const packageJson = JSON.parse(read("package.json"));
  const scripts = packageJson.scripts ?? {};
  for (const script of ["lint", "typecheck", "test", "build", "validate:sitemap"]) {
    if (!scripts[script]) fail(`Missing package script: ${script}`);
  }
}

if (exists(".env.example")) {
  const envExample = read(".env.example");
  const requiredEnvKeys = [
    "NEXT_PUBLIC_APP_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "MM_SESSION_SECRET",
    "SESSION_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_STANDARD",
    "STRIPE_PRICE_PRO",
    "STRIPE_PRICE_ELITE",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "GEMINI_API_KEY",
  ];

  for (const key of requiredEnvKeys) {
    if (!envExample.includes(key)) fail(`.env.example missing key: ${key}`);
  }
}

if (exists("src/app/_lib/seo-routes.ts")) {
  const seoRoutes = read("src/app/_lib/seo-routes.ts");
  const privatePaths = ["/admin", "/api", "/login", "/register", "/dashboard"];
  for (const privatePath of privatePaths) {
    if (!seoRoutes.includes(privatePath)) fail(`SEO robots config does not include private path: ${privatePath}`);
  }

  const filterPatterns = ["sort", "verified", "availability", "radius", "session", "modality", "page"];
  for (const pattern of filterPatterns) {
    if (!seoRoutes.includes(pattern)) warn(`SEO robots config may be missing filter pattern: ${pattern}`);
  }
}

if (exists("src/app/_lib/directory-fallback.ts")) {
  const fallback = read("src/app/_lib/directory-fallback.ts");
  for (const requiredField of ["available_now", "incall_price", "outcall_price", "lgbtq_affirming"]) {
    if (!fallback.includes(requiredField)) warn(`Fallback directory data may be missing field: ${requiredField}`);
  }
}

const filesToScan = walk("src").concat(walk("docs"));
const forbiddenPatterns = [
  { pattern: /Book Now/i, message: "Forbidden booking CTA: Book Now" },
  { pattern: /Reserve Appointment/i, message: "Forbidden booking CTA: Reserve Appointment" },
  { pattern: /Pay Now/i, message: "Forbidden visitor payment CTA: Pay Now" },
  { pattern: /licensed by MasseurMatch/i, message: "Forbidden license claim: licensed by MasseurMatch" },
  { pattern: /license verified by MasseurMatch/i, message: "Forbidden license claim: license verified by MasseurMatch" },
  { pattern: /MasseurMatch verifies licensure/i, message: "Forbidden license claim: MasseurMatch verifies licensure" },
];

for (const file of filesToScan) {
  const content = read(file);
  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(content)) {
      fail(`${message} in ${file}`);
    }
  }
}

const criticalAppFiles = filesToScan.filter((file) => file.startsWith("src/app/") && /page\.(tsx|ts)$/.test(file));
for (const file of criticalAppFiles) {
  const content = read(file);
  if (/TODO|FIXME|coming soon/i.test(content) && !file.includes("blog")) {
    warn(`Possible unfinished marker in app route: ${file}`);
  }
}

console.log("\nMasseurMatch Go Live Release Audit");
console.log("=================================");

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (failures.length) {
  console.error("\nFailures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(`\nRelease audit failed with ${failures.length} blocking issue(s).`);
  process.exit(1);
}

console.log("\nRelease audit passed. Required go live structure and guardrails are present.");
