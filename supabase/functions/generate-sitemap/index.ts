import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://masseurmatch.com";

const EDITORIAL_CITIES = [
  "los-angeles",
  "san-francisco",
  "new-york",
  "miami",
  "chicago",
  "seattle",
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
];

function toSlug(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildUrlEntry(loc: string, priority: string, changefreq: string, lastmod?: string): string {
  let entry = `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>`;
  if (lastmod) {
    entry += `\n    <lastmod>${lastmod}</lastmod>`;
  }
  entry += `\n  </url>`;
  return entry;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active, complete profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, display_name, full_name, bio, city, updated_at")
      .eq("is_active", true)
      .not("city", "is", null);

    if (error) {
      console.error("DB error:", error);
      throw new Error("Failed to query profiles");
    }

    // Filter: must have name, bio >= 50 chars, and city
    const qualifiedProfiles = (profiles || []).filter((p) => {
      const hasName = !!(p.display_name || p.full_name);
      const hasBio = !!(p.bio && p.bio.length >= 50);
      const hasCity = !!p.city;
      return hasName && hasBio && hasCity;
    });

    // Extract unique city slugs from qualified profiles
    const dynamicCitySlugs = new Set<string>();
    for (const p of qualifiedProfiles) {
      dynamicCitySlugs.add(toSlug(p.city));
    }

    // Merge with editorial cities (deduplicated)
    const allCitySlugs = new Set([...EDITORIAL_CITIES, ...dynamicCitySlugs]);

    // Build XML
    const entries: string[] = [];

    // Static URLs
    for (const s of STATIC_URLS) {
      entries.push(buildUrlEntry(`${BASE_URL}${s.path}`, s.priority, s.changefreq));
    }

    // City URLs
    for (const slug of allCitySlugs) {
      entries.push(buildUrlEntry(`${BASE_URL}/city/${slug}`, "0.9", "daily"));
    }

    // Profile URLs
    for (const p of qualifiedProfiles) {
      const lastmod = p.updated_at ? p.updated_at.split("T")[0] : undefined;
      entries.push(buildUrlEntry(`${BASE_URL}/therapist/${p.id}`, "0.7", "weekly", lastmod));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
