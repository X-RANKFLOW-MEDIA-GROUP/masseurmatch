import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_BASE_URL = "https://masseurmatch.com";
const SUPPORTED_LANGS = ["en", "es", "pt", "fr"];
const PAGE_SIZE = 1000;

const STATIC_URLS = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/explore", priority: "0.9", changefreq: "daily" },
  { path: "/cities", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/safety", priority: "0.5", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/therapist-agreement", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.2", changefreq: "yearly" },
  { path: "/billing-policy", priority: "0.2", changefreq: "yearly" },
  { path: "/acceptable-use", priority: "0.2", changefreq: "yearly" },
  { path: "/photo-policy", priority: "0.2", changefreq: "yearly" },
  { path: "/dmca", priority: "0.2", changefreq: "yearly" },
  { path: "/accessibility", priority: "0.2", changefreq: "yearly" },
  { path: "/marketing-consent", priority: "0.2", changefreq: "yearly" },
  { path: "/notice-at-collection", priority: "0.2", changefreq: "yearly" },
  { path: "/governing-law", priority: "0.2", changefreq: "yearly" },
  { path: "/legal-contact", priority: "0.2", changefreq: "yearly" },
];

function parseEnvFile(contents) {
  const parsed = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    parsed[key] = value;
  }

  return parsed;
}

async function loadLocalEnv() {
  const envFiles = [".env", ".env.local"];
  const merged = {};

  for (const relativeFile of envFiles) {
    const envPath = path.join(repoRoot, relativeFile);
    try {
      const contents = await readFile(envPath, "utf8");
      Object.assign(merged, parseEnvFile(contents));
    } catch {
      // Ignore missing env files so the script still works in CI or Vercel.
    }
  }

  return { ...merged, ...process.env };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toSlug(city) {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function looksLikeDemoSlug(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized) return false;

  return (
    normalized === "demo" ||
    normalized.startsWith("demo-") ||
    normalized.endsWith("-demo") ||
    normalized.includes("-demo-")
  );
}

function normalizeDate(value, fallbackDate) {
  if (!value) return fallbackDate;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallbackDate;
  return date.toISOString().split("T")[0];
}

function resolveBaseUrl(env) {
  const candidate =
    env.VITE_PUBLIC_APP_URL ||
    env.NEXT_PUBLIC_APP_URL ||
    env.SITE_URL ||
    DEFAULT_BASE_URL;

  const normalized = candidate.replace(/\/+$/, "");

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return DEFAULT_BASE_URL;
  }

  return normalized;
}

function buildHreflangLinks(baseUrl, urlPath) {
  const links = SUPPORTED_LANGS.map((lang) => {
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(`${baseUrl}${urlPath}?lang=${lang}`)}" />`;
  });

  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}${urlPath}`)}" />`);
  return links.join("\n");
}

function buildUrlEntry(baseUrl, { path: urlPath, priority, changefreq, lastmod }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(`${baseUrl}${urlPath}`)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    `    <lastmod>${lastmod}</lastmod>`,
    buildHreflangLinks(baseUrl, urlPath),
    "  </url>",
  ].join("\n");
}

async function readCitySlugs() {
  const citiesFile = path.join(repoRoot, "src", "data", "cities.ts");
  const contents = await readFile(citiesFile, "utf8");
  const matches = [...contents.matchAll(/slug:\s*"([^"]+)"/g)];
  const slugs = matches.map((match) => match[1]);
  return [...new Set(slugs)].sort();
}

function isSeoRichProfile(profile) {
  const hasName = Boolean((profile.display_name || profile.full_name || "").trim());
  const hasCity = Boolean((profile.city || "").trim());
  const hasCanonicalIdentifier = Boolean(profile.slug || profile.id);
  const hasIndexableSlug = !looksLikeDemoSlug(profile.slug);
  const bioText = (profile.bio || profile.about || profile.about_me || profile.description || "").trim();
  const hasMeaningfulBio = bioText.length >= 80;
  const hasSpecialties = Array.isArray(profile.specialties) && profile.specialties.length > 0;
  const hasPricing = Number(profile.incall_price) > 0 || Number(profile.outcall_price) > 0;
  const hasFaq = Array.isArray(profile.custom_faq) && profile.custom_faq.length > 0;

  return (
    hasName &&
    hasCity &&
    hasCanonicalIdentifier &&
    hasIndexableSlug &&
    true
  );
}

function keyKind(value) {
  if (!value) return "unknown";
  if (value.startsWith("sb_secret_")) return "secret";
  if (value.startsWith("sb_publishable_")) return "publishable";
  if (value.startsWith("sbp_")) return "management_token";
  if (value.split(".").length === 3) {
    const middle = value.split(".")[1] || "";
    if (middle.includes("service_role")) return "service_role_jwt";
    return "jwt";
  }
  return "unknown";
}

function describeKey(value) {
  const kind = keyKind(value);
  const masked = value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : "***";
  return `${kind} (${masked})`;
}

