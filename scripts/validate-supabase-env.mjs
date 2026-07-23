const EXPECTED_PROJECT_REF = "ijsdpozjfjjufjsoexod";
const EXPECTED_HOSTNAME = `${EXPECTED_PROJECT_REF}.supabase.co`;

const urlVariableNames = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
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

function validateSupabaseUrl(name, value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    fail(`${name} is not a valid URL.`);
  }

  if (parsed.protocol !== "https:") {
    fail(`${name} must use https.`);
  }

  if (parsed.hostname !== EXPECTED_HOSTNAME) {
    fail(
      `${name} points to ${parsed.hostname}, but MasseurMatch must use ${EXPECTED_HOSTNAME}. ` +
        "A stale or deleted Supabase preview branch may have overridden this deployment.",
    );
  }
}

function validateJwtProjectRef(name, token) {
  // New Supabase publishable keys can use the sb_publishable_ format and are
  // validated indirectly through the project URL. Legacy anon/service keys are JWTs.
  if (token.startsWith("sb_publishable_") || token.startsWith("sb_secret_")) {
    return;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    fail(`${name} is neither a recognized Supabase key nor a valid JWT.`);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    fail(`${name} has an unreadable JWT payload.`);
  }

  if (typeof payload.ref === "string" && payload.ref !== EXPECTED_PROJECT_REF) {
    fail(
      `${name} belongs to project ${payload.ref}, but MasseurMatch must use ${EXPECTED_PROJECT_REF}.`,
    );
  }
}

const configuredUrls = urlVariableNames
  .map((name) => [name, configuredValue(name)])
  .filter((entry) => entry[1]);

for (const [name, value] of configuredUrls) {
  validateSupabaseUrl(name, value);
}

for (const name of keyVariableNames) {
  const value = configuredValue(name);
  if (value) {
    validateJwtProjectRef(name, value);
  }
}

if (configuredUrls.length === 0) {
  console.log(
    `No Supabase URL environment override is configured; the application fallback will use ${EXPECTED_HOSTNAME}.`,
  );
} else {
  console.log(
    `Supabase environment verified for ${configuredUrls.length} configured URL variable(s): ${EXPECTED_HOSTNAME}`,
  );
}
