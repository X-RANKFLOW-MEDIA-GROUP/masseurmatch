const PRODUCTION_PROJECT_REF = "ijsdpozjfjjufjsoexod";
const PRODUCTION_HOSTNAME = `${PRODUCTION_PROJECT_REF}.supabase.co`;
const FALLBACK_URL = `https://${PRODUCTION_HOSTNAME}`;

const urlVariableNames = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
];

const publicUrlPriority = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_URL",
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

function configuredValue(name) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function parseSupabaseUrl(name, value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    fail(`${name} is not a valid URL.`);
  }

  if (parsed.protocol !== "https:") {
    fail(`${name} must use https.`);
  }

  const match = /^([a-z0-9]{20})\.supabase\.co$/.exec(parsed.hostname);
  if (!match) {
    fail(`${name} does not point to a valid Supabase project hostname: ${parsed.hostname}.`);
  }

  return {
    origin: parsed.origin,
    hostname: parsed.hostname,
    projectRef: match[1],
  };
}

function readJwtProjectRef(name, token) {
  // New Supabase publishable keys are opaque. Their project is validated by
  // the URL configuration checks. Legacy anon and service-role keys are JWTs.
  if (token.startsWith("sb_publishable_") || token.startsWith("sb_secret_")) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    fail(`${name} is neither a recognized Supabase key nor a valid JWT.`);
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return typeof payload.ref === "string" ? payload.ref : null;
  } catch {
    fail(`${name} has an unreadable JWT payload.`);
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

const configuredUrls = urlVariableNames
  .map((name) => {
    const value = configuredValue(name);
    return value ? [name, parseSupabaseUrl(name, value)] : null;
  })
  .filter(Boolean);

const selectedUrlName = publicUrlPriority.find((name) => configuredValue(name));
const selectedUrl = parseSupabaseUrl(
  selectedUrlName || "application fallback",
  selectedUrlName ? configuredValue(selectedUrlName) : FALLBACK_URL,
);

for (const [name, parsed] of configuredUrls) {
  if (parsed.origin !== selectedUrl.origin) {
    fail(
      `${name} points to ${parsed.hostname}, while the browser client points to ${selectedUrl.hostname}. ` +
        "All Supabase URL variables in one deployment must use the same project.",
    );
  }
}

if (process.env.VERCEL_ENV === "production" && selectedUrl.projectRef !== PRODUCTION_PROJECT_REF) {
  fail(
    `Production points to project ${selectedUrl.projectRef}, but MasseurMatch production must use ${PRODUCTION_PROJECT_REF}.`,
  );
}

for (const name of keyVariableNames) {
  const value = configuredValue(name);
  if (!value) continue;

  const keyProjectRef = readJwtProjectRef(name, value);
  if (keyProjectRef && keyProjectRef !== selectedUrl.projectRef) {
    fail(
      `${name} belongs to project ${keyProjectRef}, but the deployment URL uses ${selectedUrl.projectRef}.`,
    );
  }
}

await verifyReachable(selectedUrl.origin);

const environment = process.env.VERCEL_ENV || "local/ci";
console.log(
  `Supabase environment verified for ${environment}: ${selectedUrl.hostname} ` +
    `(${configuredUrls.length} configured URL variable(s)).`,
);