async function fetchSeoProfiles(env) {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const keyCandidates = [
    { name: "SITEMAP_SUPABASE_KEY", value: env.SITEMAP_SUPABASE_KEY },
    { name: "SUPABASE_SECRET_KEY", value: env.SUPABASE_SECRET_KEY },
    { name: "SUPABASE_SERVICE_ROLE_KEY", value: env.SUPABASE_SERVICE_ROLE_KEY },
    { name: "SUPABASE_SERVICE_ROLE", value: env.SUPABASE_SERVICE_ROLE },
    { name: "VITE_SUPABASE_PUBLISHABLE_KEY", value: env.VITE_SUPABASE_PUBLISHABLE_KEY },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  ].filter((entry) => Boolean(entry.value));

  const queryVariants = [
    {
      name: "strict",
      select: "id, slug, display_name, full_name, bio, city, updated_at, is_seed_profile, status, specialties, incall_price, outcall_price, custom_faq",
      applyFilters: (query) => query.eq("is_active", true).eq("status", "active").eq("is_seed_profile", false).not("city", "is", null),
    },
    {
      name: "no-bio",
      select: "id, slug, display_name, full_name, city, updated_at, is_seed_profile, status, specialties, incall_price, outcall_price, custom_faq",
      applyFilters: (query) => query.eq("is_active", true).eq("status", "active").eq("is_seed_profile", false).not("city", "is", null),
    },
    {
      name: "status-only",
      select: "id, slug, display_name, full_name, city, updated_at, status, specialties, incall_price, outcall_price, custom_faq",
      applyFilters: (query) => query.eq("is_active", true).eq("status", "active").not("city", "is", null),
    },
    {
      name: "minimal",
      select: "id, slug, display_name, full_name, city, updated_at, specialties, incall_price, outcall_price, custom_faq",
      applyFilters: (query) => query.not("city", "is", null),
    },
    {
      name: "core-only",
      select: "id, slug, display_name, full_name, city, updated_at",
      applyFilters: (query) => query.not("city", "is", null),
    },
  ];

  if (!supabaseUrl || keyCandidates.length === 0) {
    console.warn("[sitemap] Missing Supabase credentials. Generating sitemap with static and city pages only.");
    return [];
  }

  let lastError = null;

  for (const candidate of keyCandidates) {
    if (keyKind(candidate.value) === "management_token") {
      console.warn(`[sitemap] Skipping ${candidate.name}: appears to be a Supabase management token, not a database API key.`);
      continue;
    }

    const supabase = createClient(supabaseUrl, candidate.value, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const variant of queryVariants) {
      const profiles = [];
      let from = 0;

      while (true) {
        const query = supabase
          .from("profiles")
          .select(variant.select)
          .range(from, from + PAGE_SIZE - 1);

        const { data, error } = await variant.applyFilters(query);

        if (error) {
          lastError = error;
          const keyInfo = describeKey(candidate.value);
          console.warn(`[sitemap] Failed using ${candidate.name} (${variant.name}) ${keyInfo}: ${error.message}`);

          if (/invalid api key/i.test(error.message)) {
            console.warn(`[sitemap] ${candidate.name} does not match ${supabaseUrl} or is not a valid project API key.`);
            break;
          }

          if (/column\s+profiles\..+\s+does not exist/i.test(error.message)) {
            console.warn(`[sitemap] Falling back from query variant ${variant.name} due to schema mismatch.`);
            break;
          }

          break;
        }

        profiles.push(...(data || []));

        if (!data || data.length < PAGE_SIZE) {
          const seoProfiles = profiles.filter(isSeoRichProfile);

          if (seoProfiles.length === 0 && ["VITE_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].includes(candidate.name)) {
            console.warn("[sitemap] Query succeeded with a public key but returned no SEO-rich profiles. Set SITEMAP_SUPABASE_KEY or SUPABASE_SECRET_KEY for complete sitemap coverage.");
          }

          return seoProfiles;
        }

        from += PAGE_SIZE;
      }

      if (/invalid api key/i.test(lastError?.message || "")) {
        break;
      }
    }
  }

  throw new Error(`Failed to fetch profiles for sitemap: ${lastError?.message || "Unknown error"}`);
}

async function generateSitemap() {
  const env = await loadLocalEnv();
  const baseUrl = resolveBaseUrl(env);
  const citySlugs = await readCitySlugs();
  const seoProfiles = await fetchSeoProfiles(env);
  const today = new Date().toISOString().split("T")[0];
  const entries = [];
  const seenPaths = new Set();

  function pushEntry(entry) {
    if (seenPaths.has(entry.path)) return;
    seenPaths.add(entry.path);
    entries.push(buildUrlEntry(baseUrl, entry));
  }

  for (const staticUrl of STATIC_URLS) {
    pushEntry({ ...staticUrl, lastmod: today });
  }

  for (const slug of citySlugs) {
    pushEntry({ path: `/${slug}`, priority: "0.8", changefreq: "weekly", lastmod: today });
    pushEntry({ path: `/${slug}/massage-therapists`, priority: "0.85", changefreq: "daily", lastmod: today });
  }

  for (const profile of seoProfiles) {
    const citySlug = toSlug(profile.city);
    const profileSlug = profile.slug || profile.id;
    pushEntry({
      path: `/${citySlug}/therapist/${profileSlug}`,
      priority: "0.7",
      changefreq: "weekly",
      lastmod: normalizeDate(profile.updated_at, today),
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;

  const outputPath = path.join(repoRoot, "public", "sitemap.xml");
  await writeFile(outputPath, xml, "utf8");

  console.log(
    `[sitemap] Generated ${entries.length} URLs (${STATIC_URLS.length} static, ${citySlugs.length * 2} city pages, ${seoProfiles.length} SEO-rich profiles).`,
  );
}

generateSitemap().catch((error) => {
  console.error("[sitemap] Generation failed:", error);
  process.exitCode = 1;
});



