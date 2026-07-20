import { Suspense } from "react";
import type { Metadata } from "next";
import { ComingSoonPage } from "./_components/coming-soon-page";
import HomePage from "./home-3d/page";
import { generateFAQSchema, DIRECTORY_FAQ_SCHEMA } from "@/app/_lib/seo-structured-data";

// Control homepage mode via environment variable
const SHOW_COMING_SOON = process.env.NEXT_PUBLIC_SHOW_COMING_SOON === "true";

const siteTitle = "MasseurMatch — Premium Directory of LGBTQ+-Affirming Male Massage Therapists";
const siteDescription = "Discover verified, LGBTQ+-affirming male massage therapists you can trust. Premium directory connecting clients with licensed, certified professionals in major US cities.";

export const metadata: Metadata = SHOW_COMING_SOON
  ? {
      title: "MasseurMatch — Launching Soon",
      description: "The most trustworthy directory of LGBTQ+-affirming male massage therapists in the US. Launching soon.",
      robots: { index: false, follow: false },
    }
  : {
      title: siteTitle,
      description: siteDescription,
      openGraph: {
        title: siteTitle,
        description: siteDescription,
        type: "website",
        url: "https://masseurmatch.com",
        images: [
          {
            url: "https://masseurmatch.com/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "MasseurMatch - Premium LGBTQ+-Affirming Male Massage Therapist Directory",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: siteTitle,
        description: siteDescription,
        images: ["https://masseurmatch.com/og-image.jpg"],
      },
      robots: "index, follow",
      alternates: {
        canonical: "https://masseurmatch.com",
      },
    };

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MasseurMatch",
  url: "https://masseurmatch.com",
  logo: "https://masseurmatch.com/logo.png",
  description: siteDescription,
  sameAs: [
    "https://twitter.com/masseurmatch",
    "https://facebook.com/masseurmatch",
    "https://instagram.com/masseurmatch",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: "support@masseurmatch.com",
  },
  areaServed: "US",
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MasseurMatch",
  url: "https://masseurmatch.com",
  searchAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://masseurmatch.com/explore?q={search_term_string}",
    },
    query: "required name=search_term_string",
  },
};

function RootPageContent() {
  if (SHOW_COMING_SOON) {
    return <ComingSoonPage />;
  }

  const faqSchema = generateFAQSchema(DIRECTORY_FAQ_SCHEMA);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePage />
    </>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootPageContent />
    </Suspense>
  );
}
