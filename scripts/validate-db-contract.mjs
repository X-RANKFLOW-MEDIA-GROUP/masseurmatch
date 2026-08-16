#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, "supabase/PRODUCTION_SCHEMA_LOCK.sql");
const SCHEMA_EXTENSION_PATHS = [
  path.join(ROOT, "supabase/schema-lock/20260816_messaging_ownership.sql"),
  path.join(ROOT, "supabase/migrations/20260723150000_ai_profile_coach_base.sql"),
  path.join(ROOT, "supabase/migrations/20260806220000_harden_demand_radar.sql"),
  path.join(ROOT, "supabase/migrations/20260806230000_demand_radar_pipeline.sql"),
  path.join(ROOT, "supabase/migrations/20260814182734_create_admin_messaging_core.sql"),
  path.join(ROOT, "supabase/migrations/20260814184500_sync_profile_extras_contract.sql"),
];
const SCAN_DIRS = ["src", "scripts", "tests", "supabase"];
// Every .sql file that can define a database function. Unlike the table/column
// contract (which the schema lock owns outright), function bodies live in the
// migration history, so the RPC check reads the whole SQL corpus.
const SQL_DEFINITION_DIRS = ["supabase"];

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
  "lifecycle_email_log",
  "marketing_preferences",
  "email_suppressions",
  "email_provider_events",
  "admin_email_templates",
  "admin_email_campaigns",
  "contact_inquiries",
  "newsletter_subscribers",
  "site_settings",
];

const REQUIRED_LIFECYCLE_QUEUE_COLUMNS = [
  "id",
  "user_id",
  "recipient_email",
  "recipient_name",
  "segment",
  "campaign_key",
  "flow_key",
  "template_key",
  "send_category",
  "subject",
  "body_html",
  "body_text",
  "from_address",
  "reply_to",
  "payload",
  "scheduled_for",
  "status",
  "suppression_reason",
  "provider_id",
  "error_message",
  "retry_count",
  "max_retries",
  "idempotency_key",
  "processing_started_at",
  "sent_at",
  "created_at",
  "updated_at",
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
const IDENT_TOKEN = `(?:"[^"]+"|${IDENTIFIER})`;
const TABLE_REF = `(?:${IDENT_TOKEN}\\s*\\.\\s*)?${IDENT_TOKEN}`;

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

      const colMatch = line.match(new RegExp(`^("([^"]|"")*"|${IDENTIFIER})\\b`, "i"));
      const rawColumn = colMatch?.[1];
      if (rawColumn) addColumn(contract, table, extractColumnName(rawColumn));
    }
  }

  const createViewRegex = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?(?:materialized\\s+)?view\\s+(?:if\\s+not\\s+exists\\s+)?(${TABLE_REF})(?:\\s+with\\s*\\([^;]*?\\))?\\s+as\\s+select\\s+([\\s\\S]*?)(?:from\\s|;)`,
    "gi"
  );
  let viewMatch;
  while ((viewMatch = createViewRegex.exec(normalized))) {
    const table = extractTableName(viewMatch[1]);
    if (!contract.has(table)) contract.set(table, new Set());
    const selectList = viewMatch[2];
    for (const part of selectList.split(",")) {
      const alias = part.trim().match(new RegExp(`\\s+as\\s+(${IDENT_TOKEN})\\s*$`, "i"))?.[1];
      const col = alias
        ? extractColumnName(alias)
        : part.trim().split(".").pop()?.trim().replace(/[^a-z0-9_]/gi, "");
      if (col) addColumn(contract, table, col.toLowerCase());
    }
  }

  const alterRegex = new RegExp(`alter\\s+table\\s+(${TABLE_REF})[\\s\\S]*?;`, "gi");
  let alterMatch;
  while ((alterMatch = alterRegex.exec(normalized))) {
    const table = extractTableName(alterMatch[1]);
    const statement = alterMatch[0];

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
  const shorthandPattern = new RegExp(`^(${IDENTIFIER})$`);
  let depth = 0;
  let quote = null;
  let inValue = false;
  let segmentStart = -1;

  const addKey = (key) => {
    if (!key || ignoredKeys.has(key) || key !== key.toLowerCase()) return;
    keys.add(key);
  };

  const closeSegment = (end) => {
    if (inValue || segmentStart < 0) return;
    addKey(objectBody.slice(segmentStart, end).trim().match(shorthandPattern)?.[1]);
  };

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
      if (depth === 1) segmentStart = index + 1;
      continue;
    }

    if (char === "}" || char === "]") {
      if (depth === 1) closeSegment(index);
      depth = Math.max(0, depth - 1);
      if (depth === 0) {
        inValue = false;
        segmentStart = -1;
      }
      continue;
    }

    if (char === "," && depth === 1) {
      closeSegment(index);
      inValue = false;
      segmentStart = index + 1;
      continue;
    }

    if (char !== ":" || depth !== 1 || inValue) continue;

    const before = objectBody.slice(0, index);
    const match = before.match(new RegExp(`(${IDENTIFIER})\\s*$`));
    const key = match?.[1];
    if (key && !ignoredKeys.has(key) && key === key.toLowerCase()) {
      addKey(key);
      inValue = true;
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

function collectDefinedFunctions() {
  const defined = new Set();
  const functionRegex = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?function\\s+(?:${IDENT_TOKEN}\\s*\\.\\s*)?(${IDENT_TOKEN})\\s*\\(`,
    "gi",
  );

  for (const file of SQL_DEFINITION_DIRS.flatMap(walkFiles)) {
    if (!file.endsWith(".sql")) continue;
    const normalized = normalizeSql(fs.readFileSync(file, "utf8"));
    let match;
    while ((match = functionRegex.exec(normalized))) {
      defined.add(unquoteIdentifier(match[1]).toLowerCase());
    }
  }

  return defined;
}

