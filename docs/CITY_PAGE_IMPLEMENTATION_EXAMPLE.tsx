/**
 * Example: City Page Implementation with FAQ Schema
 *
 * Place this in: src/app/[city]/page.tsx
 * Adjust the path/imports to match your actual project structure
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityFAQSchema } from "@/lib/seo/faq-schema";
import { FAQSchemaProvider } from "@/components/faq-schema-provider";
import { FAQAccordion } from "@/components/faq-accordion";
import { SITE_URL } from "@/lib/site";
import { createPageMetadata } from "@/app/_lib/metadata";

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  params: {
    city: string;
  };
}

// List of supported cities
const SUPPORTED_CITIES = ["dallas", "houston", "austin"];

// ============================================================================
// METADATA (Server-side, static generation friendly)
// ============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.city.toLowerCase();

  // Return 404 for unsupported cities
  if (!SUPPORTED_CITIES.includes(city)) {
    return createPageMetadata({
      title: "City Not Found",
      description: "This city is not yet supported.",
      path: `/${city}`,
      robots: "noindex",
    });
  }

  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
  const pageUrl = `${SITE_URL}/${city}`;

  return {
    ...createPageMetadata({
      title: `Find verified LGBTQ+ massage therapists in ${cityTitle}`,
      description: `Browse ${cityTitle}'s top-rated, LGBTQ+-affirming male massage therapists. In-call & out-call available. Book online.`,
      path: `/${city}`,
    }),
    // JSON-LD FAQ schema for Google Rich Results
    other: {
      "script:ld+json": JSON.stringify(getCityFAQSchema(city, pageUrl)),
    },
  };
}

// Optional: Pre-generate static params for specific cities
// (Remove if using dynamic routing without static generation)
export function generateStaticParams() {
  return SUPPORTED_CITIES.map((city) => ({
    city: city.toLowerCase(),
  }));
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function CityPage({ params }: Props) {
  const city = params.city.toLowerCase();

  // Return 404 if city not supported
  if (!SUPPORTED_CITIES.includes(city)) {
    notFound();
  }

  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);

  return (
    <main className="min-h-screen">
      {/* Inject FAQ schema on client (fallback if generateMetadata fails) */}
      <FAQSchemaProvider city={city} />

      {/* ===== HERO SECTION ===== */}
      <section className="bg-gradient-to-br from-[#FFFFFF] to-[#F7F7F7] py-16 px-6 sm:py-20 sm:px-8 border-b border-[#E8E8E8]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#111111] mb-4">
            Premium Male Massage in {cityTitle}
          </h1>
          <p className="text-lg text-[#6F6F6F] leading-relaxed max-w-2xl">
            Verified, LGBTQ+-affirming massage therapists. In-call studios and
            out-call services available. Browse profiles, read reviews, and book
            with confidence.
          </p>
          <div className="flex gap-4 mt-8">
            <a
              href={`/search?city=${city}`}
              className={`inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E2D] text-white font-medium rounded-lg hover:bg-[#6E1521] transition-colors`}
            >
              Browse Therapists
            </a>
            <a
              href="#faq"
              className={`inline-flex items-center gap-2 px-6 py-3 border border-[#D9D9D9] text-[#111111] font-medium rounded-lg hover:bg-[#F7F7F7] transition-colors`}
            >
              Common Questions
            </a>
          </div>
        </div>
      </section>

      {/* ===== LISTINGS SECTION (Placeholder) ===== */}
      <section className="py-16 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#111111] mb-8">
            Featured Therapists in {cityTitle}
          </h2>
          {/* TODO: Add therapist listings component here */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Therapist cards would go here */}
            <div className="p-6 border border-[#E8E8E8] rounded-lg bg-[#FAFAFA]">
              <p className="text-[#8E8E8E]">Therapist cards loading...</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="faq" className="py-16 px-6 sm:px-8 bg-[#F7F7F7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#111111] mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6F6F6F] mb-8 text-lg">
            Everything you need to know about booking with MasseurMatch in{" "}
            {cityTitle}.
          </p>

          {/* FAQ Accordion Component
              - Automatically fetches universal + city-specific FAQs
              - Renders as interactive accordion
              - Includes "Learn more" links
          */}
          <FAQAccordion city={city} showLinks={true} />
        </div>
      </section>

      {/* ===== TRUST & SAFETY SECTION ===== */}
      <section className="py-16 px-6 sm:px-8 border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#111111] mb-8">
            Safety & Trust
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-[#111111] mb-2">
                Verified Profiles
              </h3>
              <p className="text-sm text-[#6F6F6F]">
                Every therapist is verified for authenticity and LGBTQ+
                affirmation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#111111] mb-2">
                Community Reviews
              </h3>
              <p className="text-sm text-[#6F6F6F]">
                Read honest feedback from verified bookings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#111111] mb-2">
                Direct Contact
              </h3>
              <p className="text-sm text-[#6F6F6F]">
                Communicate directly with therapists before booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FOOTER ===== */}
      <section className="py-12 px-6 sm:px-8 bg-[#111111] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to book?</h2>
          <p className="text-[#E8E8E8] mb-6">
            Browse verified therapists in {cityTitle}, compare rates, and read
            reviews.
          </p>
          <a
            href={`/search?city=${city}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#8B1E2D] text-white font-medium rounded-lg hover:bg-[#6E1521] transition-colors"
          >
            Browse Therapists
          </a>
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// NOTES FOR INTEGRATION
// ============================================================================

/*
WHAT THIS DOES:

1. Server-side Metadata:
   - Generates city-specific title & description
   - Injects FAQ JSON-LD schema via getCityFAQSchema()
   - JSON-LD is visible to Google's indexer (best for SEO)

2. Client-side Fallback:
   - FAQSchemaProvider wraps schema injection for CSR-only routes
   - Appends <script type="application/ld+json"> to <head>
   - Only needed if generateMetadata() can't run (edge cases)

3. Visual FAQs:
   - FAQAccordion renders interactive Q&A
   - Combines universal + city-specific questions
   - Shows "Learn more" links to relevant pages

4. Static Generation:
   - generateStaticParams() pre-builds pages for Dallas, Houston, Austin
   - Reduces build time for subsequent deploys
   - Remove if using fully dynamic routing

CUSTOMIZATION CHECKLIST:

  [ ] Update SUPPORTED_CITIES to match your city roster
  [ ] Adjust CityTitle capitalization if needed
  [ ] Replace TODO sections (therapist listings, etc.)
  [ ] Update link hrefs to match your routing
  [ ] Test with Google Rich Results Test
  [ ] Verify CSS classes match your Tailwind config
  [ ] Adjust section padding (py-16, px-6) to fit design

TESTING:

  1. Local: http://localhost:3000/dallas (should show FAQ section)
  2. DevTools: Inspect <head> for <script type="application/ld+json">
  3. Google: https://search.google.com/test/rich-results
     → Paste URL → should show "FAQ" in detected items
  4. Mobile: Verify accordion is keyboard accessible & touch-friendly

DEPLOYMENT:

  1. Update SUPPORTED_CITIES with your actual cities
  2. Test all city pages locally
  3. Deploy to staging
  4. Run Google Rich Results Test on each page
  5. Monitor GSC (Google Search Console) for FAQ impressions after indexing
*/
