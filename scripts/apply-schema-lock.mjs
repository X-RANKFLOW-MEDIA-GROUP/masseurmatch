#!/usr/bin/env node

// Applies supabase/PRODUCTION_SCHEMA_LOCK.sql to the LIVE Supabase database
// through the Supabase Management API (HTTPS), then verifies the result with
// scripts/verify-live-schema.mjs. The schema lock is idempotent and
// additive-only, so re-running is safe.
//
// Env (or .env.local fallback):
//   SUPABASE_ACCESS_TOKEN      personal access token (sbp_...), required
//   NEXT_PUBLIC_SUPABASE_URL   used to derive the project ref
//
// Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-schema-lock.mjs

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, "supabase/PRODUCTION_SCHEMA_LOCK.sql");

function loadEnv(name) {
  if (process.env[name]) return process.env[name].trim();
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return null;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    if (line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
  }
  return null;
}

async function main() {
  const token = loadEnv("SUPABASE_ACCESS_TOKEN");
  const url = loadEnv("NEXT_PUBLIC_SUPABASE_URL");

  if (!token || !token.startsWith("sbp_")) {
    console.error("[apply-schema-lock] SUPABASE_ACCESS_TOKEN (sbp_...) is required.");
    console.error("[apply-schema-lock] Create one at https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }
  const ref = url?.match(/https:\/\/(\w+)\.supabase\.co/)?.[1];
  if (!ref) {
    console.error("[apply-schema-lock] Could not derive project ref from NEXT_PUBLIC_SUPABASE_URL.");
    process.exit(1);
  }

  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  console.log(`[apply-schema-lock] Applying schema lock to project ${ref} (${sql.length} bytes)...`);

  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[apply-schema-lock] Management API returned HTTP ${response.status}: ${body}`);
    process.exit(1);
  }

  console.log("[apply-schema-lock] Schema lock applied. Verifying live schema...");

  const verify = spawnSync(process.execPath, [path.join(ROOT, "scripts/verify-live-schema.mjs")], {
    stdio: "inherit",
  });
  process.exit(verify.status ?? 1);
}

main().catch((error) => {
  console.error(`[apply-schema-lock] ${error.message}`);
  process.exit(1);
});
