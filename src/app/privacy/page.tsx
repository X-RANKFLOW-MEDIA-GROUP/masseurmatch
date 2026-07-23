import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Privacy Policy | MasseurMatch",
  description:
    "MasseurMatch's privacy policy: how we collect, use, and protect your personal information. We never sell your data. CCPA and GDPR rights included.",
  alternates: { canonical: "https://www.masseurmatch.com/privacy" },
  openGraph: {
    title: "Privacy Policy | MasseurMatch",
    description: "How MasseurMatch collects, uses, and protects your data. We never sell your information.",
    url: "https://www.masseurmatch.com/privacy",
    siteName: "MasseurMatch",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy - MasseurMatch",
  url: "https://www.masseurmatch.com/privacy",
  description: "MasseurMatch privacy policy: data collection, use, and your rights.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://www.masseurmatch.com",
  },
};

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: `We collect information you provide directly when creating an account, listing a practice, or contacting us. This includes your name, email address, and (for therapists) your service and profile details.

We also collect limited technical data automatically, including your IP address, browser type, and pages visited on our site. This data is used solely to maintain and improve the platform.

We do not collect health information, sensitive personal data, or any information about the nature of your massage therapy sessions.`,
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: `We use your information to:

- Operate and maintain the MasseurMatch directory
- Review profile quality and completeness
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

- Safety/compliance partners when required by law
- Payment processors (Stripe) for handling subscription payments - we never store payment card data
- Hosting and infrastructure providers (Vercel, Supabase) who process data solely on our behalf under strict data processing agreements
- Law enforcement when required by valid legal process

Any third-party service provider we use is contractually prohibited from using your data for their own purposes.`,
  },
  {
    id: "cookies",
    title: "4. Cookies & Tracking",
    content: `We use a minimal set of cookies necessary to operate the platform (authentication, session state). We do not use third-party advertising cookies or behavioral tracking technologies.

You can disable cookies in your browser settings. Disabling cookies may affect your ability to log in and use account features. See our Cookie Policy at /cookie-policy for a full breakdown.`,
  },
  {
    id: "your-rights",
    title: "5. Your Privacy Rights",
    content: `Depending on your location, you may have rights including:

- Access: Request a copy of the personal data we hold about you
- Correction: Request that we correct inaccurate data
- Deletion: Request deletion of your personal data ("right to be forgotten")
- Portability: Request your data in a machine-readable format
- Objection: Object to certain types of processing

To exercise any of these rights, email privacy@masseurmatch.com. We respond to all requests within 30 days.`,
  },
  {
    id: "ccpa",
    title: "6. California Privacy Rights (CCPA)",
    content: `If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights:

- Right to Know: You may request that we disclose the categories and specific pieces of personal information we have collected about you.
- Right to Delete: You may request deletion of your personal information, subject to certain exceptions.
- Right to Opt-Out of Sale: We do not sell your personal information. However, you may submit an opt-out request at any time to privacy@masseurmatch.com and we will confirm our non-sale status.
- Right to Non-Discrimination: We will not discriminate against you for exercising any CCPA rights.

Authorized agents may submit requests on your behalf by contacting us at privacy@masseurmatch.com. We may require verification of identity before fulfilling requests.`,
  },
  {
    id: "gdpr",
    title: "7. European Privacy Rights (GDPR)",
    content: `If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have rights under the General Data Protection Regulation (GDPR) and equivalent laws:

- Lawful Basis: We process your data under the following legal bases: (a) performance of a contract (operating your account and profile), (b) legitimate interests (platform security, fraud prevention, analytics), and (c) consent (where explicitly sought).
- Right of Access (Article 15): Request a copy of your data.
- Right to Rectification (Article 16): Request correction of inaccurate data.
- Right to Erasure (Article 17): Request deletion of your data ("right to be forgotten").
- Right to Restriction (Article 18): Request restriction of processing in certain circumstances.
- Right to Data Portability (Article 20): Receive your data in a structured, machine-readable format.
- Right to Object (Article 21): Object to processing based on legitimate interests.
- Right to Lodge a Complaint: You have the right to lodge a complaint with your local supervisory authority.

Data Controller: XRankFlow Media Group LLC, legal@masseurmatch.com.
We do not transfer personal data outside the US except where necessary to operate the platform (e.g., Supabase, Vercel infrastructure), in which case we rely on standard contractual clauses or equivalent mechanisms.`,
  },
  {
    id: "data-security",
    title: "8. Data Security",
    content: `We implement industry-standard security measures including TLS encryption in transit, encrypted storage for sensitive data, and access controls that limit staff access to personal data on a need-to-know basis.

No method of transmission over the internet is 100% secure. While we use commercially reasonable security measures, we cannot guarantee absolute security.`,
  },
  {
    id: "retention",
    title: "9. Data Retention",
    content: `We retain account data for as long as your account is active. If you delete your account, we delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., fraud prevention records).`,
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: `MasseurMatch is not directed to children under 18. We do not knowingly collect personal information from anyone under 18. If you believe a minor has provided us with personal information, please contact us immediately at privacy@masseurmatch.com.`,
  },
  {
    id: "changes",
    title: "11. Changes to This Policy",
    content: `We may update this policy from time to time. We will notify registered users of material changes via email and update the "Last Updated" date below. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: "contact",
    title: "12. Contact",
    content: `For privacy-related questions or to exercise your rights:

Email: privacy@masseurmatch.com
Legal: legal@masseurmatch.com
Support: support@masseurmatch.com
Operator: XRankFlow Media Group LLC (Delaware)
Mailing: 2810 N Church St PMB 74302, Wilmington, DE 19802`,
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

      <div
        style={{
          background: "#FFFFFF",
          color: "#111111",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        <section
          style={{
            background: "#111111",
            color: "#FFFFFF",
            padding: "80px 24px 72px",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D4717E",
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
                color: "#FFFFFF",
              }}
            >
              Privacy Policy
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#9CA3AF",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Last Updated: April 27, 2026
            </p>
            <p
              style={{
                fontSize: 16,
                color: "#B0B8C4",
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
                color: "#8B1E2D",
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
                    borderBottom: "1px solid rgba(17,17,17,0.1)",
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
      </div>
    </>
  );
}
