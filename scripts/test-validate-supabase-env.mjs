import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const validatorPath = path.join(scriptDir, "validate-supabase-env.mjs");
const PROD_REF = "ijsdpozjfjjufjsoexod";
const OTHER_REF = "aaaaaaaaaaaaaaaaaaaa";
const PROD_URL = `https://${PROD_REF}.supabase.co`;
const OTHER_URL = `https://${OTHER_REF}.supabase.co`;
const managedVariables = [
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SITEMAP_SUPABASE_KEY",
  "VERCEL",
  "VERCEL_ENV",
  "SUPABASE_HEALTHCHECK_STRICT",
];

function fakeJwt(ref, role = "anon") {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ ref, role })}.test-signature`;
}

function cleanEnv(overrides) {
  const env = { ...process.env };
  for (const name of managedVariables) delete env[name];
  return {
    ...env,
    VERCEL: "0",
    SUPABASE_HEALTHCHECK_STRICT: "0",
    ...overrides,
  };
}

function run(overrides) {
  return spawnSync(process.execPath, [validatorPath], {
    env: cleanEnv(overrides),
    encoding: "utf8",
  });
}

function expectPass(name, overrides, expectedWarning = null) {
  const result = run(overrides);
  assert.equal(result.status, 0, `${name} should pass. stderr: ${result.stderr}`);
  if (expectedWarning) {
    assert.match(result.stderr, expectedWarning, `${name} should emit the expected warning.`);
  }
}

function expectFail(name, overrides, expectedError) {
  const result = run(overrides);
  assert.notEqual(result.status, 0, `${name} should fail.`);
  assert.match(result.stderr, expectedError, `${name} should emit the expected failure.`);
}

expectPass(
  "shadowed legacy variables",
  {
    VERCEL_ENV: "production",
    SUPABASE_URL: PROD_URL,
    NEXT_PUBLIC_SUPABASE_URL: PROD_URL,
    VITE_SUPABASE_URL: OTHER_URL,
    SUPABASE_ANON_KEY: fakeJwt(PROD_REF),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: fakeJwt(PROD_REF),
    VITE_SUPABASE_PUBLISHABLE_KEY: fakeJwt(OTHER_REF),
    SITEMAP_SUPABASE_KEY: fakeJwt(OTHER_REF),
  },
  /shadowed by the active runtime configuration|shadowed by active runtime keys/,
);

expectFail(
  "server and browser project mismatch",
  {
    VERCEL_ENV: "production",
    SUPABASE_URL: PROD_URL,
    NEXT_PUBLIC_SUPABASE_URL: OTHER_URL,
  },
  /active Supabase URLs must use the same project/,
);

expectFail(
  "wrong production project",
  {
    VERCEL_ENV: "production",
    SUPABASE_URL: OTHER_URL,
    NEXT_PUBLIC_SUPABASE_URL: OTHER_URL,
  },
  /MasseurMatch production must use ijsdpozjfjjufjsoexod/,
);

expectFail(
  "selected anon key project mismatch",
  {
    VERCEL_ENV: "production",
    SUPABASE_URL: PROD_URL,
    NEXT_PUBLIC_SUPABASE_URL: PROD_URL,
    SUPABASE_ANON_KEY: fakeJwt(OTHER_REF),
  },
  /belongs to project aaaaaaaaaaaaaaaaaaaa, but its active runtime URL uses ijsdpozjfjjufjsoexod/,
);

expectFail(
  "service role key has wrong role",
  {
    VERCEL_ENV: "production",
    SUPABASE_URL: PROD_URL,
    NEXT_PUBLIC_SUPABASE_URL: PROD_URL,
    SUPABASE_SERVICE_ROLE_KEY: fakeJwt(PROD_REF, "anon"),
  },
  /JWT role anon, but service_role is required/,
);

console.log("Supabase environment validator regression tests passed (5 checks).");
