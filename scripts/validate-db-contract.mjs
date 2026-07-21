#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, "supabase/PRODUCTION_SCHEMA_LOCK.sql");
const SCAN_DIRS = ["src", "scripts", "tests", "supabase"];

const REQUIRED_TABLES = [
  "users",
  "user_roles",
  "profiles",
  "profile_reviews",
  "admin_actions",
  "profile_photos",
  "therapist_photos",
  "identity_verifications",
  "audit_log",
  "lifecycle_email_queue",
  "contact_inquiries",
  "newsletter_subscribers",
  "site_settings",
];

const REQUIRED_PROFILE_COLUMNS = [
  "id",
  "user_id",
  "slug",
  "email",
  "full_name",
  "display_name",
  "headline",
  "bio",
  "photo_url",
  "avatar_url",
  "city",
  "state",
  "country",
  "neighborhood",
  "phone",
  "phone_number",
  "whatsapp_number",
  "email_address",
  "website",
  "service_categories",
  "modalities",
  "languages",
  "incall",
  "outcall",
  "offers_incall",
  "offers_outcall",
  "starting_price",
  "price_min",
  "price_max",
  "incall_price",
  "outcall_price",
  "outcall_radius",
  "available_now",
  "verification_status",
  "profile_status",
  "visibility_status",
  "status",
  "is_active",
  "is_featured",
  "is_suspended",
  "is_banned",
  "is_demo",
  "subscription_tier",
  "subscription_status",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_verification_session_id",
  "current_period_end",
  "_tier",
  "photo_limit",
  "visibility_level",
  "featured_until",
  "seo_title",
  "seo_description",
  "seo_keywords",
  "profile_completeness",
  "profile_views",
  "contact_clicks",
  "submitted_at",
  "approved_at",
  "approved_by",
  "moderation_notes",
  "created_at",
  "updated_at",
  "last_active_at",
];

const ALLOWED_PROFILE_STATUS = [
  "draft",
  "pending",
  "pending_approval",
  "under_review",
  "approved",
  "suspended",
  "rejected",
  "changes_requested",
];

const ALLOWED_SUBSCRIPTION_TIERS = ["free", "standard", "pro", "elite", "featured"];
const IGNORED_TABLES = new Set(["auth.users", "storage.buckets", "storage.objects"]);
const IDENTIFIER = "[a-zA-Z_][a-zA-Z0-9_]*";
const IDENT_TOKEN = `(?:"[^"]+"|${IDENTIFIER})`; // quoted or unquoted identifier
const TABLE_REF = `(?:${IDENT_TOKEN}\\s*\\.\\s*)?${IDENT_TOKEN}`; // [schema.]table

function walkFiles(dir) {
  const absolute = path.join(ROOT, dir);
  if (!fs.existsSync(absolute)) return [];
  const results = [];
  const stack = [absolute];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".next", ".git", "dist", "build"].includes(entry.name)) continue;
        stack.push(full);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs|sql)$/.test(entry.name)) {
        results.push(full);
      }
    }
  }
  return results;
}

function normalizeSql(sql) {
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").toLowerCase();
}

function unquoteIdentifier(identifier) {
  if (!identifier) return "";
  const value = identifier.trim();
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1).replace(/""/g, '"');
  return value;
}

function extractTableName(tableRef) {
  // Handles:
  // - profiles
  // - public.profiles
  // - "profiles"
  // - "public"."profiles"
  // - public."profiles"
  const parts = tableRef
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);

  const tablePart = parts[parts.length - 1] || tableRef;
  return unquoteIdentifier(tablePart).toLowerCase();
}

function extractColumnName(columnToken) {
  return unquoteIdentifier(columnToken).toLowerCase();
}

function addColumn(contract, table, column) {
  const cleanTable = table.replace(/^public\./, "").toLowerCase();
  const cleanColumn = column.toLowerCase();
  if (!contract.has(cleanTable)) contract.set(cleanTable, new Set());
  contract.get(cleanTable).add(cleanColumn);
}

