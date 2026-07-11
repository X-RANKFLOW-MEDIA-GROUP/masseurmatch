import type { MetadataRoute } from "next";
import {
  buildCoreSitemapEntries,
  buildCitiesSitemapEntries,
  buildServicesSitemapEntries,
  buildNeighborhoodsSitemapEntries,
  buildProfilesSitemapEntries,
  buildGuidesSitemapEntries,
  buildBlogPostsSitemapEntries,
  buildTourPagesSitemapEntries,
  SITEMAP_SEGMENT_IDS,
} from "@/app/_lib/seo-routes";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const segmentId = parseInt(id, 10);

  if (!SITEMAP_SEGMENT_IDS.includes(segmentId as typeof SITEMAP_SEGMENT_IDS[number])) {
    return new Response("Not found", { status: 404 });
  }

  const now = new Date();
  const [cities, services, profiles, blogPosts, neighborhoods, guides, tourPages] = await Promise.all([
    buildCitiesSitemapEntries(now),
    buildServicesSitemapEntries(now),
    buildProfilesSitemapEntries(now),
    buildBlogPostsSitemapEntries(now),
    buildNeighborhoodsSitemapEntries(now),
    buildGuidesSitemapEntries(now),
    buildTourPagesSitemapEntries(now),
  ]);

  const allEntries = [
    ...buildCoreSitemapEntries(now),
    ...cities,
    ...services,
    ...neighborhoods,
    ...profiles,
    ...guides,
    ...blogPosts,
    ...tourPages,
  ];

  // Split entries into segments
  const segmentSize = Math.ceil(allEntries.length / SITEMAP_SEGMENT_IDS.length);
  const startIndex = segmentId * segmentSize;
  const endIndex = startIndex + segmentSize;
  const segmentEntries = allEntries.slice(startIndex, endIndex);

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${segmentEntries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString().split('T')[0] : entry.lastModified}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