function scanRpcReferences() {
  const references = new Map();
  const direct = /\.rpc\(\s*["'`]([a-zA-Z_][a-zA-Z0-9_]*)["'`]/g;
  const cast = /\.rpc\s+as\s+unknown\s+as[\s\S]{0,500}?\)\(\s*["'`]([a-zA-Z_][a-zA-Z0-9_]*)["'`]/g;

  for (const file of SCAN_DIRS.flatMap(walkFiles)) {
    if (file.endsWith(".sql")) continue;
    const source = fs.readFileSync(file, "utf8");
    for (const regex of [direct, cast]) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(source))) {
        const name = match[1].toLowerCase();
        if (!references.has(name)) references.set(name, new Set());
        references.get(name).add(path.relative(ROOT, file));
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

const contractPaths = [SCHEMA_PATH, ...SCHEMA_EXTENSION_PATHS];
for (const contractPath of contractPaths) {
  if (!fs.existsSync(contractPath)) {
    console.error(`Missing schema contract file: ${path.relative(ROOT, contractPath)}`);
    process.exit(1);
  }
}

const sql = contractPaths.map((contractPath) => fs.readFileSync(contractPath, "utf8")).join("\n");
const contract = parseSchemaContract(sql);
const scanned = scanReferences();
const errors = [];

for (const table of REQUIRED_TABLES) {
  if (!contract.has(table)) errors.push(`Missing required production table: ${table}`);
}
for (const column of REQUIRED_PROFILE_COLUMNS) {
  if (!contract.get("profiles")?.has(column)) errors.push(`profiles.${column} is missing from schema lock`);
}
for (const column of REQUIRED_LIFECYCLE_QUEUE_COLUMNS) {
  if (!contract.get("lifecycle_email_queue")?.has(column)) {
    errors.push(`lifecycle_email_queue.${column} is missing from schema lock`);
  }
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

const definedFunctions = collectDefinedFunctions();
for (const [rpcName, files] of scanRpcReferences()) {
  if (definedFunctions.has(rpcName)) continue;
  errors.push(
    `Referenced RPC missing from SQL definitions: ${rpcName} (${[...files].slice(0, 3).join(", ")})`,
  );
}

if (errors.length) {
  console.error("DB contract validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("DB contract OK");
