// axe-core accessibility scan + keyboard navigation smoke test
import { chromium } from "playwright";
import { writeFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = "https://www.masseurmatch.com";
const pages = ["/", "/therapists", "/pricing", "/login", "/signup", "/contact",
  "/therapists/kevin-os", "/dallas", "/blog", "/search"];

const PROXY = process.env.HTTPS_PROXY || "http://127.0.0.1:46491";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-features=PostQuantumKyber", "--ssl-version-max=tls1.2"],
  proxy: { server: PROXY } });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const results = [];
for (const p of pages) {
  try {
    await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 45000 }).catch(() => null);
    await page.waitForTimeout(1500);
    await page.evaluate(axeSource);
    const axe = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        resultTypes: ["violations"],
      });
    });
    const viol = axe.violations.map(v => ({
      id: v.id, impact: v.impact, help: v.help,
      nodes: v.nodes.length,
      sample: v.nodes[0]?.target?.join(" "),
      sampleHtml: (v.nodes[0]?.html || "").slice(0, 160),
    }));
    results.push({ page: p, violations: viol });
    console.log(p, "violations:", viol.map(v => `${v.id}(${v.impact},${v.nodes})`).join(" ") || "none");
  } catch (e) {
    results.push({ page: p, error: String(e).slice(0, 200) });
    console.log(p, "ERR", String(e).slice(0, 100));
  }
}

// keyboard nav smoke: tab through home, check focus visibility & skip link
await page.goto(BASE + "/", { waitUntil: "networkidle" }).catch(() => null);
await page.waitForTimeout(1500);
const focusTrail = [];
for (let i = 0; i < 15; i++) {
  await page.keyboard.press("Tab");
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const st = getComputedStyle(el);
    return {
      tag: el.tagName, text: (el.textContent || "").trim().slice(0, 40),
      href: el.getAttribute && el.getAttribute("href"),
      outline: st.outlineStyle !== "none" || st.boxShadow !== "none",
    };
  });
  focusTrail.push(info);
}
results.push({ page: "keyboard-nav-home", focusTrail });
console.log("focus trail:", JSON.stringify(focusTrail.slice(0, 6)));

await browser.close();
writeFileSync(new URL("./out/a11y-results.json", import.meta.url), JSON.stringify(results, null, 1));
console.log("A11Y DONE");
