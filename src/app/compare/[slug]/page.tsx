import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import ComparisonPage from "@/app/compare/[slug]/ComparisonPage";
import {
  COMPARISON_PUBLISHED_AT,
  competitorSlugs,
  competitorsByTier,
  getCompetitorBySlug,
  getCompetitorKeywords,
  getCompetitorTierLabel,
} from "@/lib/competitors";
import { siteUrl } from "@/lib/site";

type Params = {
  slug: string;
};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return competitorSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    return createPageMetadata({
      title: "Comparison not found",
      description: "This comparison page does not exist.",
      path: `/compare/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: competitor.metaTitle,
    description: competitor.metaDescription,
    path: `/compare/${competitor.slug}`,
    type: "article",
    keywords: [
      ...getCompetitorKeywords(competitor.name),
      `${competitor.name} review 2026`,
      `${competitor.name} alternative for massage therapists`,
      `MasseurMatch alternative to ${competitor.name}`,
    ],
  });
}

function buildComparisonArticleJsonLd(slug: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `MasseurMatch vs ${name}`,
    description,
    datePublished: COMPARISON_PUBLISHED_AT,
    dateModified: COMPARISON_PUBLISHED_AT,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl("/"),
    },
    mainEntityOfPage: siteUrl(`/compare/${slug}`),
  };
}

function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: siteUrl("/"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

function getRelatedComparisons(slug: string) {
  return competitorsByTier.filter((competitor) => competitor.slug !== slug).slice(0, 3);
}

export default async function CompareSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  const targetKeywords = getCompetitorKeywords(competitor.name);
  const tierLabel = getCompetitorTierLabel(competitor.tier);
  const articleDescription = `${competitor.metaDescription} ${tierLabel} competitor comparison for massage therapists evaluating directory alternatives on March 20, 2026.`;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: `MasseurMatch vs ${competitor.name}`, path: `/compare/${competitor.slug}` },
        ])}
      />
      <JsonLd
        data={buildComparisonArticleJsonLd(
          competitor.slug,
          competitor.name,
          articleDescription,
        )}
      />
      <JsonLd data={buildSoftwareApplicationJsonLd()} />
      <JsonLd data={buildFaqJsonLd(competitor.faqs)} />

      <ComparisonPage
        competitor={competitor}
        relatedComparisons={getRelatedComparisons(competitor.slug)}
        targetKeywords={targetKeywords}
      />
    </>
  );
}
