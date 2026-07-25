import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";
import AboutContent from "./about-content";

export const metadata: Metadata = createPageMetadata({
  title: "About Us — Elevating the Standard of Holistic Wellness",
  description:
    "MasseurMatch is an exclusive network where professional excellence meets absolute trust. Discover our core pillars: rigorous curation, elite standards, and absolute privacy.",
  path: "/about",
  keywords: [
    "about masseurmatch",
    "luxury wellness platform",
    "elite massage directory",
    "holistic wellness",
    "rigorous curation",
  ],
});

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About MasseurMatch",
  url: "https://www.masseurmatch.com/about",
  description:
    "MasseurMatch is an exclusive network where professional excellence meets absolute trust.",
  mainEntity: {
    "@type": "Organization",
    name: "MasseurMatch",
    legalName: "X RankFlow Media Group LLC",
    email: "legal@masseurmatch.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "8 The Green, Ste B",
      addressLocality: "Dover",
      addressRegion: "DE",
      postalCode: "19901",
      addressCountry: "US",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <JsonLd data={aboutPageJsonLd} />
      <AboutContent />
    </>
  );
}
