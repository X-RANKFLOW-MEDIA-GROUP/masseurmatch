// SEO crawl: fetch pages, extract metadata, discover internal links, detect broken links
import { writeFileSync, readFileSync } from "node:fs";
import * as cheerio from "cheerio";

const WWW = "https://www.masseurmatch.com";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 MasseurMatchAudit/1.0";

const sitemapUrls = readFileSync(new URL("./out/sitemap-urls.txt", import.meta.url), "utf8")
  .trim().split("\n").map(u => new URL(u).pathname);

const scopeRoutes = ["/", "/therapists", "/search", "/pricing", "/signup", "/signup/plan",
  "/signup/account", "/login", "/forgot-password", "/about", "/trust", "/verification",
  "/community-guidelines", "/safety", "/contact", "/blog", "/legal", "/terms", "/privacy",
  "/cookie-policy", "/cookies", "/accessibility", "/explore", "/cities",
  "/dallas", "/austin", "/miami", "/new-york", "/los-angeles", "/chicago", "/houston",
  "/atlanta", "/las-vegas", "/orlando", "/therapists/kevin-os", "/therapists/bruno-dallas-tx",
  "/faq", "/how-it-works", "/near-me", "/guides", "/states", "/advertise", "/for-therapists"];

const seeds = [...new Set([...sitemapUrls, ...scopeRoutes])];
const sitemapSet = new Set(sitemapUrls);

const visited = new Map(); // path -> record
const linkGraph = new Map(); // path -> Set of source pages that link to it

async function fetchPage(path) {
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(WWW + path, { redirect: "follow", headers: { "User-Agent": UA } });
  } catch (e) {
    return { path, error: e.message };
  }
  const ms = Math.round(performance.now() - t0);
  const finalUrl = res.url;
  const status = res.status;
  const ct = res.headers.get("content-type") || "";
  const rec = { path, status, finalUrl, ms, redirected: res.redirected, inSitemap: sitemapSet.has(path) };
  if (!ct.includes("text/html") || status >= 400) { rec.bytes = 0; return rec; }
  const html = await res.text();
  rec.bytes = html.length;
  const $ = cheerio.load(html);
  rec.title = ($("title").first().text() || "").trim();
  rec.titleLen = rec.title.length;
  rec.metaDesc = ($('meta[name="description"]').attr("content") || "").trim();
  rec.metaDescLen = rec.metaDesc.length;
  rec.canonical = $('link[rel="canonical"]').attr("href") || "";
  rec.robotsMeta = $('meta[name="robots"]').attr("content") || "";
  rec.h1s = $("h1").map((_, el) => $(el).text().trim().replace(/\s+/g, " ")).get();
  rec.h1Count = rec.h1s.length;
  rec.h2Count = $("h2").length;
  rec.ogTitle = $('meta[property="og:title"]').attr("content") || "";
  rec.ogImage = $('meta[property="og:image"]').attr("content") || "";
  const imgs = $("img");
  rec.imgCount = imgs.length;
  rec.imgMissingAlt = imgs.filter((_, el) => !($(el).attr("alt") || "").trim() && ($(el).attr("aria-hidden") !== "true")).length;
  rec.schemaTypes = $('script[type="application/ld+json"]').map((_, el) => {
    try { const j = JSON.parse($(el).text());
      return (Array.isArray(j) ? j : [j]).flatMap(x => x["@graph"] ? x["@graph"].map(g => g["@type"]) : [x["@type"]]);
    } catch { return ["INVALID_JSON_LD"]; }
  }).get().flat().filter(Boolean);
  // word count of visible text (rough)
  $("script,style,noscript,svg").remove();
  rec.wordCount = $("body").text().replace(/\s+/g, " ").trim().split(" ").length;
  // internal links
  const internal = new Set(); let external = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
    try {
      const u = new URL(href, WWW + path);
      if (u.hostname.endsWith("masseurmatch.com")) internal.add(u.pathname);
      else external++;
    } catch {}
  });
  rec.internalLinks = [...internal];
  rec.internalLinkCount = internal.size;
  rec.externalLinkCount = external;
  return rec;
}

async function crawl(paths, wave) {
  const queue = paths.filter(p => !visited.has(p));
  console.log(`wave ${wave}: ${queue.length} urls`);
  const CONC = 8;
  let i = 0;
  async function worker() {
    while (i < queue.length) {
      const p = queue[i++];
      if (visited.has(p)) continue;
      visited.set(p, { pending: true });
      const rec = await fetchPage(p);
      visited.set(p, rec);
      for (const l of rec.internalLinks || []) {
        if (!linkGraph.has(l)) linkGraph.set(l, new Set());
        linkGraph.get(l).add(p);
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
}

await crawl(seeds, 1);
// wave 2: discovered links not yet visited (skip query strings beyond path)
const discovered = [...linkGraph.keys()].filter(p => !visited.has(p));
await crawl(discovered, 2);
// wave 3: one more level, capped at 150
const discovered3 = [...linkGraph.keys()].filter(p => !visited.has(p)).slice(0, 150);
await crawl(discovered3, 3);

const records = [...visited.values()].map(r => ({ ...r, linkedFrom: [...(linkGraph.get(r.path) || [])].slice(0, 5) }));
writeFileSync(new URL("./out/seo-crawl.json", import.meta.url), JSON.stringify(records, null, 1));

// CSV export
const esc = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
const cols = ["path","status","finalUrl","redirected","inSitemap","ms","bytes","title","titleLen","metaDesc","metaDescLen","canonical","robotsMeta","h1Count","h2Count","wordCount","imgCount","imgMissingAlt","internalLinkCount","externalLinkCount","schemaTypes"];
const csv = [cols.join(",")].concat(records.map(r => cols.map(c => esc(Array.isArray(r[c]) ? r[c].join("|") : r[c])).join(","))).join("\n");
writeFileSync(new URL("./out/seo-crawl.csv", import.meta.url), csv);

console.log(`total crawled: ${records.length}`);
console.log(`errors/4xx+: ${records.filter(r => r.error || r.status >= 400).length}`);
console.log(`redirected: ${records.filter(r => r.redirected).length}`);
