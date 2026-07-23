import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Terms of Service | MasseurMatch",
  description:
    "MasseurMatch terms of service: rules for clients and therapists using the directory platform operated by XRankFlow Media Group LLC.",
  alternates: { canonical: "https://www.masseurmatch.com/terms" },
  openGraph: {
    title: "Terms of Service | MasseurMatch",
    description: "Rules for clients and therapists using the MasseurMatch directory platform.",
    url: "https://www.masseurmatch.com/terms",
    siteName: "MasseurMatch",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service – MasseurMatch",
  url: "https://www.masseurmatch.com/terms",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://www.masseurmatch.com",
  },
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using MasseurMatch ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.

These Terms apply to all users of the Platform, including clients browsing listings and massage therapists who list their services.`,
  },
  {
    id: "platform-nature",
    title: "2. Nature of the Platform",
    content: `MasseurMatch is a directory platform operated by XRankFlow Media Group LLC ("Company," "we," "us"). We connect clients seeking massage therapy with independent, self-employed massage therapists.

Important: MasseurMatch is not an employer, staffing agency, or service provider. We do not employ massage therapists. Therapists listed on the Platform are independent professionals operating their own businesses. The Company is not a party to any service agreement between clients and therapists.`,
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    content: `You must be at least 18 years old to use MasseurMatch. By using the Platform, you represent that you meet this requirement.

Therapists must follow all applicable local regulations for their services and keep profile information accurate while their listing is active.`,
  },
  {
    id: "therapist-listings",
    title: "4. Therapist Listings",
    content: `Therapists listing on MasseurMatch agree to:

• Provide accurate, truthful information in their profiles
• Maintain accurate and current profile details
• Offer only legal wellness services within applicable law
• Adhere to MasseurMatch's LGBTQ+-Inclusive Practice Standards
• Promptly notify us of major profile or service changes
• Not misrepresent their qualifications, rates, or availability

We reserve the right to remove any listing at any time for any reason, including but not limited to policy violations or substantiated client complaints.`,
  },
  {
    id: "client-conduct",
    title: "5. Client Conduct",
    content: `Clients using MasseurMatch agree to:

• Use the Platform only for the purpose of finding legitimate massage therapy services
• Treat all therapists with respect and professionalism
• Not solicit or request any services that are illegal or unsafe
• Not submit false, misleading, or malicious reviews
• Report any concerns or inappropriate behavior to MasseurMatch support

Clients who violate these terms may have their accounts suspended or permanently terminated.`,
  },
  {
    id: "prohibited-content",
    title: "6. Prohibited Content & Uses",
    content: `The following are strictly prohibited on MasseurMatch:

• Any solicitation, offer, or suggestion of sexual services of any kind
• False or misleading profile information
• Harassment, discrimination, or threatening behavior toward any user
• Scraping, crawling, or automated access to the Platform without written permission
• Creating multiple accounts for the same person or practice
• Impersonating another person or business

Violations may result in immediate and permanent account termination and, where appropriate, reporting to law enforcement.`,
  },
  {
    id: "anti-trafficking",
    title: "7. Legal Compliance & Anti-Trafficking (FOSTA-SESTA)",
    content: `MasseurMatch is a professional massage directory. It is not an escort or adult-services platform and does not permit, host, or facilitate commercial sexual activity, prostitution, or sex trafficking.

Consistent with the Allow States and Victims to Fight Online Sex Trafficking Act and the Stop Enabling Sex Traffickers Act ("FOSTA-SESTA," including 18 U.S.C. § 2421A) and our reporting obligations under 18 U.S.C. § 2258A, we prohibit any use of the Platform to promote or facilitate prostitution, remove offending content, terminate the responsible accounts, preserve relevant records, cooperate with valid legal process, and report apparent child sexual abuse material to the National Center for Missing & Exploited Children (NCMEC).

Every visitor can report a profile using the "Report this profile" link on any listing, or by emailing trust@masseurmatch.com. Suspected trafficking can also be reported to the National Human Trafficking Hotline at 1-888-373-7888. MasseurMatch acts as a neutral intermediary and does not create user content.`,
  },
  {
    id: "disclaimer",
    title: "8. Disclaimer of Warranties",
    content: `The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee:

• The accuracy of therapist profiles, profile claims, or reviews
• The availability of any particular therapist
• The quality of services provided by listed therapists
• Uninterrupted or error-free access to the Platform

You use the Platform and engage with therapists at your own risk.`,
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law, XRankFlow Media Group LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or services obtained through the Platform.

Our total liability for any claim arising from use of the Platform shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100, whichever is greater.`,
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content: `These Terms are governed by the laws of the State of Delaware, where XRankFlow Media Group LLC is incorporated. Any disputes shall be resolved in the courts of Delaware, and you consent to personal jurisdiction in that venue.`,
  },
  {
    id: "changes",
    title: "11. Changes to Terms",
    content: `We may update these Terms from time to time. We will notify registered users of material changes via email and update the "Last Updated" date. Continued use of the Platform after changes constitutes acceptance of the updated Terms.`,
  },
  {
    id: "contact-terms",
    title: "12. Contact",
    content: `Questions about these Terms:

Email: legal@masseurmatch.com
Operator: XRankFlow Media Group LLC
State of Incorporation: Delaware, USA`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Script
        id="terms-jsonld"
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
        {/* ── Header ── */}
        <section
          style={{
            background: "#111111",
            color: "#FFFFFF",
            padding: "clamp(56px, 8vw, 80px) 20px clamp(48px, 7vw, 72px)",
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
              Terms of Service
            </h1>
            <p
              style={{
                fontSize: "clamp(12px, 2.5vw, 14px)",
                color: "#9CA3AF",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Last Updated: April 27, 2026 — Effective immediately
            </p>
            <p
              style={{
                fontSize: "clamp(14px, 2.8vw, 16px)",
                color: "#B0B8C4",
                marginTop: 16,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              Please read these terms carefully before using MasseurMatch. They
              govern your use of the platform and your relationship with
              XRankFlow Media Group LLC.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <div
          className="grid grid-cols-1 gap-7 md:grid-cols-[180px_1fr]"
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "clamp(32px, 6vw, 48px) 16px clamp(56px, 8vw, 84px)",
            alignItems: "start",
          }}
        >
          {/* Sidebar nav */}
          <nav
            aria-label="Terms sections"
            className="md:sticky md:top-24"
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
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: "block",
                  fontSize: 13,
                  fontFamily: "system-ui, sans-serif",
                  color: "#6B7280",
                  textDecoration: "none",
                  padding: "5px 0",
                  lineHeight: 1.4,
                }}
              >
                {s.title}
              </a>
            ))}
          </nav>

          {/* Body */}
          <div>
            <div
              style={{
                background: "#8B1E2D",
                color: "#FFFFFF",
                padding: "18px 18px",
                marginBottom: 48,
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.65,
              }}
            >
              <strong>Directory Only:</strong> MasseurMatch is a directory, not
              a massage service provider. We do not employ therapists and are
              not a party to any service agreements between clients and
              therapists.
            </div>

            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                style={{ marginBottom: 48, scrollMarginTop: 100 }}
              >
                <h2
                  style={{
                    fontSize: "clamp(18px, 3.2vw, 19px)",
                    fontWeight: 400,
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(17,17,17,0.1)",
                  }}
                >
                  {s.title}
                </h2>
                <div
                  style={{
                    fontSize: "clamp(14px, 2.9vw, 15px)",
                    lineHeight: 1.85,
                    color: "#374151",
                    fontFamily: "system-ui, sans-serif",
                    whiteSpace: "pre-line",
                  }}
                >
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
