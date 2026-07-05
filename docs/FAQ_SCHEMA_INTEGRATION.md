# FAQ Schema Integration Guide

**Status**: Production-ready  
**Created**: 2026-07-03  
**Files**:
- `src/lib/seo/faq-schema.ts` — Data + schema generation
- `src/components/faq-schema-provider.tsx` — JSON-LD injection
- `src/components/faq-accordion.tsx` — Visual component

---

## Overview

MasseurMatch includes:
- **12 universal FAQ items** (applicable to all cities)
- **4–6 city-specific questions** per major city (Dallas, Houston, Austin)
- **JSON-LD schema** for Google Rich Results (FAQ snippets)
- **React components** for rendering FAQs visually
- **TypeScript types** for strict data management

All FAQs are 60–120 words, SEO-optimized with natural keyword integration.

---

## Quick Start

### 1. Add FAQ Schema to City Page

In `app/[city]/layout.tsx` or `app/[city]/page.tsx`:

```tsx
import { FAQSchemaProvider } from "@/components/faq-schema-provider";
import { FAQAccordion } from "@/components/faq-accordion";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.city as string;
  const baseUrl = SITE_URL;

  return {
    ...existingMetadata,
    other: {
      ...existingMetadata.other,
      // JSON-LD schema
      "script:ld+json": JSON.stringify(
        getCityFAQSchema(city, `${baseUrl}/${city}`)
      ),
    },
  };
}

export default function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string };
}) {
  return (
    <>
      {/* Injects schema into <head> on client (fallback for CSR) */}
      <FAQSchemaProvider city={params.city} />

      {children}

      {/* Visual FAQ accordion */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
        <FAQAccordion city={params.city} />
      </section>
    </>
  );
}
```

### 2. Add to Root Layout (All Pages)

In `src/app/layout.tsx`, add schema for homepage:

```tsx
import { generateFAQSchema } from "@/lib/seo/faq-schema";

export const metadata: Metadata = {
  // ... existing metadata
  other: {
    "script:ld+json": JSON.stringify(
      generateFAQSchema(universalFAQ, SITE_URL)
    ),
  },
};
```

### 3. Use Custom FAQ Set

For a custom page with select questions:

```tsx
import { generateFAQSchema } from "@/lib/seo/faq-schema";

const customFAQ = [
  {
    question: "How do I sign up?",
    answer: "Click the Sign Up button...",
  },
  // ... more items
];

export const metadata: Metadata = {
  other: {
    "script:ld+json": JSON.stringify(
      generateFAQSchema(customFAQ, "https://masseurmatch.com/signup")
    ),
  },
};
```

---

## File Structure

```
src/
├── lib/seo/
│   └── faq-schema.ts               # Data + schema generators
├── components/
│   ├── faq-schema-provider.tsx     # JSON-LD injection
│   └── faq-accordion.tsx           # Visual component
└── app/
    ├── layout.tsx                  # Add to root
    └── [city]/
        └── layout.tsx              # Add per-city
```

---

## Data Structure

### FAQItem Type

```typescript
type FAQItem = {
  question: string;
  answer: string;               // 60–120 words, SEO-optimized
  keywords?: string[];          // For tracking intent
  linkText?: string;            // Optional: "Learn more"
  linkHref?: string;            // Optional: "/about-verification"
};
```

### Accessing Data

```typescript
import {
  universalFAQ,        // 12 universal questions
  cityFAQ,             // { dallas: [...], houston: [...], austin: [...] }
  getCityFAQ,          // Get universal + city-specific
  getCityFAQSchema,    // Get JSON-LD schema for city
  generateFAQSchema,   // Generate JSON-LD from items
} from "@/lib/seo/faq-schema";

// Get all FAQ items for a city
const allItems = getCityFAQ("dallas");

// Get only universal
const universal = universalFAQ;

// Get only city-specific
const citySpecific = cityFAQ["houston"];
```

---

## Component API

### FAQSchemaProvider

Injects JSON-LD schema into `<head>`. Best for client-side rendering fallback.

```tsx
// Auto-detect from city
<FAQSchemaProvider city="dallas" />

// Or provide custom items
<FAQSchemaProvider
  faqItems={customItems}
  pageUrl="https://masseurmatch.com/dallas"
/>
```

**Props**:
- `city?: string` — City slug (e.g., "dallas"). Fetches from `cityFAQ[city]` + universal.
- `faqItems?: FAQItem[]` — Custom FAQ items.
- `pageUrl?: string` — Full page URL for `@id`. Falls back to `window.location.href`.

### FAQAccordion

Renders FAQs as interactive accordion with proper styling.

```tsx
// From city
<FAQAccordion city="austin" />

// From custom items
<FAQAccordion items={customItems} showLinks={true} />
```

**Props**:
- `city?: string` — Auto-fetch FAQ for city.
- `items?: FAQItem[]` — Custom items.
- `showLinks?: boolean` — Show "Learn more" links (default: true).
- `className?: string` — Additional CSS classes.

### FAQList

Simple list (no accordion) for dense layouts or footer.

```tsx
<FAQList city="houston" />
```

---

## Schema Output

