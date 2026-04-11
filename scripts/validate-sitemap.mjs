#!/usr/bin/env node

const BASE_URL = (process.env.SITEMAP_VALIDATION_BASE_URL || "https://masseurmatch.com").replace(/\/$/, "");
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

function parseLocs(xml) {
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return [...new Set(matches.map((m) => m[1].trim()))];
}

function chunk(values, size) {
  const chunks = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}

async function checkUrl(url) {
  if (url.includes("?lang=")) {
    return { url, ok: false, reason: "contains ?lang=" };
  }

  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      "user-agent": "MasseurMatch-SitemapValidator/1.0",
    },
  });

  if (response.status >= 300 && response.status < 400) {
    return {
      url,
      ok: false,
      reason: `redirects (${response.status}) to ${response.headers.get("location") || "(missing location)"}`,
    };
  }

  if (response.status !== 200) {
    return { url, ok: false, reason: `returns ${response.status}` };
  }

  return { url, ok: true };
}

async function main() {
  console.log(`[sitemap-validator] Fetching ${SITEMAP_URL}`);
  const sitemapResponse = await fetch(SITEMAP_URL, {
    headers: {
      "user-agent": "MasseurMatch-SitemapValidator/1.0",
    },
  });

  if (!sitemapResponse.ok) {
    throw new Error(`Unable to fetch sitemap: ${sitemapResponse.status} ${sitemapResponse.statusText}`);
  }

  const sitemapXml = await sitemapResponse.text();
  const urls = parseLocs(sitemapXml);

  if (!urls.length) {
    throw new Error("No <loc> entries found in sitemap.xml");
  }

  const failures = [];

  for (const group of chunk(urls, 10)) {
    const results = await Promise.all(group.map((url) => checkUrl(url)));
    failures.push(...results.filter((result) => !result.ok));
  }

  if (failures.length) {
    console.error(`\n[sitemap-validator] ${failures.length} failing URL(s):`);
    for (const failure of failures) {
      console.error(`- ${failure.url} -> ${failure.reason}`);
    }
    process.exit(1);
  }

  console.log(`[sitemap-validator] OK. ${urls.length} URL(s) checked. All are 200 and non-redirecting.`);
}

main().catch((error) => {
  console.error(`[sitemap-validator] ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
