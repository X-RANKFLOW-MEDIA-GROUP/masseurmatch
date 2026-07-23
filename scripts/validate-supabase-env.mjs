const EXPECTED_PROJECT_REF = "ijsdpozjfjjufjsoexod";
const EXPECTED_HOSTNAME = `${EXPECTED_PROJECT_REF}.supabase.co`;

const requiredVariables = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

function fail(message) {
  console.error(`\nSupabase environment validation failed: ${message}\n`);
  process.exit(1);
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

  if (parsed.hostname !== EXPECTED_HOSTNAME) {
    fail(
      `${name} points to ${parsed.hostname}, but MasseurMatch must use ${EXPECTED_HOSTNAME}. ` +
        "This usually means a deleted Supabase preview branch was injected into the deployment.",
    );
  }

  return parsed.origin;
}

function getJwtProjectRef(name, token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    fail(`${name} is not a valid Supabase JWT.`);
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return typeof payload.ref === "string" ? payload.ref : null;
  } catch {
    fail(`${name} has an unreadable JWT payload.`);
  }
}

for (const name of requiredVariables) {
  if (!process.env[name]?.trim()) {
    fail(`${name} is missing.`);
  }
}

const serverOrigin = parseSupabaseUrl("SUPABASE_URL", process.env.SUPABASE_URL.trim());
const publicOrigin = parseSupabaseUrl(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
);

if (serverOrigin !== publicOrigin) {
  fail("SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL must be identical.");
}

if (process.env.SUPABASE_ANON_KEY.trim() !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()) {
  fail("SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY must be identical.");
}

for (const name of ["SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
  const projectRef = getJwtProjectRef(name, process.env[name].trim());
  if (projectRef !== EXPECTED_PROJECT_REF) {
    fail(
      `${name} belongs to project ${projectRef || "unknown"}, but MasseurMatch must use ${EXPECTED_PROJECT_REF}.`,
    );
  }
}

console.log(`Supabase environment verified: ${EXPECTED_HOSTNAME}`);
