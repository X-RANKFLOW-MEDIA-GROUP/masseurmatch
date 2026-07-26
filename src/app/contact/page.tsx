import { JsonLd } from "@/app/_components/json-ld";
import { createPageMetadata } from "@/app/_lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata = createPageMetadata({
  title: "Contact Us",
  description:
    "Connect with MasseurMatch for client support, provider growth questions, and partnership inquiries through a premium, streamlined contact experience.",
  path: "/contact",
  keywords: [
    "contact masseurmatch",
    "client support",
    "provider support",
    "partnership inquiries",
  ],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact MasseurMatch",
  url: "https://www.masseurmatch.com/contact",
  description:
    "Contact MasseurMatch for client support, professional support, and general business inquiries.",
  mainEntity: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://www.masseurmatch.com",
    email: "support@masseurmatch.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dallas",
      addressRegion: "TX",
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "client support",
        email: "support@masseurmatch.com",
        availableLanguage: ["English", "Portuguese"],
      },
      {
        "@type": "ContactPoint",
        contactType: "professional support",
        email: "support@masseurmatch.com",
        availableLanguage: ["English", "Portuguese"],
      },
      {
        "@type": "ContactPoint",
        contactType: "general inquiries and partnerships",
        email: "support@masseurmatch.com",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="page-shell pt-10 sm:pt-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-background p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">MasseurMatch support</p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Contact the MasseurMatch team</h1>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Use this page for questions about public profiles, account access, directory policies, billing,
              partnerships, safety reports, or general platform support. Include the relevant profile or page URL
              whenever possible so the team can review the correct record without unnecessary delays.
            </p>
            <p>
              MasseurMatch is a discovery directory and does not manage appointments between clients and
              independent providers. Questions about session availability, location, rates, boundaries, or payment
              should be confirmed directly with the provider through the contact information shown on the profile.
            </p>
            <p>
              For urgent safety concerns, use the reporting information available on the profile and review the
              Trust and Safety resources. For account, subscription, or listing questions, provide the email address
              associated with the account but never send passwords, full payment-card details, or government ID
              documents through the general contact form.
            </p>
          </div>
        </div>
      </section>
      <ContactPageClient />
    </>
  );
}
