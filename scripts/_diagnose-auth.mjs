import pg from "pg";
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

const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
console.log("Connecting to:", connStr?.replace(/:[^@]+@/, ":***@"));

const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

// Workaround for Node.js self-signed cert issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
await client.connect();
console.log("Connected!\n");

// 1. Check auth schema health
console.log("--- auth.users count ---");
const usersCount = await client.query("SELECT count(*) FROM auth.users");
console.log("Total auth users:", usersCount.rows[0].count);

// 2. Check if admin user exists
console.log("\n--- Looking for admin user ---");
const adminUser = await client.query(
  "SELECT id, email, role, raw_app_meta_data->>'role' as app_role FROM auth.users WHERE email = $1",
  ["admin@masseurmatch.com"]
);
if (adminUser.rows.length > 0) {
  console.log("Admin found:", JSON.stringify(adminUser.rows[0]));
} else {
  console.log("Admin user NOT found in auth.users");
}

// 3. Check for therapist user
console.log("\n--- Looking for therapist user ---");
const therapistUser = await client.query(
  "SELECT id, email, role, raw_app_meta_data->>'role' as app_role FROM auth.users WHERE email = $1",
  ["therapist@masseurmatch.com"]
);
if (therapistUser.rows.length > 0) {
  console.log("Therapist found:", JSON.stringify(therapistUser.rows[0]));
} else {
  console.log("Therapist user NOT found in auth.users");
}

// 4. Check auth schema tables
console.log("\n--- auth schema tables ---");
const authTables = await client.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth' ORDER BY table_name"
);
console.log(authTables.rows.map(r => r.table_name).join(", "));

// 5. Check public schema tables
console.log("\n--- public schema tables ---");
const publicTables = await client.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
);
console.log(publicTables.rows.map(r => r.table_name).join(", "));

// 6. Check if auth schema has any extension issues
console.log("\n--- auth.schema_migrations (last 5) ---");
try {
  const migrations = await client.query(
    "SELECT version FROM auth.schema_migrations ORDER BY version DESC LIMIT 5"
  );
  console.log(migrations.rows.map(r => r.version).join("\n"));
} catch (e) {
  console.log("Error:", e.message);
}

// 7. Check for any auth.users index issues
console.log("\n--- auth.users indexes ---");
const indexes = await client.query(
  "SELECT indexname FROM pg_indexes WHERE schemaname = 'auth' AND tablename = 'users'"
);
console.log(indexes.rows.map(r => r.indexname).join(", "));

// ===== FIX: Update admin user =====
const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@masseurmatch.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "00142522";
const therapistEmail = process.env.SEED_THERAPIST_EMAIL || "therapist@masseurmatch.com";
const therapistPassword = process.env.SEED_THERAPIST_PASSWORD || "00142522";

// Use pgcrypto for password hashing (Supabase includes it)
console.log("\n===== Fixing admin user =====");

// Update admin's app_metadata to include role
const adminRes = await client.query(
  `UPDATE auth.users 
   SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
       raw_user_meta_data = raw_user_meta_data || '{"full_name": "MasseurMatch Admin"}'::jsonb,
       encrypted_password = crypt($1, gen_salt('bf')),
       email_confirmed_at = COALESCE(email_confirmed_at, now()),
       updated_at = now()
   WHERE email = $2
   RETURNING id, email, raw_app_meta_data->>'role' as app_role`,
  [adminPassword, adminEmail]
);
if (adminRes.rows.length > 0) {
  console.log("Admin updated:", JSON.stringify(adminRes.rows[0]));
} else {
  console.log("Admin not found — creating...");
  const newAdmin = await client.query(
    `INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
     VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, crypt($2, gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb, '{"full_name": "MasseurMatch Admin"}'::jsonb, now(), now(), '', '', '', '')
     RETURNING id, email`,
    [adminEmail, adminPassword]
  );
  console.log("Admin created:", JSON.stringify(newAdmin.rows[0]));
}

// Upsert admin into public.users
const adminId = (await client.query("SELECT id FROM auth.users WHERE email = $1", [adminEmail])).rows[0]?.id;
if (adminId) {
  await client.query(
    `INSERT INTO public.users (id, email, full_name, role) 
     VALUES ($1, $2, 'MasseurMatch Admin', 'admin') 
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role`,
    [adminId, adminEmail]
  );
  console.log("public.users admin row upserted");

  // Ensure user_roles
  await client.query(
    `INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`,
    [adminId]
  );
  console.log("user_roles admin row ensured");
}

