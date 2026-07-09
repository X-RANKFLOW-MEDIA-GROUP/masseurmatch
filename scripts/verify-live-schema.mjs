#!/usr/bin/env node

// Verifies the LIVE Supabase database against supabase/PRODUCTION_SCHEMA_LOCK.sql.
// Reads the live schema from the PostgREST OpenAPI endpoint (service role key),
// parses expected tables/columns from the schema lock, and reports any gaps.
//
// Env (or .env.local fallback):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Exit codes: 0 = live schema satisfies the contract, 1 = gaps found or error.

import fs from "node:fs";
import path from "node:path";

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

function parseExpectedSchema(sql) {
  const expected = new Map();
  const ensure = (table) => {
    if (!expected.has(table)) expected.set(table, new Set());
    return expected.get(table);
  };

  const createRe = /create table if not exists public\.(\w+)\s*\(([\s\S]*?)\n\);/g;
  for (const match of sql.matchAll(createRe)) {
    const cols = ensure(match[1]);
    let depth = 0;
    for (const rawLine of match[2].split("\n")) {
      const line = rawLine.trim().replace(/,$/, "");
      if (!line || line.startsWith("--")) continue;
      if (depth === 0) {
        const word = line.split(/\s/)[0];
        const isConstraint = ["primary", "foreign", "unique", "check", "constraint"].includes(word);
        if (!isConstraint && /^[a-z_]+$/.test(word)) cols.add(word);
      }
      depth += (line.match(/\(/g) ?? []).length - (line.match(/\)/g) ?? []).length;
    }
  }

  const alterRe = /alter table (?:public\.)?(\w+)([^;]+);/g;
  for (const match of sql.matchAll(alterRe)) {
    const cols = ensure(match[1]);
    for (const col of match[2].matchAll(/add column if not exists (\w+)/g)) {
      cols.add(col[1]);
    }
  }

  return expected;
}

async function fetchLiveSchema(url, key) {
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`PostgREST OpenAPI request failed: HTTP ${response.status}`);
  }
  const spec = await response.json();
  const live = new Map();
  for (const [table, definition] of Object.entries(spec.definitions ?? {})) {
    live.set(table, new Set(Object.keys(definition.properties ?? {})));
  }
  return live;
}

async function main() {
  const url = loadEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = loadEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.error("[verify-live-schema] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    process.exit(1);
  }

  const expected = parseExpectedSchema(fs.readFileSync(SCHEMA_PATH, "utf8"));
  const live = await fetchLiveSchema(url, key);

  const missingTables = [];
  const missingColumns = [];
  for (const [table, cols] of [...expected.entries()].sort()) {
    const liveCols = live.get(table);
    if (!liveCols) {
      missingTables.push(table);
      continue;
    }
    const gap = [...cols].filter((col) => !liveCols.has(col)).sort();
    if (gap.length > 0) missingColumns.push({ table, gap });
  }

  if (missingTables.length === 0 && missingColumns.length === 0) {
    console.log(`[verify-live-schema] OK — live database satisfies the contract (${expected.size} tables checked).`);
    return;
  }

  if (missingTables.length > 0) {
    console.error(`[verify-live-schema] Missing tables: ${missingTables.join(", ")}`);
  }
  for (const { table, gap } of missingColumns) {
    console.error(`[verify-live-schema] ${table} is missing columns: ${gap.join(", ")}`);
  }
  console.error("[verify-live-schema] FAIL — apply supabase/PRODUCTION_SCHEMA_LOCK.sql to converge the database.");
  process.exit(1);
}

main().catch((error) => {
  console.error(`[verify-live-schema] ${error.message}`);
  process.exit(1);
});