Generated JSON-LD follows Google's FAQ schema spec:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What makes a massage therapist LGBTQ+ affirming?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LGBTQ+ affirming therapists actively welcome..."
      }
    },
    ...
  ]
}
```

**Google Rich Results**: FAQ schemas enable Google to show answers directly in search results, improving CTR and visibility.

---

## Editing & Maintaining FAQs

### Add a New Universal Question

Edit `src/lib/seo/faq-schema.ts`:

```typescript
export const universalFAQ: FAQItem[] = [
  // ... existing items
  {
    question: "New question here?",
    answer: "60–120 words. Include 1–2 keywords naturally...",
    keywords: ["keyword1", "keyword2"],
    linkText: "Learn more",
    linkHref: "/page",
  },
];
```

### Add City-Specific Questions

```typescript
export const cityFAQ: Record<string, FAQItem[]> = {
  dallas: [
    // ... existing
    {
      question: "New Dallas question?",
      answer: "Answer here...",
      keywords: ["Dallas-specific keyword"],
    },
  ],
  // ... other cities
};
```

### Track Changes

If using a spreadsheet for editorial review:
1. Export to CSV/Google Sheets (see `/docs/FAQ_SPREADSHEET_TEMPLATE.csv`)
2. Share with content team for review
3. Update `faq-schema.ts` with approved changes
4. Commit with message: `chore: update FAQ schema for [city/feature]`

---

## Integration Examples

### Example 1: City Page with FAQ Section

**File**: `src/app/[city]/page.tsx`

```tsx
import { generateMetadata } from "next";
import { getCityFAQSchema } from "@/lib/seo/faq-schema";
import { FAQSchemaProvider } from "@/components/faq-schema-provider";
import { FAQAccordion } from "@/components/faq-accordion";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.city as string;

  return {
    title: `Find LGBTQ+ massage therapists in ${city}`,
    description: `Verified, LGBTQ+-affirming massage therapists in ${city}...`,
    other: {
      "script:ld+json": JSON.stringify(
        getCityFAQSchema(city, `${SITE_URL}/${city}`)
      ),
    },
  };
}

export default function CityPage({ params }: Props) {
  return (
    <main>
      <FAQSchemaProvider city={params.city} />

      {/* Hero, listings, etc. */}

      <section className="py-16 bg-[#F7F7F7]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2">
            Common Questions About Massage in {params.city}
          </h2>
          <p className="text-[#6F6F6F] mb-8">
            Everything you need to know to book with confidence.
          </p>
          <FAQAccordion city={params.city} />
        </div>
      </section>
    </main>
  );
}
```

### Example 2: Footer with Minimal FAQ

**File**: `src/components/site-footer.tsx`

```tsx
import { FAQList } from "@/components/faq-accordion";

export function SiteFooter() {
  return (
    <footer className="bg-[#111111] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        {/* ... other footer sections ... */}

        <div>
          <h3 className="text-lg font-bold mb-6">Quick Questions</h3>
          <FAQList universalFAQ={universalFAQ.slice(0, 5)} />
        </div>
      </div>
    </footer>
  );
}
```

### Example 3: Server-Side Metadata Only

If you only want JSON-LD (no visual component):

```tsx
import { getCityFAQSchema } from "@/lib/seo/faq-schema";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.city as string;

  return {
    ...existingMetadata,
    other: {
      ...existingMetadata.other,
      "script:ld+json": JSON.stringify(
        getCityFAQSchema(city, `${SITE_URL}/${city}`)
      ),
    },
  };
}
```

---

## SEO Best Practices

1. **Schema + Visual**: Always pair JSON-LD with visible FAQs on the page. Google prefers this.
2. **Question Phrasing**: Keep questions natural and conversational (not keyword-stuffed).
3. **Answer Length**: 60–120 words optimal for snippet display.
4. **Keywords**: 1–2 relevant keywords per answer, integrated naturally.
5. **Links**: Link to relevant pages (e.g., "Learn more about verification").
6. **Updates**: Refresh FAQs quarterly based on user questions.

---

## Testing

### Validate Schema

1. Go to [Google's Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your page URL
3. Verify "FAQ" appears in detected items
4. Check for any warnings

### Local Testing

```bash
# Inspect page HTML
curl https://localhost:3000/austin | grep -i "faqpage"

# Or in browser DevTools
# → Right-click → View Page Source → Search "FAQPage"
```

---

## Troubleshooting

### Schema Not Appearing

1. Verify JSON-LD is valid: use [jsonlint.com](https://jsonlint.com)
2. Check schema is in `<head>` (DevTools → Elements → head)
3. Ensure `@context` and `@type` are correct
4. Re-validate with Google Rich Results Test

### Accordion Not Showing

1. Verify `radix-ui/react-accordion` is installed: `npm ls @radix-ui/react-accordion`
2. Check import paths match your project structure
3. Ensure Tailwind/CSS is loading (check `.css` imports)

### City FAQ Empty

1. Check city slug matches key in `cityFAQ` object (e.g., "dallas" not "Dallas")
2. Verify `getCityFAQ()` is called correctly
3. Fallback shows `universalFAQ` if city not found

---

## Deployment Checklist

- [ ] Added `FAQSchemaProvider` to root layout or city layouts
- [ ] Added JSON-LD schema to `generateMetadata()`
- [ ] Tested schema with Google Rich Results Test
- [ ] Reviewed FAQ answers for typos and SEO optimization
- [ ] Validated component styling (accordion opens/closes smoothly)
- [ ] Tested on mobile (accordion usable on small screens)
- [ ] Updated spreadsheet (if using external editorial workflow)

---

## Future Enhancements

- [ ] Admin panel to edit FAQs without code
- [ ] Analytics tracking (which FAQs are clicked most)
- [ ] Per-modality FAQ variations (e.g., "Prostate massage FAQs")
- [ ] Localization (Spanish/other languages)
- [ ] FAQ search / autocomplete
- [ ] User-submitted Q&A (moderated)

---

## Support

For questions or updates:
- Check existing FAQs in `src/lib/seo/faq-schema.ts`
- Review this guide for examples
- Test with Google Rich Results Test before deploying
