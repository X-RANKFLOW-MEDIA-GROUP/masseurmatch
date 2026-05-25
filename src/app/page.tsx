import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/json-ld";
import { createPageMetadata } from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";
import { MasseurMatchComingSoon } from "@/components/coming-soon/MasseurMatchComingSoon";

export const revalidate = 3600;

const homeMetadata = createPageMetadata({
  title: "MasseurMatch Coming Soon | Find Independent Massage Therapists",
  description:
    "MasseurMatch is launching soon. Join early access for a modern directory built to discover independent LGBTQ+ affirming massage therapists by city, service style, profile details, and direct contact preferences.",
  path: "/",
  keywords: [
    "MasseurMatch",
    "massage therapist directory",
    "independent massage therapists",
    "LGBTQ massage directory",
    "LGBTQ affirming massage therapists",
    "find massage therapist",
    "massage therapists near me",
    "local massage search",
    "outcall massage",
    "incall massage",
    "deep tissue massage",
    "swedish massage",
    "professional massage directory",
    "therapist profile directory",
    "massage directory USA",
  ],
});

export const metadata: Metadata = {
  ...homeMetadata,
  alternates: {
    canonical: siteUrl("/"),
    languages: {
      en: siteUrl("/"),
      "pt-BR": siteUrl("/pt-br"),
    },
  },
  openGraph: {
    ...homeMetadata.openGraph,
    title: "MasseurMatch is Coming Soon",
    description:
      "Join early access for a modern directory built to discover independent LGBTQ+ affirming massage therapists by city, service style, profile details, and direct contact preferences.",
    url: siteUrl("/"),
    siteName: "MasseurMatch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MasseurMatch is Coming Soon",
    description:
      "Join early access for a modern directory built to discover independent LGBTQ+ affirming massage therapists.",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MasseurMatch",
          url: siteUrl("/"),
          description:
            "MasseurMatch is a modern directory for discovering independent LGBTQ+ affirming massage therapists by city, service style, profile details, and direct contact preferences.",
          potentialAction: {
            "@type": "SearchAction",
            target: siteUrl("/explore?q={search_term_string}"),
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MasseurMatch",
          url: siteUrl("/"),
          slogan: "Find the right massage therapist, beautifully.",
        }}
      />
      <MasseurMatchComingSoon />
    </>
  );
}