// ===== Fix therapist user =====
console.log("\n===== Fixing therapist user =====");
const existingTherapist = await client.query("SELECT id FROM auth.users WHERE email = $1", [therapistEmail]);
let therapistId;

if (existingTherapist.rows.length > 0) {
  therapistId = existingTherapist.rows[0].id;
  await client.query(
    `UPDATE auth.users 
     SET raw_app_meta_data = raw_app_meta_data || '{"role": "therapist"}'::jsonb,
         raw_user_meta_data = raw_user_meta_data || '{"full_name": "Leo Martinez"}'::jsonb,
         encrypted_password = crypt($1, gen_salt('bf')),
         email_confirmed_at = COALESCE(email_confirmed_at, now()),
         updated_at = now()
     WHERE id = $2`,
    [therapistPassword, therapistId]
  );
  console.log("Therapist updated:", therapistId);
} else {
  const newTherapist = await client.query(
    `INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
     VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, crypt($2, gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"], "role": "therapist"}'::jsonb, '{"full_name": "Leo Martinez"}'::jsonb, now(), now(), '', '', '', '')
     RETURNING id, email`,
    [therapistEmail, therapistPassword]
  );
  therapistId = newTherapist.rows[0].id;
  console.log("Therapist created:", JSON.stringify(newTherapist.rows[0]));

  // Also create identity record
  await client.query(
    `INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true), 'email', now(), now(), now())`,
    [therapistId, therapistEmail]
  );
  console.log("Therapist identity created");
}

// Upsert therapist into public.users
if (therapistId) {
  await client.query(
    `INSERT INTO public.users (id, email, full_name, role) 
     VALUES ($1, $2, 'Leo Martinez', 'therapist') 
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role`,
    [therapistId, therapistEmail]
  );
  console.log("public.users therapist row upserted");

  await client.query(
    `INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'provider') ON CONFLICT DO NOTHING`,
    [therapistId]
  );
  console.log("user_roles therapist row ensured");
}

// Verify
console.log("\n===== Verification =====");

// Check identities for admin
console.log("--- Admin identities ---");
const adminIdentities = await client.query(
  "SELECT id, provider_id, provider, identity_data FROM auth.identities WHERE user_id = $1",
  [adminId]
);
console.log(JSON.stringify(adminIdentities.rows, null, 2));

// Check if admin has identity record (required for login)
if (adminIdentities.rows.length === 0) {
  console.log("Admin has NO identity — creating one...");
  await client.query(
    `INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
     VALUES (gen_random_uuid(), $1::uuid, $2::text, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true), 'email', now(), now(), now())`,
    [adminId, adminEmail]
  );
  console.log("Admin identity created");
}

// Check sessions for admin
const adminSessions = await client.query(
  "SELECT count(*) FROM auth.sessions WHERE user_id = $1",
  [adminId]
);
console.log("Admin sessions:", adminSessions.rows[0].count);

// Check one_time_tokens
const adminTokens = await client.query(
  "SELECT count(*) FROM auth.one_time_tokens WHERE user_id = $1",
  [adminId]
);
console.log("Admin one_time_tokens:", adminTokens.rows[0].count);

// Check refresh tokens
const adminRefresh = await client.query(
  "SELECT count(*) FROM auth.refresh_tokens WHERE user_id = $1::text",
  [adminId]
);
console.log("Admin refresh_tokens:", adminRefresh.rows[0].count);

// Final verify
const verifyAdmin = await client.query(
  "SELECT id, email, encrypted_password IS NOT NULL as has_password, email_confirmed_at IS NOT NULL as email_confirmed, raw_app_meta_data, raw_user_meta_data FROM auth.users WHERE email = $1",
  [adminEmail]
);
console.log("\nAdmin full record:", JSON.stringify(verifyAdmin.rows[0], null, 2));

const verifyTherapist = await client.query(
  "SELECT id, email, encrypted_password IS NOT NULL as has_password, email_confirmed_at IS NOT NULL as email_confirmed, raw_app_meta_data FROM auth.users WHERE email = $1",
  [therapistEmail]
);
console.log("Therapist:", JSON.stringify(verifyTherapist.rows[0]));

await client.end();
