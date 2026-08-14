const PRODUCTION_PROJECT_REF = "ijsdpozjfjjufjsoexod";
const PRODUCTION_HOSTNAME = `${PRODUCTION_PROJECT_REF}.supabase.co`;
const FALLBACK_URL = `https://${PRODUCTION_HOSTNAME}`;

const serverUrlPriority = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"];
const browserUrlPriority = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
];
const urlVariableNames = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
];

const serverAnonKeyPriority = [
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];
const browserAnonKeyPriority = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
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

function parseSupabaseUrl(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") {
    throw new Error("must use https");
  }

  const match = /^([a-z0-9]{20})\.supabase\.co$/.exec(parsed.hostname);
  if (!match) {
    throw new Error(`does not point to a valid Supabase project hostname: ${parsed.hostname}`);
  }

  return {
    origin: parsed.origin,
    hostname: parsed.hostname,
    projectRef: match[1],
  };
}

function parseSelectedUrl(name, value) {
  try {
    return parseSupabaseUrl(value);
  } catch (error) {
    fail(`${name} ${error instanceof Error ? error.message : String(error)}.`);
  }
}

function readJwtMetadata(token) {
  // New Supabase publishable/secret keys are opaque. Their project is
  // validated through the selected runtime URL; legacy anon/service keys are JWTs.
  if (token.startsWith("sb_publishable_") || token.startsWith("sb_secret_")) {
    return { projectRef: null, role: null };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("is neither a recognized Supabase key nor a valid JWT");
  }

  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  return {
    projectRef: typeof payload.ref === "string" ? payload.ref : null,
    role: typeof payload.role === "string" ? payload.role : null,
  };
}

function validateSelectedKey(name, targetProjectRef, expectedRole = null) {
  const value = configuredValue(name);
  if (!value) return;

  let metadata;
  try {
    metadata = readJwtMetadata(value);
  } catch (error) {
    fail(`${name} ${error instanceof Error ? error.message : String(error)}.`);
  }

  if (metadata.projectRef && metadata.projectRef !== targetProjectRef) {
    fail(`${name} belongs to project ${metadata.projectRef}, but its active runtime URL uses ${targetProjectRef}.`);
  }

  if (expectedRole && metadata.role && metadata.role !== expectedRole) {
    fail(`${name} has JWT role ${metadata.role}, but ${expectedRole} is required.`);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function verifyReachable(origin) {
  if (process.env.VERCEL !== "1" && process.env.SUPABASE_HEALTHCHECK_STRICT !== "1") {
    return;
  }

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

      // Supabase's gateway may return 401 without an apikey. That still proves
      // the project hostname resolves and accepts TLS/HTTP. Deleted preview
      // branches fail before an HTTP response is received.
      if (response.status >= 500) {
        lastDetail = `HTTP ${response.status}`;
      } else {
        return;
      }
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

  if (strict) {
    fail(message);
  }

  console.warn(
    `\nSupabase reachability warning: ${message} ` +
      "Continuing the build because external network availability is not a reliable build gate.\n",
  );
}

// Validate what the application actually selects at runtime. A legacy fallback
// variable that is present but shadowed must not block an otherwise correct
// production deployment.
const serverUrlName = selectedName(serverUrlPriority);
const browserUrlName = selectedName(browserUrlPriority);
const serverUrl = parseSelectedUrl(
  serverUrlName || "server fallback",
  serverUrlName ? configuredValue(serverUrlName) : FALLBACK_URL,
);
const browserUrl = parseSelectedUrl(
  browserUrlName || "browser fallback",
  browserUrlName ? configuredValue(browserUrlName) : FALLBACK_URL,
);

if (serverUrl.projectRef !== browserUrl.projectRef) {
  fail(
    `Server runtime points to ${serverUrl.hostname}, while the browser client points to ${browserUrl.hostname}. ` +
      "The active Supabase URLs must use the same project.",
  );
}

const activeProjectRef = serverUrl.projectRef;
if (process.env.VERCEL_ENV === "production" && activeProjectRef !== PRODUCTION_PROJECT_REF) {
  fail(
    `Production points to project ${activeProjectRef}, but MasseurMatch production must use ${PRODUCTION_PROJECT_REF}.`,
  );
}

const activeUrlNames = new Set([serverUrlName, browserUrlName].filter(Boolean));
for (const name of urlVariableNames) {
  const value = configuredValue(name);
  if (!value || activeUrlNames.has(name)) continue;

  try {
    const parsed = parseSupabaseUrl(value);
    if (parsed.projectRef !== activeProjectRef) {
      warn(
        `${name} points to ${parsed.hostname}, but it is shadowed by the active runtime configuration ` +
          `for ${serverUrl.hostname}. Remove or update this legacy value when convenient.`,
      );
    }
  } catch (error) {
    warn(
      `${name} is shadowed by the active runtime configuration and is invalid (${error instanceof Error ? error.message : String(error)}). ` +
        "Remove or update this legacy value when convenient.",
    );
  }
}

const serverAnonKeyName = selectedName(serverAnonKeyPriority);
const browserAnonKeyName = selectedName(browserAnonKeyPriority);
if (serverAnonKeyName) validateSelectedKey(serverAnonKeyName, serverUrl.projectRef);
if (browserAnonKeyName && browserAnonKeyName !== serverAnonKeyName) {
  validateSelectedKey(browserAnonKeyName, browserUrl.projectRef);
}
if (configuredValue("SUPABASE_SERVICE_ROLE_KEY")) {
  validateSelectedKey("SUPABASE_SERVICE_ROLE_KEY", serverUrl.projectRef, "service_role");
}

const activeKeyNames = new Set(
  [serverAnonKeyName, browserAnonKeyName, configuredValue("SUPABASE_SERVICE_ROLE_KEY") ? "SUPABASE_SERVICE_ROLE_KEY" : null].filter(
    Boolean,
  ),
);
for (const name of keyVariableNames) {
  const value = configuredValue(name);
  if (!value || activeKeyNames.has(name)) continue;

  try {
    const metadata = readJwtMetadata(value);
    if (metadata.projectRef && metadata.projectRef !== activeProjectRef) {
      warn(
        `${name} belongs to project ${metadata.projectRef}, but it is shadowed by active runtime keys for ${activeProjectRef}. ` +
          "Remove or update this legacy value when convenient.",
      );
    }
  } catch (error) {
    warn(
      `${name} is shadowed by the active runtime configuration and is invalid (${error instanceof Error ? error.message : String(error)}). ` +
        "Remove or update this legacy value when convenient.",
    );
  }
}

await verifyReachable(serverUrl.origin);

const environment = process.env.VERCEL_ENV || "local/ci";
const configuredUrlCount = urlVariableNames.filter((name) => configuredValue(name)).length;
console.log(
  `Supabase environment verified for ${environment}: ${serverUrl.hostname} ` +
    `(${configuredUrlCount} configured URL variable(s); active server=${serverUrlName || "fallback"}, ` +
    `browser=${browserUrlName || "fallback"}).`,
);