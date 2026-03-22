import pg from "pg";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new pg.Client({
  connectionString: "postgres://postgres.ijsdpozjfjjufjsoexod:%40Guns210800@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const adminEmail = "admin@masseurmatch.com";
const adminPassword = "00142522";

// 1. Get the current admin user id
const current = await client.query("SELECT id FROM auth.users WHERE email = $1", [adminEmail]);
const oldId = current.rows[0]?.id;
console.log("Current admin id:", oldId);

if (oldId) {
  // 2. Clean up all related records
  console.log("Cleaning up old admin records...");
  await client.query("DELETE FROM auth.sessions WHERE user_id = $1", [oldId]);
  await client.query("DELETE FROM auth.refresh_tokens WHERE user_id = $1::text", [oldId]);
  await client.query("DELETE FROM auth.mfa_factors WHERE user_id = $1", [oldId]);
  await client.query("DELETE FROM auth.one_time_tokens WHERE user_id = $1", [oldId]);
  await client.query("DELETE FROM auth.identities WHERE user_id = $1", [oldId]);
  await client.query("DELETE FROM auth.flow_state WHERE user_id = $1", [oldId]);
  await client.query("DELETE FROM public.user_roles WHERE user_id = $1", [oldId]);
  await client.query("DELETE FROM public.users WHERE id = $1", [oldId]);
  await client.query("DELETE FROM auth.users WHERE id = $1", [oldId]);
  console.log("Old admin deleted.");
}

// 3. Create fresh admin user
console.log("Creating fresh admin user...");
const newUser = await client.query(
  `INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    $1, crypt($2, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"full_name": "MasseurMatch Admin"}'::jsonb,
    now(), now(),
    '', '', '', ''
  ) RETURNING id, email`,
  [adminEmail, adminPassword]
);
const newId = newUser.rows[0].id;
console.log("New admin created:", newId);

// 4. Create identity
await client.query(
  `INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
   VALUES (gen_random_uuid(), $1::uuid, $2::text, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true), 'email', now(), now(), now())`,
  [newId, adminEmail]
);
console.log("Identity created");

// 5. Create public.users row
await client.query(
  `INSERT INTO public.users (id, email, full_name, role)
   VALUES ($1, $2, 'MasseurMatch Admin', 'admin')
   ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role`,
  [newId, adminEmail]
);
console.log("public.users row created");

// 6. Create user_roles row
await client.query(
  `INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`,
  [newId]
);
console.log("user_roles row created");

// 7. Test login
console.log("\n--- Testing login ---");
const url = "https://ijsdpozjfjjufjsoexod.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2Rwb3pqZmpqdWZqc29leG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDcxNTYsImV4cCI6MjA3NzU4MzE1Nn0.S6fGMlOp8KLHwPGL9ebOQvDUqY3C79bw3SH9IOsCi2M";

const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: key, "Content-Type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
console.log("Login status:", loginRes.status);
const loginBody = await loginRes.json();
if (loginRes.ok) {
  console.log("SUCCESS! User ID:", loginBody.user?.id);
  console.log("Email:", loginBody.user?.email);
  console.log("App role:", loginBody.user?.app_metadata?.role);
} else {
  console.log("Error:", JSON.stringify(loginBody));
}

await client.end();
