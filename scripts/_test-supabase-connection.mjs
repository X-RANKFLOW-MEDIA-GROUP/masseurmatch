import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!(key in process.env)) {
      let value = rest.join("=");
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", url);
console.log("Key prefix:", key?.substring(0, 30) + "...");

// 1. Test auth settings
console.log("\n--- Testing auth/v1/settings ---");
const settingsRes = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log("Status:", settingsRes.status);

// 2. Check which tables exist
console.log("\n--- Testing user_roles table ---");
const rolesRes = await fetch(`${url}/rest/v1/user_roles?select=user_id,role&limit=5`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log("Status:", rolesRes.status);
console.log("Body:", (await rolesRes.text()).substring(0, 300));

console.log("\n--- Testing profiles table ---");
const profilesRes = await fetch(`${url}/rest/v1/profiles?select=id,user_id,display_name&limit=5`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log("Status:", profilesRes.status);
console.log("Body:", (await profilesRes.text()).substring(0, 300));

// 3. Try signIn with old password (users might still have old password)
console.log("\n--- Testing signInWithPassword (old password) ---");
const signInOldRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: key, "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@masseurmatch.com", password: "Admin@MM2025!" }),
});
console.log("Status:", signInOldRes.status);
const signInOldBody = await signInOldRes.json();
console.log("Response:", JSON.stringify(signInOldBody).substring(0, 200));

// 3. Test REST API (public.users table)
console.log("\n--- Testing rest/v1/users ---");
const restRes = await fetch(`${url}/rest/v1/users?select=id,email&limit=3`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log("Status:", restRes.status);
const restBody = await restRes.text();
console.log("Response:", restBody.substring(0, 500));
