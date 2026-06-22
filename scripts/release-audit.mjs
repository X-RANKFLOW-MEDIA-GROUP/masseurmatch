#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/_lib/seo-routes.ts",
  "src/app/therapists/page.tsx",
  "src/app/therapists/[slug]/page.tsx",
  "src/app/login/page.tsx",
  "src/app/register/page.tsx",
  "src/app/admin/page.tsx",
  "src/lib/env.ts",
  "src/app/_lib/directory-fallback.ts",
  "scripts/validate-sitemap.mjs",
];

const requiredRoutePaths = [
  "src/app/page.tsx",
  "src/app/search/page.tsx",
  "src/app/explore/page.tsx",
  "src/app/near-me/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/for-therapists/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/guides/page.tsx",
  "src/app/compare/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
];

const forbiddenPhrases = ["Book Now", "Reserve Appointment", "License Verified by MasseurMatch"];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function checkRequiredFiles() {
  for (const relPath of requiredFiles) {
    assert(exists(relPath), `Missing required file: ${relPath}`);
  }
}

function checkCriticalRoutes() {
  for (const relPath of requiredRoutePaths) {
    assert(exists(relPath), `Missing critical route file: ${relPath}`);
  }
  assert(
    exists("src/app/dashboard/page.tsx") ||
      exists("src/app/pro/dashboard/page.tsx") ||
      exists("src/app/client/dashboard/page.tsx"),
    "Missing dashboard route file (expected one of /dashboard, /pro/dashboard, /client/dashboard)",
  );
}

function checkEnvExample() {
  const envCandidates = [".env.example", ".env.local.example"];
  const envFile = envCandidates.find((file) => exists(file));
  assert(envFile, "Missing .env.example (or .env.local.example)");
  const source = fs.readFileSync(path.join(root, envFile), "utf8");
  const requiredKeys = ["NEXT_PUBLIC_APP_URL","SUPABASE_URL","NEXT_PUBLIC_SUPABASE_URL","SUPABASE_ANON_KEY","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","MM_SESSION_SECRET","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","STRIPE_PRICE_STANDARD","STRIPE_PRICE_PRO","STRIPE_PRICE_ELITE"];
  for (const key of requiredKeys) {
    assert(source.includes(key), `Env example missing key: ${key}`);
  }
}

function checkSitemapPrivacyRules() {
  const source = fs.readFileSync(path.join(root, "src/app/_lib/seo-routes.ts"), "utf8");
  const requiredPrivate = ["/admin", "/dashboard", "/api", "/login", "/register"];
  for (const route of requiredPrivate) {
    assert(source.includes(route), `seo-routes.ts missing private route disallow marker: ${route}`);
  }
}

function checkBuildScripts() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  for (const scriptName of ["build", "lint", "typecheck", "test", "validate:sitemap"]) {
    assert(pkg.scripts?.[scriptName], `package.json scripts missing "${scriptName}"`);
  }
}

function checkForbiddenPhrases() {
  const appDir = path.join(root, "src/app");
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".md"))) {
        files.push(absolute);
      }
    }
  };
  walk(appDir);
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const phrase of forbiddenPhrases) {
      assert(!text.includes(phrase), `Forbidden phrase "${phrase}" found in ${path.relative(root, file)}`);
    }
  }
}

function checkStripePriceIds() {
  // If Stripe is configured, all price IDs must be present.
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return; // Stripe not configured — skip (non-production environment).
  const required = ["STRIPE_PRICE_STANDARD", "STRIPE_PRICE_PRO", "STRIPE_PRICE_ELITE"];
  for (const key of required) {
    const value = process.env[key];
    assert(value && value.startsWith("price_"), `${key} must be set to a valid Stripe price ID (price_...) when STRIPE_SECRET_KEY is configured`);
  }
}

function checkCriticalTodoFixme() {
  const criticalDirs = ["src/app", "src/app/api"];
  for (const relDir of criticalDirs) {
    const full = path.join(root, relDir);
    if (!exists(relDir)) continue;
    const queue = [full];
    while (queue.length > 0) {
      const current = queue.pop();
      if (!current) continue;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const absolute = path.join(current, entry.name);
        if (entry.isDirectory()) {
          queue.push(absolute);
          continue;
        }
        if (!entry.isFile() || (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx"))) {
          continue;
        }
        const source = fs.readFileSync(absolute, "utf8");
        if (/TODO|FIXME/.test(source)) {
          throw new Error(`Critical TODO/FIXME found in ${path.relative(root, absolute)}`);
        }
      }
    }
  }
}

function run() {
  checkRequiredFiles();
  checkCriticalRoutes();
  checkEnvExample();
  checkSitemapPrivacyRules();
  checkBuildScripts();
  checkForbiddenPhrases();
  checkStripePriceIds();
  checkCriticalTodoFixme();
  console.log("[release-audit] OK");
}

try {
  run();
} catch (error) {
  console.error(`[release-audit] ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
