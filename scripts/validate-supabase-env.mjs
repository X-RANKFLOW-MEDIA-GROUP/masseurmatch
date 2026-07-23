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
  // the URL health check. Legacy anon and service-role keys are JWTs.
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

async function verifyReachable(origin) {
  if (process.env.VERCEL !== "1") {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${origin}/auth/v1/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      fail(`Supabase health check returned HTTP ${response.status} for ${origin}.`);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(
      `Supabase project ${origin} is unreachable (${detail}). ` +
        "The deployment may reference a deleted or stale preview branch.",
    );
  } finally {
    clearTimeout(timeout);
  }
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
