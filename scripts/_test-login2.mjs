import pg from "pg";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new pg.Client({
  connectionString: "postgres://postgres.ijsdpozjfjjufjsoexod:%40Guns210800@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Check admin identity
const adminId = await client.query(
  "SELECT id, provider_id, provider FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = $1)",
  ["admin@masseurmatch.com"]
);
console.log("Admin identities:", JSON.stringify(adminId.rows));

// Check therapist identity
const therapistId = await client.query(
  "SELECT id, provider_id, provider FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = $1)",
  ["therapist@masseurmatch.com"]
);
console.log("Therapist identities:", JSON.stringify(therapistId.rows));

// Try login with another pre-existing user
const url = "https://ijsdpozjfjjufjsoexod.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2Rwb3pqZmpqdWZqc29leG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDcxNTYsImV4cCI6MjA3NzU4MzE1Nn0.S6fGMlOp8KLHwPGL9ebOQvDUqY3C79bw3SH9IOsCi2M";

// Test with admin
console.log("\n--- Test: admin login ---");
const adminRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: key, "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@masseurmatch.com", password: "00142522" }),
});
console.log("Status:", adminRes.status);
const adminBody = await adminRes.json();
console.log("Response:", JSON.stringify(adminBody).substring(0, 300));

// Test with another existing user (wrong password expected)
console.log("\n--- Test: aabrunosantosdfw@gmail.com login (wrong pw) ---");
const otherRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: key, "Content-Type": "application/json" },
  body: JSON.stringify({ email: "aabrunosantosdfw@gmail.com", password: "wrong" }),
});
console.log("Status:", otherRes.status);
const otherBody = await otherRes.json();
console.log("Response:", JSON.stringify(otherBody).substring(0, 300));

await client.end();
