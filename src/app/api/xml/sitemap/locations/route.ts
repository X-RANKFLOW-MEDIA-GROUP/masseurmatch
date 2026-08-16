import { getCities } from "@/app/_lib/directory";
import { buildReleaseSitemapEntries } from "@/app/_lib/sitemap-release";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  try {
    // Get all sitemap entries to determine which cities are eligible (have public profiles)
    const sitemapEntries = await buildReleaseSitemapEntries();

    // Extract city slugs from the sitemap entries (they appear as /{city-slug})
    const cityUrlPattern = /^https?:\/\/[^/]+\/([a-z0-9-]+)\/?$/;
    const eligibleCitySlugs = new Set<string>();

    for (const entry of sitemapEntries) {
      const match = entry.url.match(cityUrlPattern);
      if (match) {
        const slug = match[1];
        // Verify this slug is a valid city (not a special route)
        if (getCities().some((city) => city.slug === slug)) {
          eligibleCitySlugs.add(slug);
        }
      }
    }

    // Build location URLs for each eligible city
    const locationUrls = Array.from(eligibleCitySlugs)
      .sort()
      .map((slug) => siteUrl(`/${slug}`));

    // Generate XML
    const xml = buildLocationSitemapXml(locationUrls);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[locations sitemap] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function buildLocationSitemapXml(urls: string[]): string {
  const urlEntries = urls
    .map(
      (url) => `\t<url>\n\t\t<loc>${escapeXml(url)}</loc>\n\t</url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