function parseSchemaContract(sql) {
  const contract = new Map();
  const normalized = normalizeSql(sql);

  // CREATE TABLE [IF NOT EXISTS] [schema.]table (...)
  const createTableRegex = new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(${TABLE_REF})\\s*\\(([\\s\\S]*?)\\);`,
    "gi"
  );

  let tableMatch;
  while ((tableMatch = createTableRegex.exec(normalized))) {
    const table = extractTableName(tableMatch[1]);
    const body = tableMatch[2];

    if (!contract.has(table)) contract.set(table, new Set());

    for (const rawLine of body.split("\n")) {
      const line = rawLine.trim().replace(/,$/, "");
      if (!line || /^(constraint|primary|foreign|unique|check|exclude)\b/.test(line)) continue;

      // Column definition starts with either "quoted_ident" or unquoted_ident
      const colMatch = line.match(new RegExp(`^("([^"]|"")*"|${IDENTIFIER})\\b`, "i"));
      const rawColumn = colMatch?.[1];
      if (rawColumn) addColumn(contract, table, extractColumnName(rawColumn));
    }
  }

  // CREATE [OR REPLACE] VIEW [schema.]view AS SELECT col1, col2, ...
  // Register views so code that queries them doesn't trigger "missing table" errors.
  const createViewRegex = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?(?:materialized\\s+)?view\\s+(?:if\\s+not\\s+exists\\s+)?(${TABLE_REF})\\s+as\\s+select\\s+([\\s\\S]*?)(?:from\\s|;)`,
    "gi"
  );
  let viewMatch;
  while ((viewMatch = createViewRegex.exec(normalized))) {
    const table = extractTableName(viewMatch[1]);
    if (!contract.has(table)) contract.set(table, new Set());
    // Extract column aliases from the SELECT list so column-level checks pass too.
    const selectList = viewMatch[2];
    for (const part of selectList.split(",")) {
      const col = part.trim().replace(/\s+as\s+\S+$/, "").split(".").pop()?.trim().replace(/[^a-z0-9_]/gi, "");
      if (col) addColumn(contract, table, col.toLowerCase());
    }
  }

  // ALTER TABLE [schema.]table ... ;
  const alterRegex = new RegExp(`alter\\s+table\\s+(${TABLE_REF})[\\s\\S]*?;`, "gi");
  let alterMatch;
  while ((alterMatch = alterRegex.exec(normalized))) {
    const table = extractTableName(alterMatch[1]);
    const statement = alterMatch[0];

    // ADD COLUMN [IF NOT EXISTS] column_name
    const columnRegex = new RegExp(
      `add\\s+column\\s+(?:if\\s+not\\s+exists\\s+)?("([^"]|"")*"|${IDENTIFIER})\\b`,
      "gi"
    );
    let columnMatch;
    while ((columnMatch = columnRegex.exec(statement))) {
      addColumn(contract, table, extractColumnName(columnMatch[1]));
    }
  }

  return contract;
}

function extractSelectColumns(selectBody) {
  const parts = [];
  let depth = 0;
  let current = "";

  for (const char of selectBody) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) parts.push(current);

  return parts
    .map((part) => part.trim().replace(/!inner|!left|!right/g, ""))
    .filter((part) => part && part !== "*" && !part.includes("("))
    .map((part) => part.split(":").pop()?.trim() || "")
    .map((part) => part.match(new RegExp(`^(${IDENTIFIER})\\b`, "i"))?.[1])
    .filter(Boolean);
}

