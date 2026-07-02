// HTTP sweep: status, redirect chains, security headers for all in-scope routes
import { writeFileSync } from "node:fs";

const BASE = "https://www.masseurmatch.com";
const routes = [
  "/", "/therapists", "/search", "/pricing", "/signup", "/signup/plan",
  "/signup/account", "/login", "/forgot-password", "/about", "/trust",
  "/verification", "/community-guidelines", "/safety", "/contact", "/blog",
  "/legal", "/terms", "/privacy", "/cookie-policy", "/cookies",
  "/accessibility", "/explore", "/cities",
  "/dallas", "/austin", "/miami", "/new-york", "/los-angeles", "/chicago",
  "/houston", "/atlanta", "/las-vegas", "/orlando",
  "/therapists/kevin-os", "/therapists/bruno-dallas-tx",
  "/dashboard", "/pro/dashboard", "/pro/listing", "/pro/profile",
  "/pro/settings", "/pro/billing", "/pro/photos", "/pro/availability",
  "/admin",
  "/this-page-should-404",
  "/robots.txt", "/sitemap.xml",
];

async function follow(url, maxHops = 10) {
  const chain = [];
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const t0 = performance.now();
    const res = await fetch(current, { redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 MasseurMatchAudit/1.0" } });
    const ms = Math.round(performance.now() - t0);
    const entry = { url: current, status: res.status, ms };
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get("location");
      entry.location = loc;
      chain.push(entry);
      current = new URL(loc, current).href;
      continue;
    }
    entry.headers = {
      "strict-transport-security": res.headers.get("strict-transport-security"),
      "content-security-policy": res.headers.get("content-security-policy") ? "PRESENT" : null,
      "x-frame-options": res.headers.get("x-frame-options"),
      "x-content-type-options": res.headers.get("x-content-type-options"),
      "referrer-policy": res.headers.get("referrer-policy"),
      "permissions-policy": res.headers.get("permissions-policy") ? "PRESENT" : null,
      "cache-control": res.headers.get("cache-control"),
      "content-encoding": res.headers.get("content-encoding"),
      "x-robots-tag": res.headers.get("x-robots-tag"),
      "server": res.headers.get("server"),
      "x-vercel-cache": res.headers.get("x-vercel-cache"),
      "set-cookie": res.headers.getSetCookie ? res.headers.getSetCookie().map(c => c.split(";")[0].split("=")[0] + ";" + c.split(";").slice(1).join(";")) : null,
    };
    const body = await res.text();
    entry.bytes = body.length;
    entry.bodySnippet = body.slice(0, 300);
    chain.push(entry);
    return { chain, finalStatus: res.status, finalUrl: current, body };
  }
  return { chain, finalStatus: "REDIRECT_LOOP", finalUrl: current };
}

const results = [];
for (const r of routes) {
  try {
    const { chain, finalStatus, finalUrl } = await follow(BASE + r);
    results.push({ route: r, finalStatus, finalUrl, hops: chain.length - 1, chain: chain.map(({ body, ...rest }) => rest) });
    console.log(`${String(finalStatus).padEnd(4)} ${r}${chain.length > 1 ? " -> " + finalUrl : ""}`);
  } catch (e) {
    results.push({ route: r, error: e.message });
    console.log(`ERR  ${r} ${e.message}`);
  }
}
writeFileSync(new URL("./out/http-sweep.json", import.meta.url), JSON.stringify(results, null, 2));
console.log("done");
