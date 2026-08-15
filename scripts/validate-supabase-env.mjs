const PRODUCTION_PROJECT_REF = "ijsdpozjfjjufjsoexod";

const serverUrlPriority = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"];
const browserUrlPriority = ["NEXT_PUBLIC_SUPABASE_URL"];
const urlVariableNames = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
];

const serverAnonKeyPriority = [
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
const browserAnonKeyPriority = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
const keyVariableNames = [
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SITEMAP_SUPABASE_KEY",
];

function fail(message) {
  console.error(`\nSupabase environment validation failed: ${message}\n`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Supabase environment warning: ${message}`);
}

function configuredValue(name) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function selectedName(priority) {
  return priority.find((name) => configuredValue(name)) ?? null;
}

function parseSupabaseUrl(name, value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(`${name} is not a valid URL.`);
  }

  if (parsed.protocol !== "https:") fail(`${name} must use https.`);

  const match = /^([a-z0-9]{20})\.supabase\.co$/.exec(parsed.hostname);
  if (!match) {
    fail(`${name} does not point to a valid Supabase project hostname: ${parsed.hostname}.`);
  }

  return { origin: parsed.origin, hostname: parsed.hostname, projectRef: match[1] };
}

function readJwtMetadata(name, token) {
  if (token.startsWith("sb_publishable_") || token.startsWith("sb_secret_")) {
    return { projectRef: null, role: null };
  }

  const parts = token.split(".");
  if (parts.length !== 3) fail(`${name} is neither a recognized Supabase key nor a valid JWT.`);

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return {
      projectRef: typeof payload.ref === "string" ? payload.ref : null,
      role: typeof payload.role === "string" ? payload.role : null,
    };
  } catch {
    fail(`${name} has an unreadable JWT payload.`);
  }
}

function validateSelectedKey(name, projectRef, expectedRole = null) {
  const value = configuredValue(name);
  if (!value) return;
  const metadata = readJwtMetadata(name, value);

  if (metadata.projectRef && metadata.projectRef !== projectRef) {
    fail(`${name} belongs to project ${metadata.projectRef}, but its active runtime URL uses ${projectRef}.`);
  }

  if (expectedRole && metadata.role && metadata.role !== expectedRole) {
    fail(`${name} has JWT role ${metadata.role}, but ${expectedRole} is required.`);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function verifyReachable(origin) {
  if (process.env.VERCEL !== "1" && process.env.SUPABASE_HEALTHCHECK_STRICT !== "1") return;

  const strict = process.env.SUPABASE_HEALTHCHECK_STRICT === "1";
  const attempts = 3;
  const timeoutMs = 12_000;
  let lastDetail = "unknown network error";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${origin}/auth/v1/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      if (response.status < 500) return;
      lastDetail = `HTTP ${response.status}`;
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < attempts) {
      console.warn(
        `Supabase health check attempt ${attempt}/${attempts} failed for ${origin} (${lastDetail}); retrying...`,
      );
      await delay(1_500 * attempt);
    }
  }

  const message =
    `Supabase project ${origin} was unreachable after ${attempts} attempts (${lastDetail}). ` +
    "Static URL and key validation passed.";
  if (strict) fail(message);
  warn(`${message} Continuing because external network availability is not a reliable build gate.`);
}

const browserUrlName = selectedName(browserUrlPriority);
if (!browserUrlName) {
  fail("NEXT_PUBLIC_SUPABASE_URL must be configured; no fallback project is used.");
}
const serverUrlName = selectedName(serverUrlPriority) || browserUrlName;

const browserUrl = parseSupabaseUrl(browserUrlName, configuredValue(browserUrlName));
const serverUrl = parseSupabaseUrl(serverUrlName, configuredValue(serverUrlName));

if (serverUrl.projectRef !== browserUrl.projectRef) {
  fail(
    `Server runtime points to ${serverUrl.hostname}, while the browser client points to ${browserUrl.hostname}. ` +
      "The active Supabase URLs must use the same project.",
  );
}

const activeProjectRef = browserUrl.projectRef;
if (process.env.VERCEL_ENV === "production" && activeProjectRef !== PRODUCTION_PROJECT_REF) {
  fail(`Production points to project ${activeProjectRef}, but MasseurMatch production must use ${PRODUCTION_PROJECT_REF}.`);
}

const activeUrlNames = new Set([serverUrlName, browserUrlName]);
for (const name of urlVariableNames) {
  const value = configuredValue(name);
  if (!value || activeUrlNames.has(name)) continue;

  let parsed;
  try {
    parsed = parseSupabaseUrl(name, value);
  } catch {
    continue;
  }

  if (parsed.projectRef !== activeProjectRef) {
    warn(
      `${name} points to ${parsed.hostname}, but it is shadowed by the active runtime configuration ` +
        `for ${browserUrl.hostname}. Remove or update this legacy value when convenient.`,
    );
  }
}

const browserAnonKeyName = selectedName(browserAnonKeyPriority);
if (!browserAnonKeyName) {
  fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured.");
}
const serverAnonKeyName = selectedName(serverAnonKeyPriority) || browserAnonKeyName;

validateSelectedKey(serverAnonKeyName, serverUrl.projectRef);
if (browserAnonKeyName !== serverAnonKeyName) validateSelectedKey(browserAnonKeyName, browserUrl.projectRef);
if (configuredValue("SUPABASE_SERVICE_ROLE_KEY")) {
  validateSelectedKey("SUPABASE_SERVICE_ROLE_KEY", serverUrl.projectRef, "service_role");
}

const activeKeyNames = new Set([
  serverAnonKeyName,
  browserAnonKeyName,
  configuredValue("SUPABASE_SERVICE_ROLE_KEY") ? "SUPABASE_SERVICE_ROLE_KEY" : null,
].filter(Boolean));

for (const name of keyVariableNames) {
  const value = configuredValue(name);
  if (!value || activeKeyNames.has(name)) continue;

  const metadata = readJwtMetadata(name, value);
  if (metadata.projectRef && metadata.projectRef !== activeProjectRef) {
    warn(
      `${name} belongs to project ${metadata.projectRef}, but it is shadowed by active runtime keys ` +
        `for ${activeProjectRef}. Remove or update this legacy value when convenient.`,
    );
  }
}

await verifyReachable(browserUrl.origin);

const environment = process.env.VERCEL_ENV || "local/ci";
console.log(
  `Supabase environment verified for ${environment}: ${browserUrl.hostname} ` +
    `(active server=${serverUrlName}, browser=${browserUrlName}, browser key=${browserAnonKeyName}).`,
);
