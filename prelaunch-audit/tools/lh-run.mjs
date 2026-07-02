// Lighthouse batch runner: mobile + desktop for key URLs
import { writeFileSync, mkdirSync } from "node:fs";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { desktopConfig } from "lighthouse";

const BASE = "https://www.masseurmatch.com";
const urls = ["/", "/therapists", "/search", "/pricing", "/signup", "/login",
  "/about", "/trust", "/safety", "/contact", "/blog", "/legal",
  "/dallas", "/austin", "/miami", "/therapists/kevin-os"];

const OUT = new URL("./out/lighthouse/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const PROXY_HOST = "127.0.0.1", PROXY_PORT = "46491";
const chrome = await launch({
  chromePath: "/opt/pw-browsers/chromium",
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--disable-features=PostQuantumKyber", "--ssl-version-max=tls1.2",
    "--ignore-certificate-errors",
    `--proxy-server=http://${PROXY_HOST}:${PROXY_PORT}`,
    "--proxy-bypass-list=<-loopback>"],
});

const summary = [];
for (const form of ["mobile", "desktop"]) {
  for (const u of urls) {
    const name = (u === "/" ? "home" : u.replaceAll("/", "-").slice(1)) + "." + form;
    try {
      const opts = { port: chrome.port, output: ["html", "json"], logLevel: "error" };
      const config = form === "desktop" ? desktopConfig : undefined;
      const rr = await lighthouse(BASE + u, opts, config);
      const lhr = rr.lhr;
      writeFileSync(OUT + name + ".html", rr.report[0]);
      writeFileSync(OUT + name + ".json", rr.report[1]);
      const a = lhr.audits;
      const row = {
        url: u, form,
        perf: Math.round((lhr.categories.performance?.score ?? 0) * 100),
        a11y: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
        bp: Math.round((lhr.categories["best-practices"]?.score ?? 0) * 100),
        seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
        FCP: a["first-contentful-paint"]?.displayValue,
        LCP: a["largest-contentful-paint"]?.displayValue,
        CLS: a["cumulative-layout-shift"]?.displayValue,
        TBT: a["total-blocking-time"]?.displayValue,
        SI: a["speed-index"]?.displayValue,
        payloadKB: Math.round((a["total-byte-weight"]?.numericValue ?? 0) / 1024),
        unusedJsKB: Math.round((a["unused-javascript"]?.details?.overallSavingsBytes ?? 0) / 1024),
        unusedCssKB: Math.round((a["unused-css-rules"]?.details?.overallSavingsBytes ?? 0) / 1024),
        mainThreadMs: Math.round(a["mainthread-work-breakdown"]?.numericValue ?? 0),
      };
      summary.push(row);
      console.log(JSON.stringify(row));
    } catch (e) {
      summary.push({ url: u, form, error: String(e).slice(0, 150) });
      console.log(`ERR ${form} ${u}: ${String(e).slice(0, 100)}`);
    }
  }
}
await chrome.kill();
writeFileSync(OUT + "summary.json", JSON.stringify(summary, null, 1));
const cols = Object.keys(summary.find(s => !s.error) || summary[0]);
writeFileSync(OUT + "summary.csv",
  [cols.join(",")].concat(summary.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))).join("\n"));
console.log("LH DONE", summary.length);
