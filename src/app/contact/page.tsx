import { JsonLd } from "@/app/_components/json-ld";
import { createPageMetadata } from "@/app/_lib/metadata";
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
  url: "https://masseurmatch.com/contact",
  description:
    "Contact MasseurMatch for client support, professional support, and general business inquiries.",
  mainEntity: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
    email: "hello@masseurmatch.com",
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
        email: "therapists@masseurmatch.com",
        availableLanguage: ["English", "Portuguese"],
      },
      {
        "@type": "ContactPoint",
        contactType: "general inquiries and partnerships",
        email: "hello@masseurmatch.com",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ContactPageClient />
    </>
  );
}
