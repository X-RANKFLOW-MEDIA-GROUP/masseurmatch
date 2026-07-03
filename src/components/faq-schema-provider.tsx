/**
 * FAQSchemaProvider: Injects FAQ JSON-LD schema into page head
 * Use this in Next.js layouts or pages to add structured data
 *
 * Usage in app/[city]/layout.tsx:
 *   <FAQSchemaProvider city="dallas" />
 *
 * Or for custom FAQ items:
 *   <FAQSchemaProvider faqItems={customItems} pageUrl={fullUrl} />
 */

import { useEffect } from "react";
import { type FAQItem, getCityFAQSchema, generateFAQSchema } from "@/lib/seo/faq-schema";

interface FAQSchemaProviderProps {
  city?: string;
  faqItems?: FAQItem[];
  pageUrl?: string;
}

/**
 * Inject FAQ schema into document head
 * Runs only on client, appends <script> tag with type="application/ld+json"
 */
export function FAQSchemaProvider({
  city,
  faqItems,
  pageUrl,
}: FAQSchemaProviderProps) {
  useEffect(() => {
    let schema;

    // Determine schema to inject
    if (faqItems && pageUrl) {
      schema = generateFAQSchema(faqItems, pageUrl);
    } else if (city && pageUrl) {
      schema = getCityFAQSchema(city, pageUrl);
    } else if (city && typeof window !== "undefined") {
      // Fallback: use current page URL
      schema = getCityFAQSchema(city, window.location.href);
    }

    if (!schema) return;

    // Create and inject script tag
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [city, faqItems, pageUrl]);

  return null;
}

/**
 * Server-side alternative: use this in generateMetadata()
 *
 * Example in app/[city]/layout.tsx:
 *
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const city = params.city as string;
 *   return {
 *     ...existingMetadata,
 *     other: {
 *       ...existingMetadata.other,
 *       ...getMetadataFromFAQSchema(city, fullPageUrl),
 *     },
 *   };
 * }
 */
export function getMetadataFromFAQSchema(city: string, pageUrl: string) {
  const schema = getCityFAQSchema(city, pageUrl);
  return {
    "script:ld+json": JSON.stringify(schema),
  };
}

/**
 * Raw FAQ items for displaying as accordion or list
 * Use this to render FAQs visually on the page
 *
 * Example:
 *   const items = getCityFAQ("dallas");
 *   return items.map(item => <FAQItem key={item.question} {...item} />);
 */
export { getCityFAQ, getCityFAQSchema } from "@/lib/seo/faq-schema";
export type { FAQItem } from "@/lib/seo/faq-schema";
