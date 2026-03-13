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
  "gptbot", "chatgpt-user", "claude-web", "anthropic-ai", "google-extended",
  "perplexitybot", "bytespider", "cohere-ai", "slackbot",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildHead(meta: { title: string; description: string; url: string; image: string; type?: string; jsonLd?: string }): string {
  const { title, description, url, image, type = "website", jsonLd } = meta;
  const t = escapeHtml(title);
  const d = escapeHtml(description);

  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
</head>`;
}

function buildHtml(meta: { title: string; description: string; url: string; image: string; type?: string; jsonLd?: string }, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
${buildHead(meta)}
<body>
${bodyContent}
</body>
</html>`;
}

function toSlug(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function titleCase(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const botHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
  "X-Robots-Tag": "index, follow",
};

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

    // ── Profile page: /:city/therapist/:slug ──
    const newProfileMatch = path.match(/^\/([a-z0-9-]+)\/therapist\/([a-z0-9-]+)$/i);
    if (newProfileMatch) {
      const [, citySlug, profileSlug] = newProfileMatch;
      const cityName = titleCase(citySlug);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, full_name, bio, city, state, avatar_url, specialties, incall_price, outcall_price, is_verified_identity, certifications, languages")
        .eq("slug", profileSlug)
        .eq("is_active", true)
        .single();

      if (profile) {
        const name = profile.display_name || profile.full_name || "Therapist";
        const city = [profile.city, profile.state].filter(Boolean).join(", ") || cityName;
        const desc = profile.bio?.slice(0, 155) || `Professional massage therapist in ${city}`;
        const specialties = (profile.specialties || []).join(", ");

        const jsonLd = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HealthAndBeautyBusiness",
          name,
          description: desc,
          image: profile.avatar_url || DEFAULT_OG_IMAGE,
          url: `${BASE_URL}${path}`,
          address: { "@type": "PostalAddress", addressLocality: profile.city, addressRegion: profile.state },
          ...(profile.incall_price ? { priceRange: `$${profile.incall_price}+` } : {}),
        });

        const body = `
  <header>
    <nav><a href="${BASE_URL}">MasseurMatch</a> &rsaquo; <a href="${BASE_URL}/${citySlug}">${cityName}</a> &rsaquo; ${escapeHtml(name)}</nav>
  </header>
  <main>
    <article>
      <h1>${escapeHtml(name)} — Massage Therapist in ${escapeHtml(city)}</h1>
      ${profile.is_verified_identity ? '<p><strong>✓ Identity Verified</strong></p>' : ''}
      ${profile.bio ? `<section><h2>About</h2><p>${escapeHtml(profile.bio)}</p></section>` : ''}
      ${specialties ? `<section><h2>Specialties</h2><p>${escapeHtml(specialties)}</p></section>` : ''}
      ${(profile.certifications || []).length ? `<section><h2>Certifications</h2><p>${escapeHtml(profile.certifications!.join(", "))}</p></section>` : ''}
      ${(profile.languages || []).length ? `<section><h2>Languages</h2><p>${escapeHtml(profile.languages!.join(", "))}</p></section>` : ''}
      ${profile.incall_price || profile.outcall_price ? `<section><h2>Pricing</h2><ul>${profile.incall_price ? `<li>In-call: $${profile.incall_price}</li>` : ''}${profile.outcall_price ? `<li>Out-call: $${profile.outcall_price}</li>` : ''}</ul></section>` : ''}
      <p><a href="${BASE_URL}/${citySlug}/massage-therapists">Browse more therapists in ${escapeHtml(cityName)}</a></p>
    </article>
  </main>`;

        return new Response(buildHtml({
          title: `${name} — Massage Therapist in ${city} | MasseurMatch`,
          description: desc,
          url: `${BASE_URL}${path}`,
          image: profile.avatar_url || DEFAULT_OG_IMAGE,
          type: "profile",
          jsonLd,
        }, body), { headers: botHeaders });
      }
    }

    // ── Legacy profile: /therapist/:id ──
    const legacyProfileMatch = path.match(/^\/therapist\/([a-f0-9-]+)$/i);
    if (legacyProfileMatch) {
      const profileId = legacyProfileMatch[1];
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, full_name, bio, city, state, avatar_url, slug")
        .eq("id", profileId)
        .eq("is_active", true)
        .single();

      if (profile) {
        const name = profile.display_name || profile.full_name || "Therapist";
        const city = [profile.city, profile.state].filter(Boolean).join(", ");
        const citySlug = profile.city ? toSlug(profile.city) : "us";
        const canonicalUrl = profile.slug ? `${BASE_URL}/${citySlug}/therapist/${profile.slug}` : `${BASE_URL}${path}`;

        // 301 redirect bots to canonical URL
        return new Response(null, {
          status: 301,
          headers: { Location: canonicalUrl, "X-Robots-Tag": "noindex, follow" },
        });
      }
    }

    // ── City listing: /:city/massage-therapists ──
    const listingMatch = path.match(/^\/([a-z0-9-]+)\/massage-therapists$/i);
    if (listingMatch) {
      const citySlug = listingMatch[1];
      const cityName = titleCase(citySlug);

      const [countRes, profilesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true).ilike("city", cityName),
        supabase.from("profiles").select("display_name, full_name, slug, specialties, avatar_url").eq("is_active", true).ilike("city", cityName).limit(20),
      ]);

      const count = countRes.count || 0;
      const profiles = profilesRes.data || [];

      const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Massage Therapists in ${cityName}`,
        numberOfItems: count,
        itemListElement: profiles.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BASE_URL}/${citySlug}/therapist/${p.slug || 'profile'}`,
          name: p.display_name || p.full_name,
        })),
      });

      const profileLinks = profiles.map(p => {
        const n = escapeHtml(p.display_name || p.full_name || "Therapist");
        const sp = (p.specialties || []).slice(0, 3).join(", ");
        return `<li><a href="${BASE_URL}/${citySlug}/therapist/${p.slug}">${n}</a>${sp ? ` — ${escapeHtml(sp)}` : ''}</li>`;
      }).join("\n        ");

      const body = `
  <header>
    <nav><a href="${BASE_URL}">MasseurMatch</a> &rsaquo; <a href="${BASE_URL}/${citySlug}">${escapeHtml(cityName)}</a> &rsaquo; Massage Therapists</nav>
  </header>
  <main>
    <h1>Massage Therapists in ${escapeHtml(cityName)}</h1>
    <p>Browse ${count} verified massage therapists in ${escapeHtml(cityName)}. Compare services, specialties, and book your session.</p>
    ${profiles.length ? `<section><h2>Featured Therapists</h2><ul>${profileLinks}</ul></section>` : ''}
    <p><a href="${BASE_URL}/explore">Explore all cities</a></p>
  </main>`;

      return new Response(buildHtml({
        title: `Massage Therapists in ${cityName} — Browse ${count} Professionals | MasseurMatch`,
        description: `Find ${count} verified massage therapists in ${cityName}. Compare services, prices, and book your session.`,
        url: `${BASE_URL}${path}`,
        image: DEFAULT_OG_IMAGE,
        jsonLd,
      }, body), { headers: botHeaders });
    }

    // ── City landing: /:city ──
    const cityMatch = path.match(/^\/([a-z0-9-]+)$/i);
    const legacyCityMatch = path.match(/^\/city\/([a-z0-9-]+)$/i);
    const matchedCitySlug = legacyCityMatch?.[1] || cityMatch?.[1];
    const excludedSlugs = ["explore","pricing","about","contact","auth","forgot-password","reset-password","register","faq","safety","terms","privacy","cities","claim"];

    if (matchedCitySlug && !excludedSlugs.includes(matchedCitySlug)) {
      // Legacy redirect
      if (legacyCityMatch) {
        return new Response(null, { status: 301, headers: { Location: `${BASE_URL}/${matchedCitySlug}` } });
      }

      const cityName = titleCase(matchedCitySlug);
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true).ilike("city", cityName);

      const body = `
  <header>
    <nav><a href="${BASE_URL}">MasseurMatch</a> &rsaquo; ${escapeHtml(cityName)}</nav>
  </header>
  <main>
    <h1>Gay Massage in ${escapeHtml(cityName)}</h1>
    <p>Find ${count || 0} male massage therapists in ${escapeHtml(cityName)}. Browse verified gay-friendly massage professionals.</p>
    <nav>
      <a href="${BASE_URL}/${matchedCitySlug}/massage-therapists">View all therapists in ${escapeHtml(cityName)}</a>
    </nav>
  </main>`;

      return new Response(buildHtml({
        title: `Gay Massage in ${cityName} — ${count || 0} Therapists | MasseurMatch`,
        description: `Find ${count || 0} male massage therapists in ${cityName}. Browse verified gay-friendly massage professionals.`,
        url: `${BASE_URL}/${matchedCitySlug}`,
        image: DEFAULT_OG_IMAGE,
      }, body), { headers: botHeaders });
    }

    // ── Homepage / static pages ──
    const body = `
  <header>
    <nav><a href="${BASE_URL}">MasseurMatch</a></nav>
  </header>
  <main>
    <h1>Gay Massage Directory — Find Male Massage Therapists Near You</h1>
    <p>The #1 gay massage directory. Find male massage therapists for men. Browse gay-friendly massage professionals near you.</p>
    <section>
      <h2>Popular Cities</h2>
      <ul>
        <li><a href="${BASE_URL}/new-york">New York</a></li>
        <li><a href="${BASE_URL}/los-angeles">Los Angeles</a></li>
        <li><a href="${BASE_URL}/miami">Miami</a></li>
        <li><a href="${BASE_URL}/chicago">Chicago</a></li>
        <li><a href="${BASE_URL}/san-francisco">San Francisco</a></li>
        <li><a href="${BASE_URL}/houston">Houston</a></li>
        <li><a href="${BASE_URL}/dallas">Dallas</a></li>
        <li><a href="${BASE_URL}/atlanta">Atlanta</a></li>
        <li><a href="${BASE_URL}/seattle">Seattle</a></li>
        <li><a href="${BASE_URL}/denver">Denver</a></li>
      </ul>
    </section>
    <p><a href="${BASE_URL}/explore">Explore all cities</a> | <a href="${BASE_URL}/pricing">Provider plans</a></p>
  </main>`;

    return new Response(buildHtml({
      title: "Gay Massage Directory — Find Male Massage Therapists Near You",
      description: "The #1 gay massage directory. Find male massage therapists for men. Browse gay-friendly massage professionals near you.",
      url: `${BASE_URL}${path}`,
      image: DEFAULT_OG_IMAGE,
    }, body), { headers: botHeaders });
  } catch (err) {
    console.error("render-meta error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
