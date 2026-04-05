import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Privacy Policy | MasseurMatch",
  description:
    "MasseurMatch's privacy policy: how we collect, use, and protect your personal information. We never sell your data.",
  alternates: { canonical: "https://masseurmatch.com/privacy" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy - MasseurMatch",
  url: "https://masseurmatch.com/privacy",
  description: "MasseurMatch privacy policy: data collection, use, and your rights.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: `We collect information you provide directly when creating an account, listing a practice, or contacting us. This includes your name, email address, and (for therapists) your professional license information and service details.

We also collect limited technical data automatically, including your IP address, browser type, and pages visited on our site. This data is used solely to maintain and improve the platform.

We do not collect health information, sensitive personal data, or any information about the nature of your massage therapy sessions.`,
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: `We use your information to:

- Operate and maintain the MasseurMatch directory
- Verify therapist credentials with state licensing boards
- Send transactional communications (account confirmations, support responses)
- Improve platform functionality and user experience
- Detect and prevent fraud, abuse, or policy violations

We do not use your information for advertising profiling or behavioral targeting. We do not send unsolicited marketing communications without your explicit consent.`,
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Third Parties",
    content: `We never sell your personal information to third parties. Period.

We share limited data only with:

- State licensing boards (therapist license numbers only, for verification purposes)
- Payment processors (Stripe) for handling subscription payments - we never store payment card data
- Hosting and infrastructure providers (Vercel, Supabase) who process data solely on our behalf under strict data processing agreements
- Law enforcement when required by valid legal process

Any third-party service provider we use is contractually prohibited from using your data for their own purposes.`,
  },
  {
    id: "cookies",
    title: "4. Cookies & Tracking",
    content: `We use a minimal set of cookies necessary to operate the platform (authentication, session state). We do not use third-party advertising cookies or behavioral tracking technologies.

You can disable cookies in your browser settings. Disabling cookies may affect your ability to log in and use account features.`,
  },
  {
    id: "your-rights",
    title: "5. Your Rights",
    content: `Depending on your location, you may have rights including:

- Access: Request a copy of the personal data we hold about you
- Correction: Request that we correct inaccurate data
- Deletion: Request deletion of your personal data ("right to be forgotten")
- Portability: Request your data in a machine-readable format
- Objection: Object to certain types of processing

To exercise any of these rights, email privacy@masseurmatch.com. We respond to all requests within 30 days.`,
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: `We implement industry-standard security measures including TLS encryption in transit, encrypted storage for sensitive data, and access controls that limit staff access to personal data on a need-to-know basis.

No method of transmission over the internet is 100% secure. While we use commercially reasonable security measures, we cannot guarantee absolute security.`,
  },
  {
    id: "retention",
    title: "7. Data Retention",
    content: `We retain account data for as long as your account is active. If you delete your account, we delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., fraud prevention records).`,
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: `MasseurMatch is not directed to children under 18. We do not knowingly collect personal information from anyone under 18. If you believe a minor has provided us with personal information, please contact us immediately at privacy@masseurmatch.com.`,
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: `We may update this policy from time to time. We will notify registered users of material changes via email and update the "Last Updated" date below. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: "contact",
    title: "10. Contact",
    content: `For privacy-related questions or to exercise your rights:

Email: privacy@masseurmatch.com
Operator: XRankFlow Media Group LLC
Location: Dallas, Texas, USA`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Script
        id="privacy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FCFBF8",
          color: "#0B1F3A",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "80px 24px 72px",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Legal
            </p>
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Privacy Policy
            </h1>
            <p
              style={{
                fontSize: 14,
                opacity: 0.5,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Last Updated: March 1, 2025
            </p>
            <p
              style={{
                fontSize: 16,
                opacity: 0.65,
                marginTop: 16,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              MasseurMatch is operated by XRankFlow Media Group LLC. This policy
              explains how we collect, use, and protect your information. We
              believe in radical transparency - and we never sell your data.
            </p>
          </div>
        </section>

        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "72px 24px 100px",
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <nav
            aria-label="Privacy policy sections"
            style={{
              position: "sticky",
              top: 100,
            }}
          >
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                color: "#FF8A1F",
                marginBottom: 16,
              }}
            >
              Sections
            </p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  display: "block",
                  fontSize: 12,
                  fontFamily: "system-ui, sans-serif",
                  color: "#6B7280",
                  textDecoration: "none",
                  padding: "6px 0",
                  lineHeight: 1.4,
                }}
              >
                {section.title}
              </a>
            ))}
          </nav>

          <div>
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                style={{ marginBottom: 52, scrollMarginTop: 100 }}
              >
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 400,
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(11,31,58,0.1)",
                  }}
                >
                  {section.title}
                </h2>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.85,
                    color: "#374151",
                    fontFamily: "system-ui, sans-serif",
                    whiteSpace: "pre-line",
                  }}
                >
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
