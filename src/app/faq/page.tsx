import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Frequently Asked Questions – MasseurMatch",
  description:
    "Answers to the most common questions about finding a massage therapist on MasseurMatch, how listings work, pricing, privacy, and LGBTQ+ safety.",
  openGraph: {
    title: "FAQ – MasseurMatch",
    description:
      "Common questions about MasseurMatch: how to find a therapist, list your practice, pricing, and privacy.",
    url: "https://masseurmatch.com/faq",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/faq" },
};

const faqs = [
  {
    category: "For Clients",
    items: [
      {
        q: "What is MasseurMatch?",
        a: "MasseurMatch is a directory platform that connects clients with verified, professional massage therapists across the United States. We specialize in creating a safe, LGBTQ+-inclusive environment where every client feels welcome and respected.",
      },
      {
        q: "Is MasseurMatch LGBTQ+-friendly?",
        a: "Yes, inclusivity is the entire reason MasseurMatch exists. Every therapist on our platform has agreed to our LGBTQ+-Inclusive Practice Standards. LGBTQ+ clients can browse, search, and connect with confidence that they will be treated with dignity and respect.",
      },
      {
        q: "How do I find a massage therapist near me?",
        a: "Use our search bar to enter your city or ZIP code. You can filter results by massage modality, pricing, availability, and LGBTQ+ certifications. Each profile includes the therapist's services, rates, and client reviews.",
      },
      {
        q: "How are therapists reviewed on MasseurMatch?",
        a: "Profiles go through identity and quality checks before publication. Clients should still confirm service fit, boundaries, and session details directly with each therapist.",
      },
      {
        q: "Is my information private when I search?",
        a: "Completely. Therapists cannot see who has viewed their profile until you choose to contact them. We never sell your data, and we collect only the minimum information needed to operate the directory.",
      },
      {
        q: "Does MasseurMatch charge clients to search or contact therapists?",
        a: "Searching and browsing MasseurMatch is completely free for clients. You can view therapist profiles, read reviews, and contact therapists at no cost.",
      },
      {
        q: "What types of massage are available?",
        a: "Therapists on MasseurMatch offer a wide range of modalities including Swedish, deep tissue, sports massage, trigger point therapy, prenatal massage, lymphatic drainage, Thai massage, and more. Use the modality filter on the search page to find the right specialty.",
      },
      {
        q: "How do I leave a review for my therapist?",
        a: "After connecting with a therapist through MasseurMatch, you can log into your account and submit a review from your session history. Reviews help the community make informed decisions and reward excellent therapists.",
      },
    ],
  },
  {
    category: "For Therapists",
    items: [
      {
        q: "How do I list my massage practice on MasseurMatch?",
        a: "Click 'List Your Practice' in the top navigation and follow the onboarding steps. You'll need a profile photo, a description of your services, and your service areas and rates. Our team typically reviews new applications within 2–3 business days.",
      },
      {
        q: "What does it cost to list on MasseurMatch?",
        a: "We offer a free basic listing and paid plans with enhanced visibility, priority placement, and additional profile features. Visit our Pricing page for current plan details.",
      },
      {
        q: "Do I need to be LGBTQ+ to list on MasseurMatch?",
        a: "No. Any licensed massage therapist who is committed to providing a respectful, inclusive experience for all clients is welcome to list on MasseurMatch. LGBTQ+ identity is not required — commitment to inclusivity is.",
      },
      {
        q: "How long does profile review take?",
        a: "Most new profiles are reviewed within 1–2 business days. Keeping your bio, rates, neighborhood, and photos complete helps speed approval.",
      },
      {
        q: "Can I control who contacts me through my listing?",
        a: "Yes. You control your contact preferences and availability. Clients must initiate contact — you are never added to automated contact lists or shared with third-party services.",
      },
    ],
  },
  {
    category: "Privacy & Safety",
    items: [
      {
        q: "Does MasseurMatch sell my data?",
        a: "No. We have a strict no-data-sale policy. Your personal information, search history, and contact details are never sold or shared with advertisers or third-party data brokers.",
      },
      {
        q: "How do I report a safety concern?",
        a: "Email safety@masseurmatch.com or use the 'Report' button on any therapist profile. We review every report within 24 hours and take appropriate action, up to and including permanent removal from the platform.",
      },
      {
        q: "What happens if I have a bad experience?",
        a: "Contact our support team immediately at support@masseurmatch.com. Describe what happened, and our team will investigate. We take every complaint seriously and use reports to continuously improve our vetting process.",
      },
    ],
  },
];

const allFaqsForJsonLd = faqs.flatMap((cat) =>
  cat.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  }))
);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqsForJsonLd,
};

export default function FAQPage() {
  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FFFFFF",
          color: "#111111",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        {/* ── Hero ── */}
        <section
          style={{
            background: "#111111",
            color: "#FFFFFF",
            padding: "88px 24px 80px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8B1E2D",
              marginBottom: 20,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            FAQ
          </p>
          <h1
            style={{
              fontSize: "clamp(34px, 5.5vw, 58px)",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Frequently Asked Questions
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "rgba(252,251,248,0.6)",
              fontFamily: "system-ui, sans-serif",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Everything you need to know about finding or listing on
            MasseurMatch.
          </p>
        </section>

        {/* ── FAQ Content ── */}
        <section style={{ padding: "80px 24px", maxWidth: 820, margin: "0 auto" }}>
          {faqs.map((section) => (
            <div key={section.category} style={{ marginBottom: 72 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 36,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: "#8B1E2D",
                  }}
                />
                <h2
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                    color: "#8B1E2D",
                    margin: 0,
                  }}
                >
                  {section.category}
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {section.items.map((item, i) => (
                  <details
                    key={i}
                    style={{
                      borderTop: "1px solid rgba(26,26,26,0.1)",
                      padding: "24px 0",
                    }}
                  >
                    <summary
                      style={{
                        fontSize: "clamp(15px, 2vw, 18px)",
                        fontWeight: 400,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        listStyle: "none",
                        userSelect: "none",
                      }}
                    >
                      {item.q}
                      <span
                        style={{
                          fontSize: 20,
                          color: "#8B1E2D",
                          flexShrink: 0,
                          marginLeft: 16,
                        }}
                      >
                        +
                      </span>
                    </summary>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "#374151",
                        fontFamily: "system-ui, sans-serif",
                        marginTop: 16,
                        paddingRight: 40,
                      }}
                    >
                      {item.a}
                    </p>
                  </details>
                ))}
                <div style={{ borderTop: "1px solid rgba(26,26,26,0.1)" }} />
              </div>
            </div>
          ))}
        </section>

        {/* ── Still Have Questions ── */}
        <section
          style={{
            background: "#111111",
            color: "#FFFFFF",
            padding: "72px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(22px, 3.5vw, 36px)",
              fontWeight: 400,
              marginBottom: 14,
            }}
          >
            Still have questions?
          </h2>
          <p
            style={{
              fontSize: 15,
              opacity: 0.65,
              marginBottom: 32,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Our team is happy to help. Reach out anytime.
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
              background: "#8B1E2D",
              color: "#111111",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Contact Us
          </Link>
        </section>
      </main>
    </>
  );
}
