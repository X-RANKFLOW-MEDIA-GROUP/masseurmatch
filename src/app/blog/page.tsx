import type { Metadata } from "next";
import Script from "next/script";
import { BlogContent } from "./_components/BlogContent";
import { NewsletterSignup } from "./_components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Blog | Massage Therapy Tips, Wellness & LGBTQ+ Resources - MasseurMatch",
  description:
    "Expert massage therapy advice, wellness guides, LGBTQ+ health resources, and industry insights from the MasseurMatch editorial team.",
  openGraph: {
    title: "Blog | MasseurMatch",
    description:
      "Expert massage therapy advice, wellness guides, and LGBTQ+ health resources.",
    url: "https://masseurmatch.com/blog",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/blog" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "MasseurMatch Blog",
  url: "https://masseurmatch.com/blog",
  description:
    "Expert massage therapy advice, wellness guides, and LGBTQ+ inclusive health resources.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

export default function BlogPage() {
  return (
    <>
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FFFFFF",
          color: "#1A1A1A",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        <section
          style={{
            background: "#1A1A1A",
            padding: "80px 24px 72px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#CC2424",
              marginBottom: 20,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Editorial
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 400,
              color: "#FFFFFF",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            The MasseurMatch Journal
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.65)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Wellness insight, LGBTQ+ health resources, and industry expertise -
            curated for clients and therapists alike.
          </p>
        </section>

        <BlogContent />

        <NewsletterSignup />
      </main>
    </>
  );
}
