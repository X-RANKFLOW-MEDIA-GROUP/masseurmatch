import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  retries: 2, // absorb transient egress-proxy connection resets (infra, not site defects)
  workers: 4,
  reporter: [
    ["html", { outputFolder: "./out/playwright-report", open: "never" }],
    ["json", { outputFile: "./out/playwright-results.json" }],
    ["list"],
  ],
  use: {
    baseURL: "https://www.masseurmatch.com",
    proxy: { server: process.env.HTTPS_PROXY || "http://127.0.0.1:46491" },
    launchOptions: {
      executablePath: "/opt/pw-browsers/chromium",
      args: ["--no-sandbox", "--disable-dev-shm-usage",
        "--disable-features=PostQuantumKyber", "--ssl-version-max=tls1.2"],
    },
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 MasseurMatchAudit",
  },
});
