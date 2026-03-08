import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://masseurmatch.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;
const SITE_NAME = "MasseurMatch — Gay Massage Directory";

const BOT_USER_AGENTS = [
  "googlebot", "bingbot", "slurp", "duckduckbot", "facebookexternalhit",
  "twitterbot", "linkedinbot", "whatsapp", "telegrambot", "applebot",
  "pinterestbot", "redditbot", "discordbot", "embedly", "quora link preview",
  "showyoubot", "outbrain", "rogerbot", "vkshare", "w3c_validator",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildHtml(meta: { title: string; description: string; url: string; image: string; type?: string }): string {
  const { title, description, url, image, type = "website" } = meta;
  const t = escapeHtml(title);
  const d = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${t}</title>
  <meta name="description" content="${d}" />
  <link rel="canonical" href="${escapeHtml(url)}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="alternate" hreflang="en" href="${escapeHtml(url)}?lang=en" />
  <link rel="alternate" hreflang="es" href="${escapeHtml(url)}?lang=es" />
  <link rel="alternate" hreflang="pt" href="${escapeHtml(url)}?lang=pt" />
  <link rel="alternate" hreflang="fr" href="${escapeHtml(url)}?lang=fr" />
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(url)}">${t}</a>…</p>
</body>
</html>`;
}

function toSlug(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
    });
  }

  try {
    const userAgent = req.headers.get("user-agent") || "";
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";

    if (!isBot(userAgent)) {
      return new Response(null, { status: 302, headers: { Location: `${BASE_URL}${path}` } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const botHeaders = {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "index, follow",
    };

    // --- New: /:city/therapist/:slug ---
    const newProfileMatch = path.match(/^\/([a-z0-9-]+)\/therapist\/([a-z0-9-]+)$/i);
    if (newProfileMatch) {
      const [, citySlug, profileSlug] = newProfileMatch;
      const cityName = citySlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, full_name, bio, city, state, avatar_url")
        .eq("slug", profileSlug)
        .eq("is_active", true)
        .single();

      if (profile) {
        const name = profile.display_name || profile.full_name || "Therapist";
        const city = [profile.city, profile.state].filter(Boolean).join(", ") || cityName;
        const desc = profile.bio?.slice(0, 155) || `Professional massage therapist in ${city}`;

        return new Response(buildHtml({
          title: `${name} — Massage Therapist in ${city} | MasseurMatch`,
          description: desc,
          url: `${BASE_URL}${path}`,
          image: profile.avatar_url || DEFAULT_OG_IMAGE,
          type: "profile",
        }), { headers: botHeaders });
      }
    }

    // --- Legacy: /therapist/:id ---
    const legacyProfileMatch = path.match(/^\/therapist\/([a-f0-9-]+)$/i);
    if (legacyProfileMatch) {
      const profileId = legacyProfileMatch[1];

      const [profileRes, photoRes] = await Promise.all([
        supabase.from("profiles").select("display_name, full_name, bio, city, state, avatar_url, slug").eq("id", profileId).eq("is_active", true).single(),
        supabase.from("profile_photos").select("storage_path").eq("profile_id", profileId).eq("moderation_status", "approved").eq("is_primary", true).limit(1).maybeSingle(),
      ]);

      const profile = profileRes.data;
      if (profile) {
        const name = profile.display_name || profile.full_name || "Therapist";
        const city = [profile.city, profile.state].filter(Boolean).join(", ");
        const desc = profile.bio?.slice(0, 155) || `Professional massage therapist in ${city}`;
        const image = photoRes.data?.storage_path || profile.avatar_url || DEFAULT_OG_IMAGE;
        // Redirect bots to new canonical URL if slug exists
        const citySlug = profile.city ? toSlug(profile.city) : "us";
        const canonicalUrl = profile.slug ? `${BASE_URL}/${citySlug}/therapist/${profile.slug}` : `${BASE_URL}${path}`;

        return new Response(buildHtml({
          title: `${name} — Massage Therapist in ${city || "Your City"} | MasseurMatch`,
          description: desc,
          url: canonicalUrl,
          image,
          type: "profile",
        }), { headers: botHeaders });
      }
    }

    // --- New: /:city/massage-therapists ---
    const listingMatch = path.match(/^\/([a-z0-9-]+)\/massage-therapists$/i);
    if (listingMatch) {
      const citySlug = listingMatch[1];
      const cityName = citySlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true).ilike("city", cityName);

      return new Response(buildHtml({
        title: `Massage Therapists in ${cityName} — Browse ${count || 0} Professionals | MasseurMatch`,
        description: `Find ${count || 0} verified massage therapists in ${cityName}. Compare services, prices, and book your session.`,
        url: `${BASE_URL}${path}`,
        image: DEFAULT_OG_IMAGE,
      }), { headers: botHeaders });
    }

    // --- New: /:city (single segment, could be city) ---
    const cityMatch = path.match(/^\/([a-z0-9-]+)$/i);
    // Also handle legacy /city/:slug
    const legacyCityMatch = path.match(/^\/city\/([a-z0-9-]+)$/i);
    const matchedCitySlug = legacyCityMatch?.[1] || cityMatch?.[1];

    if (matchedCitySlug && !["explore","pricing","about","contact","auth","forgot-password","reset-password","register","faq","safety","terms","privacy"].includes(matchedCitySlug)) {
      const cityName = matchedCitySlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true).ilike("city", cityName);

      return new Response(buildHtml({
        title: `Gay Massage in ${cityName} — ${count || 0} Therapists | MasseurMatch`,
        description: `Find ${count || 0} male massage therapists in ${cityName}. Browse verified gay-friendly massage professionals.`,
        url: `${BASE_URL}/${matchedCitySlug}`,
        image: DEFAULT_OG_IMAGE,
      }), { headers: botHeaders });
    }

    // --- Default: static pages ---
    return new Response(buildHtml({
      title: "Gay Massage Directory — Find Male Massage Therapists Near You",
      description: "The #1 gay massage directory. Find male massage therapists for men. Browse gay-friendly massage professionals near you.",
      url: `${BASE_URL}${path}`,
      image: DEFAULT_OG_IMAGE,
    }), { headers: botHeaders });
  } catch (err) {
    console.error("render-meta error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
