import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Frequently Asked Questions – MasseurMatch",
  description: "Answers to common questions about finding a massage provider on MasseurMatch, listings, pricing, identity verification, privacy, and safety.",
  openGraph: {
    title: "FAQ – MasseurMatch",
    description: "Common questions about MasseurMatch: how the directory works, provider listings, pricing, identity verification, and privacy.",
    url: "https://www.masseurmatch.com/faq",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://www.masseurmatch.com/faq" },
};

const faqs = [
  {
    category: "For Clients",
    items: [
      {
        q: "What is MasseurMatch?",
        a: "MasseurMatch is an online directory of professional massage providers — not a booking or session-payment platform. We help clients discover and compare provider profiles; clients then contact providers directly to arrange services outside MasseurMatch. The directory is intended for professional, lawful, non-sexual massage services.",
      },
      {
        q: "Does MasseurMatch handle booking or payments?",
        a: "No. MasseurMatch does not schedule provider-client appointments or process payments for massage sessions. Clients and providers arrange scheduling, rates, and payment directly with each other outside the platform. Paid MasseurMatch subscriptions are fees providers pay MasseurMatch for directory visibility and platform features.",
      },
      {
        q: "Is MasseurMatch LGBTQ+-friendly?",
        a: "Yes. MasseurMatch is designed as an inclusive directory. Providers must follow platform conduct and content rules, including respectful and non-discriminatory behavior.",
      },
      {
        q: "How do I find a massage provider near me?",
        a: "Use search to browse profiles by location and available filters. Each profile can include services, rates, availability information, and direct contact options supplied by the provider.",
      },
      {
        q: "How are provider profiles reviewed on MasseurMatch?",
        a: "New profiles are subject to platform moderation before publication. MasseurMatch may review profile content and photos for policy compliance. Providers who complete identity verification may receive an Identity Verified badge. MasseurMatch does not independently verify professional licenses, certifications, insurance, or regulatory standing.",
      },
      {
        q: "What does the Identity Verified badge mean?",
        a: "Identity Verified means MasseurMatch reviewed a government-issued identity document and a current challenge selfie for that provider. It confirms identity only. It does not verify professional licensing, background history, qualifications, services, service quality, or regulatory compliance.",
      },
      {
        q: "What do Featured or Boosted labels mean?",
        a: "Featured, Boosted, Spotlight, and similar visibility labels are promotional placements or subscription features. They do not mean MasseurMatch endorses, recommends, licenses, or guarantees the provider.",
      },
      {
        q: "Is my information private when I browse?",
        a: "Providers do not receive your identity merely because you view a public profile. Review the MasseurMatch Privacy Policy for details about analytics, cookies, account data, contact interactions, and other information processed by the platform.",
      },
      {
        q: "Does MasseurMatch charge clients to browse or contact providers?",
        a: "Browsing public provider profiles and using listed contact options does not require a provider subscription. Providers may pay MasseurMatch for listing visibility and premium platform features.",
      },
      {
        q: "Does MasseurMatch publish client reviews?",
        a: "No. MasseurMatch does not currently operate a public provider review or rating system. Safety or policy concerns should be reported to support@masseurmatch.com.",
      },
    ],
  },
  {
    category: "For Providers",
    items: [
      {
        q: "How do I list my practice on MasseurMatch?",
        a: "Create a provider account and complete the onboarding steps for your profile, contact details, service information, photos, required attestations, and verification steps. Profiles are subject to moderation before publication.",
      },
      {
        q: "What does it cost to list on MasseurMatch?",
        a: "MasseurMatch offers a Free listing and paid subscription tiers with additional visibility and platform features. Visit the Pricing page for the current plan details.",
      },
      {
        q: "How does identity verification work?",
        a: "MasseurMatch generates a one-time six-digit challenge. You upload a supported government-issued ID plus a current selfie showing your face and the challenge code. An authorized reviewer checks required criteria. Sensitive identity images are deleted after the final review decision.",
      },
      {
        q: "Does identity verification verify my professional license?",
        a: "No. Identity verification is limited to identity. It does not verify massage licensing, certifications, insurance, background history, qualifications, or the legality or quality of services.",
      },
      {
        q: "Do I need to be LGBTQ+ to list on MasseurMatch?",
        a: "No. Providers are not required to identify as LGBTQ+. They are required to comply with MasseurMatch's inclusive, respectful, professional, and non-sexual conduct standards.",
      },
      {
        q: "Can I control my contact information and availability?",
        a: "Providers control the profile information and contact methods made available through their listing, subject to platform rules and plan features. MasseurMatch itself does not manage provider calendars or bookings.",
      },
    ],
  },
  {
    category: "Privacy & Safety",
    items: [
      {
        q: "What happens to my ID images after verification?",
        a: "Identity evidence is stored privately for authorized review. When a final approval or rejection decision is recorded, MasseurMatch removes the submitted identity document and challenge-selfie files. Limited status and audit metadata may be retained to operate the verification feature and document the decision.",
      },
      {
        q: "Does MasseurMatch sell personal data?",
        a: "Review the current Privacy Policy for MasseurMatch's data practices and user choices. Identity verification evidence is handled separately as sensitive data and is not used as a public profile asset.",
      },
      {
        q: "How do I report a safety or policy concern?",
        a: "Contact support@masseurmatch.com or use an available reporting feature on the site. MasseurMatch may investigate reports and take action under its moderation and safety policies.",
      },
      {
        q: "What should I do if I have a problem with a provider?",
        a: "For a platform-policy or safety concern, contact support@masseurmatch.com with relevant details. Because MasseurMatch is a directory rather than the provider of massage services, disputes about a session may also need to be addressed directly with the independent provider or the appropriate authorities when necessary.",
      },
    ],
  },
];

