import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_lib/seo";
import { getCanonicalCompetitorRouteSlug, getCompetitorRouteBySlug } from "@/lib/seo/competitorComparisonRoutes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = getCanonicalCompetitorRouteSlug(slug);
  const route = getCompetitorRouteBySlug(canonicalSlug);

  if (!route) {
    return createPageMetadata({
      title: "Massage directory page not found",
      description: "This massage directory page is not available.",
      path: `/massage-directories/${canonicalSlug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: route.title,
    description: route.description,
    path: `/massage-directories/${route.slug}`,
    noIndex: !route.indexable,
    type: "article",
    keywords: route.keywords,
  });
}
