import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://masseurmatch.com";
const LANGS = ["en", "es", "pt", "fr"];

const EDITORIAL_CITIES = [
  "los-angeles", "san-francisco", "new-york", "miami", "chicago", "seattle",
  "houston", "phoenix", "philadelphia", "san-antonio", "san-diego", "dallas",
  "austin", "atlanta", "denver", "nashville", "boston", "portland", "las-vegas",
];

const STATIC_URLS: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/explore", priority: "0.8", changefreq: "daily" },
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

type SitemapProfile = {
  id: string;
  slug: string | null;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  updated_at: string | null;
  is_seed_profile: boolean;
  status: string | null;
  specialties: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
  custom_faq: unknown[] | null;
};

function toSlug(city: string): string {
  return city.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function looksLikeDemoSlug(value: string | null): boolean {
  const normalized = (value || "").trim().toLowerCase();

  if (!normalized) return false;

  return (
    normalized === "demo" ||
    normalized.startsWith("demo-") ||
    normalized.endsWith("-demo") ||
    normalized.includes("-demo-")
  );
}

function isSeoRichProfile(profile: SitemapProfile): boolean {
  const hasName = !!(profile.display_name || profile.full_name)?.trim();
  const hasCity = !!profile.city?.trim();
  const hasCanonicalIdentifier = !!(profile.slug || profile.id);
  const hasIndexableSlug = !looksLikeDemoSlug(profile.slug);
  const bioLength = (profile.bio || "").trim().length;
  const hasMeaningfulBio = bioLength >= 80;
  const hasSpecialties = Array.isArray(profile.specialties) && profile.specialties.length > 0;
  const hasPricing = Number(profile.incall_price) > 0 || Number(profile.outcall_price) > 0;
  const hasFaq = Array.isArray(profile.custom_faq) && profile.custom_faq.length > 0;

  return (
    hasName &&
    hasCity &&
    hasCanonicalIdentifier &&
    hasIndexableSlug &&
    hasMeaningfulBio &&
    (hasSpecialties || hasPricing || hasFaq)
  );
}

function buildHreflangLinks(path: string): string {
  let links = "";
  for (const lang of LANGS) {
    links += `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}${path}?lang=${lang}" />`;
  }
  links += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}" />`;
  return links;
}

function buildUrlEntry(loc: string, path: string, priority: string, changefreq: string, lastmod?: string): string {
  let entry = `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>`;
  if (lastmod) entry += `\n    <lastmod>${lastmod}</lastmod>`;
  entry += buildHreflangLinks(path);
  entry += `\n  </url>`;
  return entry;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, slug, display_name, full_name, bio, city, updated_at, is_seed_profile, status, specialties, incall_price, outcall_price, custom_faq")
      .eq("is_active", true)
      .eq("status", "active")
      .eq("is_seed_profile", false)
      .not("city", "is", null);

    if (error) { console.error("DB error:", error); throw new Error("Failed to query profiles"); }

    const qualifiedProfiles = ((profiles || []) as SitemapProfile[]).filter(isSeoRichProfile);

    const dynamicCitySlugs = new Set<string>();
    for (const p of qualifiedProfiles) { dynamicCitySlugs.add(toSlug(p.city)); }
    const allCitySlugs = new Set([...EDITORIAL_CITIES, ...dynamicCitySlugs]);

    const entries: string[] = [];
    const today = new Date().toISOString().split("T")[0];

    // Static URLs
    for (const s of STATIC_URLS) {
      entries.push(buildUrlEntry(`${BASE_URL}${s.path}`, s.path, s.priority, s.changefreq, today));
    }

    // City URLs — new format: /:city and /:city/massage-therapists
    for (const slug of allCitySlugs) {
      const cityPath = `/${slug}`;
      const listingPath = `/${slug}/massage-therapists`;
      entries.push(buildUrlEntry(`${BASE_URL}${cityPath}`, cityPath, "0.9", "daily", today));
      entries.push(buildUrlEntry(`${BASE_URL}${listingPath}`, listingPath, "0.9", "daily", today));
    }

    // Profile URLs — new format: /:city/therapist/:slug
    for (const p of qualifiedProfiles) {
      const citySlug = toSlug(p.city);
      const profileSlug = p.slug || p.id;
      const path = `/${citySlug}/therapist/${profileSlug}`;
      const lastmod = p.updated_at ? p.updated_at.split("T")[0] : today;
      entries.push(buildUrlEntry(`${BASE_URL}${path}`, path, "0.7", "weekly", lastmod));
    }

    console.log(`Sitemap generated: ${entries.length} URLs (${STATIC_URLS.length} static, ${allCitySlugs.size} cities, ${qualifiedProfiles.length} profiles)`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