const allFaqsForJsonLd = faqs.flatMap((cat) =>
  cat.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
);

const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: allFaqsForJsonLd };

export default function FAQPage() {
  return (
    <>
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: "#FFFFFF", color: "#111111", fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh" }}>
        <section style={{ background: "#111111", color: "#FFFFFF", padding: "88px 24px 80px", textAlign: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8B1E2D", marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>FAQ</p>
          <h1 style={{ fontSize: "clamp(34px, 5.5vw, 58px)", fontWeight: 400, lineHeight: 1.1, marginBottom: 20 }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: 16, color: "rgba(252,251,248,0.6)", fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>How the MasseurMatch directory, provider listings, identity verification, subscriptions, privacy, and safety work.</p>
        </section>

        <section style={{ padding: "80px 24px", maxWidth: 820, margin: "0 auto" }}>
          {faqs.map((section) => (
            <div key={section.category} style={{ marginBottom: 72 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
                <div style={{ width: 32, height: 1, background: "#8B1E2D" }} />
                <h2 style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#8B1E2D", margin: 0 }}>{section.category}</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {section.items.map((item, i) => (
                  <details key={i} style={{ borderTop: "1px solid rgba(17,17,17,0.1)", padding: "24px 0" }}>
                    <summary style={{ fontSize: "clamp(15px, 2vw, 18px)", fontWeight: 400, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none", userSelect: "none" }}>
                      {item.q}<span style={{ fontSize: 20, color: "#8B1E2D", flexShrink: 0, marginLeft: 16 }}>+</span>
                    </summary>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "#374151", fontFamily: "system-ui, sans-serif", marginTop: 16, paddingRight: 40 }}>{item.a}</p>
                  </details>
                ))}
                <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)" }} />
              </div>
            </div>
          ))}
        </section>

        <section style={{ background: "#111111", color: "#FFFFFF", padding: "72px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400, marginBottom: 14 }}>Still have questions?</h2>
          <p style={{ fontSize: 15, opacity: 0.65, marginBottom: 32, fontFamily: "system-ui, sans-serif" }}>Our support team can help with platform questions.</p>
          <Link href="/contact" style={{ display: "inline-block", padding: "14px 36px", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", background: "#8B1E2D", color: "#FFFFFF", textDecoration: "none", fontWeight: 700 }}>Contact Us</Link>
        </section>
      </div>
    </>
  );
}