function extractObjectKeys(objectBody) {
  const keys = new Set();
  const ignoredKeys = new Set(["true", "false", "null", "undefined"]);
  let depth = 0;
  let quote = null;
  let inValue = false; // true after key: — suppresses ternary `:` false positives

  for (let index = 0; index < objectBody.length; index += 1) {
    const char = objectBody[index];
    const previous = objectBody[index - 1];

    if (quote) {
      if (char === quote && previous !== "\\") quote = null;
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{" || char === "[") {
      depth += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      depth = Math.max(0, depth - 1);
      if (depth === 0) inValue = false;
      continue;
    }

    // A comma at depth 1 means we moved to the next key-value pair
    if (char === "," && depth === 1) {
      inValue = false;
      continue;
    }

    if (char !== ":" || depth !== 1 || inValue) continue;

    const before = objectBody.slice(0, index);
    const match = before.match(new RegExp(`(${IDENTIFIER})\\s*$`));
    const key = match?.[1];
    if (key && !ignoredKeys.has(key) && key === key.toLowerCase()) {
      keys.add(key);
      inValue = true; // suppress ternary `:` until next comma at depth 1
    }
  }

  return [...keys];
}

function scanReferences() {
  const references = new Map();
  const addRef = (table, column, file) => {
    if (!table || IGNORED_TABLES.has(table)) return;
    const cleanTable = table.replace(/^public\./, "").toLowerCase();
    if (!references.has(cleanTable)) references.set(cleanTable, new Map());
    if (!column) return;
    const cleanColumn = column.toLowerCase();
    if (!references.get(cleanTable).has(cleanColumn)) references.get(cleanTable).set(cleanColumn, new Set());
    references.get(cleanTable).get(cleanColumn).add(path.relative(ROOT, file));
  };

  for (const file of SCAN_DIRS.flatMap(walkFiles)) {
    const source = fs.readFileSync(file, "utf8");
    let match;
    const fromRegex = /\.from\(["'`]([a-zA-Z_][a-zA-Z0-9_\.]*?)["'`]\)/g;
    while ((match = fromRegex.exec(source))) addRef(match[1], null, file);

    const chainRegex = /\.from\(["'`]([a-zA-Z_][a-zA-Z0-9_\.]*?)["'`]\)([\s\S]{0,2500}?)(?=\.from\(|;|\n\s*return|\n\s*const|\n\s*let|\n\s*await|$)/g;
    let chainMatch;
    while ((chainMatch = chainRegex.exec(source))) {
      const table = chainMatch[1];
      const chain = chainMatch[2];
      const colRegex = /\.(?:eq|neq|gt|gte|lt|lte|order)\(["'`]([a-zA-Z_][a-zA-Z0-9_]*)["'`]/g;
      let colMatch;
      while ((colMatch = colRegex.exec(chain))) addRef(table, colMatch[1], file);

      const selectRegex = /\.select\(\s*["'`]([\s\S]*?)["'`]\s*\)/g;
      let selectMatch;
      while ((selectMatch = selectRegex.exec(chain))) {
        for (const column of extractSelectColumns(selectMatch[1])) addRef(table, column, file);
      }

      const objectRegex = /\.(?:insert|update|upsert)\(\s*({[\s\S]*?})\s*(?:,|\))/g;
      let objectMatch;
      while ((objectMatch = objectRegex.exec(chain))) {
        for (const column of extractObjectKeys(objectMatch[1])) addRef(table, column, file);
      }
    }
  }
  return references;
}

function schemaContainsAllowedValues(sql, constraintName, values) {
  const normalized = normalizeSql(sql);
  const index = normalized.indexOf(constraintName.toLowerCase());
  if (index === -1) return { ok: false, missing: values };
  const segment = normalized.slice(index, index + 700);
  const missing = values.filter((value) => !segment.includes(`'${value}'`));
  return { ok: missing.length === 0, missing };
}

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`Missing schema lock file: ${path.relative(ROOT, SCHEMA_PATH)}`);
  process.exit(1);
}

const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
const contract = parseSchemaContract(sql);
const scanned = scanReferences();
const errors = [];

for (const table of REQUIRED_TABLES) {
  if (!contract.has(table)) errors.push(`Missing required production table: ${table}`);
}
for (const column of REQUIRED_PROFILE_COLUMNS) {
  if (!contract.get("profiles")?.has(column)) errors.push(`profiles.${column} is missing from schema lock`);
}

const profileStatus = schemaContainsAllowedValues(sql, "profiles_profile_status_check", ALLOWED_PROFILE_STATUS);
if (!profileStatus.ok) errors.push(`profiles_profile_status_check missing values: ${profileStatus.missing.join(", ")}`);

const tierStatus = schemaContainsAllowedValues(sql, "profiles_subscription_tier_check", ALLOWED_SUBSCRIPTION_TIERS);
if (!tierStatus.ok) errors.push(`profiles_subscription_tier_check missing values: ${tierStatus.missing.join(", ")}`);

for (const [table, columns] of scanned) {
  if (IGNORED_TABLES.has(table)) continue;
  if (!contract.has(table)) {
    errors.push(`Referenced table missing from schema lock: ${table}`);
    continue;
  }
  for (const [column, files] of columns) {
    if (!contract.get(table)?.has(column)) errors.push(`Referenced column missing from schema lock: ${table}.${column} (${[...files].slice(0, 3).join(", ")})`);
  }
}

if (errors.length) {
  console.error("DB contract validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("DB contract OK");
