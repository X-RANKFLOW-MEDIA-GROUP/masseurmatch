// Exploratory sweep: console errors, network failures, HAR, screenshots, viewport checks
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "https://www.masseurmatch.com";
const OUT = new URL("./out/", import.meta.url).pathname;
const SHOTS = OUT + "screenshots/";
mkdirSync(SHOTS, { recursive: true });

const pagesToVisit = [
  "/", "/therapists", "/search", "/pricing", "/signup", "/login",
  "/forgot-password", "/about", "/trust", "/safety", "/contact", "/blog",
  "/legal", "/explore", "/cities", "/dallas", "/austin", "/miami",
  "/therapists/kevin-os", "/faq", "/how-it-works", "/near-me",
  "/verification", "/community-guidelines", "/this-page-should-404",
];

const consoleLog = [];   // {page, type, text}
const netFailures = []; // {page, url, status|failure}
const slowRequests = []; // {page, url, ms, bytes}

const PROXY = process.env.HTTPS_PROXY || "http://127.0.0.1:46491";
const LAUNCH_ARGS = ["--no-sandbox", "--disable-dev-shm-usage",
  "--disable-features=PostQuantumKyber", "--ssl-version-max=tls1.2"];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium",
  args: LAUNCH_ARGS, proxy: { server: PROXY } });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordHar: { path: OUT + "network.har", content: "omit" },
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 MasseurMatchAudit",
});
const page = await context.newPage();

let currentPath = "";
page.on("console", (msg) => {
  if (["error", "warning"].includes(msg.type())) {
    consoleLog.push({ page: currentPath, type: msg.type(), text: msg.text().slice(0, 500) });
  }
});
page.on("pageerror", (err) => {
  consoleLog.push({ page: currentPath, type: "pageerror", text: String(err).slice(0, 500) });
});
page.on("requestfailed", (req) => {
  const f = req.failure()?.errorText || "";
  if (f.includes("ERR_ABORTED")) return; // navigations/cancelled
  netFailures.push({ page: currentPath, url: req.url().slice(0, 200), failure: f });
});
page.on("response", (res) => {
  if (res.status() >= 400) {
    netFailures.push({ page: currentPath, url: res.url().slice(0, 200), status: res.status() });
  }
});
page.on("requestfinished", async (req) => {
  try {
    const timing = req.timing();
    const ms = timing.responseEnd;
    if (ms > 1500) slowRequests.push({ page: currentPath, url: req.url().slice(0, 200), ms: Math.round(ms) });
  } catch {}
});

const pageResults = [];
for (const p of pagesToVisit) {
  currentPath = p;
  const t0 = Date.now();
  try {
    const resp = await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 45000 }).catch(async (e) => {
      await page.waitForTimeout(3000);
      return null;
    });
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(1200);
    const hScroll = await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 2);
    const shot = SHOTS + "desktop" + (p === "/" ? "-home" : p.replaceAll("/", "-")) + ".png";
    await page.screenshot({ path: shot });
    pageResults.push({ page: p, status: resp ? resp.status() : "TIMEOUT/NULL", loadMs, hScroll });
    console.log(`${resp ? resp.status() : "??"} ${p} ${loadMs}ms${hScroll ? " HSCROLL!" : ""}`);
  } catch (e) {
    pageResults.push({ page: p, error: String(e).slice(0, 200) });
    console.log(`ERR ${p}: ${String(e).slice(0, 120)}`);
  }
}

// Viewport matrix on key pages
const viewports = [
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
];
const keyPages = ["/", "/therapists", "/therapists/kevin-os", "/pricing"];
for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const p of keyPages) {
    currentPath = `${p} @${vp.name}`;
    try {
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 45000 }).catch(() => null);
      await page.waitForTimeout(1000);
      const hScroll = await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 2);
      const shot = SHOTS + vp.name + (p === "/" ? "-home" : p.replaceAll("/", "-")) + ".png";
      await page.screenshot({ path: shot });
      pageResults.push({ page: p, viewport: vp.name, hScroll });
      if (hScroll) console.log(`HSCROLL ${p} @ ${vp.name}`);
    } catch (e) { console.log(`ERR vp ${p} ${vp.name}`); }
  }
}

await context.close(); // flushes HAR
await browser.close();

writeFileSync(OUT + "explore-results.json", JSON.stringify(pageResults, null, 1));
writeFileSync(OUT + "console-log.json", JSON.stringify(consoleLog, null, 1));
writeFileSync(OUT + "network-errors.json", JSON.stringify(netFailures, null, 1));
writeFileSync(OUT + "slow-requests.json", JSON.stringify(slowRequests, null, 1));
console.log(`console entries: ${consoleLog.length}, net failures: ${netFailures.length}, slow: ${slowRequests.length}`);
