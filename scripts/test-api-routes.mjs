import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const port = process.env.API_TEST_PORT || "3311";
const baseUrl = `http://127.0.0.1:${port}`;
const debug = process.env.API_TEST_DEBUG === "1";
const nextCommand =
  process.platform === "win32"
    ? path.join(process.cwd(), "node_modules", ".bin", "next.cmd")
    : path.join(process.cwd(), "node_modules", ".bin", "next");
const nextArgs = ["dev", "-p", port, "--hostname", "127.0.0.1"];
const serverCommand =
  process.platform === "win32" ? "powershell.exe" : nextCommand;
const serverArgs =
  process.platform === "win32"
    ? ["-NoProfile", "-Command", `& '${nextCommand}' ${nextArgs.join(" ")}`]
    : nextArgs;
const logs = [];

function logLine(chunk) {
  const text = chunk.toString();
  logs.push(text);
  if (logs.length > 200) {
    logs.shift();
  }

  if (debug) {
    process.stdout.write(text);
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        redirect: "manual",
      });

      if (response.status < 500) {
        return;
      }
    } catch {
      // Keep polling until the Next dev server is ready.
    }

    await sleep(1000);
  }

  throw new Error("Timed out waiting for the Next dev server to become ready.");
}

async function request(path, init = {}) {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
    headers,
  });

  const text = await response.text();
  return {
    response,
    text,
    json: parseJson(text),
  };
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function locationIncludes(response, expected) {
  return response.headers.get("location")?.includes(expected) === true;
}

async function stopServer(child) {
  if (child.killed) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    return;
  }

  child.kill("SIGTERM");
  await new Promise((resolve) => {
    child.on("exit", resolve);
    setTimeout(resolve, 5000);
  });
}

const server = spawn(serverCommand, serverArgs, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
    RESEND_API_KEY: "",
    STRIPE_SECRET_KEY: "sk_test_masseurmatch_smoke_test",
    STRIPE_WEBHOOK_SECRET: "whsec_masseurmatch_smoke_test",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", logLine);
server.stderr.on("data", logLine);

const checks = [];

try {
  await waitForServer();

  {
    const { response } = await request("/api/auth/callback", { method: "GET" });
    assert.equal(response.status, 307);
    ensure(locationIncludes(response, "/login?error=no_code"), "OAuth callback should reject missing code.");
    checks.push("oauth-callback-missing-code");
  }

  {
    const { response } = await request("/pro/dashboard", { method: "GET" });
    assert.equal(response.status, 307);
    ensure(locationIncludes(response, "/login"), "Pro dashboard should redirect unauthenticated users to login.");
    ensure(locationIncludes(response, "redirect=%2Fpro%2Fdashboard"), "Pro dashboard redirect should preserve destination.");
    checks.push("pro-dashboard-unauthorized-redirect");
  }

  {
    const { response } = await request("/admin", { method: "GET" });
    assert.equal(response.status, 307);
    ensure(locationIncludes(response, "/login"), "Admin should redirect unauthenticated users to login.");
    ensure(locationIncludes(response, "redirect=%2Fadmin"), "Admin redirect should preserve destination.");
    checks.push("admin-unauthorized-redirect");
  }

  {
    const { response, json } = await request("/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "invalid-signature",
      },
      body: JSON.stringify({ id: "evt_invalid_signature_test", type: "checkout.session.completed", data: { object: {} } }),
    });

    assert.equal(response.status, 400);
    ensure(json?.error === "Invalid webhook signature", "Stripe webhook should reject invalid signatures.");
    checks.push("stripe-webhook-invalid-signature");
  }

  {
    const { response, json } = await request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: "therapist@example.com",
        redirectTo: `${baseUrl}/reset-password`,
      }),
    });

    assert.equal(response.status, 200);
    ensure(json?.ok === true, "Forgot password should return ok=true.");
    ensure(
      typeof json?.message === "string" && json.message.length > 0,
      "Forgot password should return a non-empty success message.",
    );
    checks.push("forgot-password");
  }

  {
    const { response, json } = await request("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "API Smoke Test",
        email: "qa@example.com",
        subject: "Smoke test",
        message: "This is a smoke test message for the contact route.",
      }),
    });

    assert.equal(response.status, 200);
    ensure(json?.ok === true, "Contact should return ok=true.");
    ensure(json?.to === "support@masseurmatch.com", "Contact should target support inbox.");
    ensure(json?.mock === true, "Contact should use mock delivery when RESEND_API_KEY is blank.");
    checks.push("contact");
  }

  {
    const { response } = await request("/api/og?title=Smoke%20Test&city=Austin");
    assert.equal(response.status, 200);
    ensure(
      response.headers.get("content-type")?.includes("image/png") === true,
      "OG route should return a PNG image response.",
    );
    checks.push("og");
  }

  {
    const { response, json } = await request("/api/admin/blog", {
      method: "POST",
      body: JSON.stringify({
        title: "Unauthorized",
        excerpt: "This should not be created because there is no admin session.",
        blocks: [{ type: "paragraph", text: "Blocked" }],
      }),
    });

    assert.equal(response.status, 401);
    ensure(json?.error === "Authentication required.", "Admin blog should reject missing sessions.");
    checks.push("admin-blog-unauthorized");
  }

  {
    const { response, json } = await request("/api/pro/profile", {
      method: "GET",
    });

    assert.equal(response.status, 401);
    ensure(json?.error === "Authentication required.", "Pro profile should reject missing sessions.");
    checks.push("pro-profile-unauthorized");
  }

  {
    const { response, json } = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        password: "short",
      }),
    });

    assert.equal(response.status, 422);
    ensure(json?.error === "Validation failed.", "Login should validate its payload.");
    checks.push("login-validation");
  }

  {
    const { response, json } = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: "A",
        email: "bad",
        password: "123",
      }),
    });

    assert.equal(response.status, 422);
    ensure(json?.error === "Validation failed.", "Register should validate its payload.");
    checks.push("register-validation");
  }

  {
    const { response, json } = await request("/api/auth/logout", {
      method: "POST",
    });

    assert.equal(response.status, 200);
    ensure(json?.ok === true, "Logout should return ok=true.");
    checks.push("logout");
  }

  console.log(`API smoke tests passed (${checks.length} checks): ${checks.join(", ")}`);
} catch (error) {
  console.error("API smoke tests failed.");
  console.error(error instanceof Error ? error.message : String(error));

  if (logs.length > 0) {
    console.error("Recent Next output:");
    console.error(logs.slice(-40).join("").trim());
  }

  process.exitCode = 1;
} finally {
  await stopServer(server);
}
