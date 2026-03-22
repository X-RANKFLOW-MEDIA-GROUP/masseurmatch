import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function main() {
  const envFile = process.argv[2] || ".env.production.local";
  const env = parseEnvFile(envFile);

  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "";
  const service = env.SUPABASE_SERVICE_ROLE_KEY || "";
  const storageUrl = env.NEXT_PUBLIC_STORAGE_SUPABASE_URL || env.STORAGE_SUPABASE_URL || "";
  const storageAnon =
    env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY ||
    env.STORAGE_SUPABASE_ANON_KEY ||
    env.STORAGE_SUPABASE_PUBLISHABLE_KEY ||
    "";
  const storageService = env.STORAGE_SUPABASE_SERVICE_ROLE_KEY || "";

  const result = {
    envFile,
    hasUrl: Boolean(url),
    hasAnon: Boolean(anon),
    hasServiceRole: Boolean(service),
    hasStorageUrl: Boolean(storageUrl),
    hasStorageAnon: Boolean(storageAnon),
    hasStorageServiceRole: Boolean(storageService),
    anonTest: null,
    serviceRoleTest: null,
    storageAnonTest: null,
    storageServiceRoleTest: null,
  };

  if (url && anon) {
    const publicClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const anonRes = await publicClient
      .from("profiles")
      .select("id", { count: "exact", head: true });

    result.anonTest = {
      ok: anonRes.error === null,
      status: anonRes.status ?? null,
      error: anonRes.error?.message ?? null,
    };
  }

  if (url && service) {
    const adminClient = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const serviceRes = await adminClient
      .from("user_roles")
      .select("user_id", { count: "exact", head: true });

    result.serviceRoleTest = {
      ok: serviceRes.error === null,
      status: serviceRes.status ?? null,
      error: serviceRes.error?.message ?? null,
    };
  }

  if (storageUrl && storageAnon) {
    const storagePublicClient = createClient(storageUrl, storageAnon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const storageAnonRes = await storagePublicClient
      .from("profiles")
      .select("id", { count: "exact", head: true });

    result.storageAnonTest = {
      ok: storageAnonRes.error === null,
      status: storageAnonRes.status ?? null,
      error: storageAnonRes.error?.message ?? null,
    };
  }

  if (storageUrl && storageService) {
    const storageAdminClient = createClient(storageUrl, storageService, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const storageServiceRes = await storageAdminClient
      .from("user_roles")
      .select("user_id", { count: "exact", head: true });

    result.storageServiceRoleTest = {
      ok: storageServiceRes.error === null,
      status: storageServiceRes.status ?? null,
      error: storageServiceRes.error?.message ?? null,
    };
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Failed to run Supabase admin connection check:", error?.message || String(error));
  process.exitCode = 1;
});
