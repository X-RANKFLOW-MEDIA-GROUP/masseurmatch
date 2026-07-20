import type { Metadata } from "next";
import Link from "next/link";
import { generateFAQSchema, DIRECTORY_FAQ_SCHEMA } from "@/app/_lib/seo-structured-data";

const siteTitle = "MasseurMatch — Premium Directory of LGBTQ+-Affirming Male Massage Therapists";
const siteDescription = "Discover verified, LGBTQ+-affirming male massage therapists you can trust. Premium directory connecting clients with licensed, certified professionals in major US cities.";

export const metadata: Metadata = {
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

export default function HomePage() {
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Find Your Perfect Therapist
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            MasseurMatch is a premium directory of LGBTQ+-affirming male massage therapists.
            Discover verified professionals you can trust in your area.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="border border-border rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">For Clients</h2>
              <p className="text-muted-foreground mb-6">
                Browse and book appointments with verified male massage therapists who are LGBTQ+-affirming and trustworthy.
              </p>
              <Link href="/explore" className="text-primary font-semibold hover:underline">
                Browse Therapists →
              </Link>
            </div>
            <div className="border border-border rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">For Therapists</h2>
              <p className="text-muted-foreground mb-6">
                Grow your practice and connect with clients who value trust and quality.
              </p>
              <Link href="/for-therapists" className="text-primary font-semibold hover:underline">
                List Your Practice →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
