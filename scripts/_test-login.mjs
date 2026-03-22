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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log("Testing login via Supabase Auth...\n");

// Test admin login
const adminRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: process.env.SEED_ADMIN_EMAIL || "admin@masseurmatch.com",
    password: process.env.SEED_ADMIN_PASSWORD || "00142522",
  }),
});
console.log("Admin login status:", adminRes.status);
if (adminRes.ok) {
  const data = await adminRes.json();
  console.log("  User ID:", data.user?.id);
  console.log("  Email:", data.user?.email);
  console.log("  App role:", data.user?.app_metadata?.role);
  console.log("  Access token received:", !!data.access_token);
} else {
  const err = await adminRes.json();
  console.log("  Error:", JSON.stringify(err));
}

// Test therapist login
console.log("");
const therapistRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: process.env.SEED_THERAPIST_EMAIL || "therapist@masseurmatch.com",
    password: process.env.SEED_THERAPIST_PASSWORD || "00142522",
  }),
});
console.log("Therapist login status:", therapistRes.status);
if (therapistRes.ok) {
  const data = await therapistRes.json();
  console.log("  User ID:", data.user?.id);
  console.log("  Email:", data.user?.email);
  console.log("  App role:", data.user?.app_metadata?.role);
  console.log("  Access token received:", !!data.access_token);
} else {
  const err = await therapistRes.json();
  console.log("  Error:", JSON.stringify(err));
}
