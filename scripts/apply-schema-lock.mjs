#!/usr/bin/env node

// Applies supabase/PRODUCTION_SCHEMA_LOCK.sql to the LIVE Supabase database
// through the Supabase Management API (HTTPS), then verifies the result with
// scripts/verify-live-schema.mjs.
//
// IMPORTANT: the historical schema lock currently contains out-of-scope
// booking/session-payment tables and an obsolete SECURITY DEFINER is_admin().
// This command fails closed until those declarations are removed, preventing an
// old additive contract from recreating deprecated runtime objects or restoring
// elevated admin-helper privileges after hardening migrations.
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
const FORBIDDEN_LEGACY_TABLES = [
  "appointments",
  "booking_inquiries",
  "booking_analytics",
  "payment_transactions",
  "therapist_availability",
];

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

function assertCanonicalSchemaLock(sql) {
  const offenders = FORBIDDEN_LEGACY_TABLES.filter((table) => {
    const pattern = new RegExp(`create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(?:public\\.)?${table}\\b`, "i");
    return pattern.test(sql);
  });

  if (offenders.length > 0) {
    console.error("[apply-schema-lock] Refusing to apply a non-canonical schema lock to production.");
    console.error(`[apply-schema-lock] Remove legacy table declarations first: ${offenders.join(", ")}`);
    console.error("[apply-schema-lock] Canonical MasseurMatch is directory-only; booking, scheduling, and session-payment tables must not be recreated.");
    process.exit(1);
  }

  const isAdminHeader = sql.match(
    /create\s+or\s+replace\s+function\s+(?:public\.)?is_admin\s*\(\s*\)([\s\S]*?)\bas\s+\$\$/i,
  )?.[1];
  if (isAdminHeader && /\bsecurity\s+definer\b/i.test(isAdminHeader)) {
    console.error("[apply-schema-lock] Refusing to apply a schema lock that recreates public.is_admin() as SECURITY DEFINER.");
    console.error("[apply-schema-lock] is_admin() must remain SECURITY INVOKER and rely on public.user_roles RLS.");
    process.exit(1);
  }
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
  assertCanonicalSchemaLock(sql);
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

  console.log("[apply-schema-lock] Schema lock applied. Reloading PostgREST schema cache...");
  await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema';" }),
  });

  console.log("[apply-schema-lock] Verifying live schema...");
  let status = 1;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const verify = spawnSync(process.execPath, [path.join(ROOT, "scripts/verify-live-schema.mjs")], {
      stdio: "inherit",
    });
    status = verify.status ?? 1;
    if (status === 0) break;
    if (attempt < 3) console.log(`[apply-schema-lock] Schema cache may still be stale, retrying (${attempt}/3)...`);
  }
  process.exit(status);
}

main().catch((error) => {
  console.error(`[apply-schema-lock] ${error.message}`);
  process.exit(1);
});
