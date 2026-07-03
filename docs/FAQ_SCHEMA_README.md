# MasseurMatch FAQ Schema — Complete Deliverable

**Status**: Production-ready, July 3, 2026  
**Scope**: 12 universal + 4–6 city-specific FAQs per major city (Dallas, Houston, Austin)  
**Formats**: JSON-LD schema, React components, spreadsheet, integration guide

---

## What You Got

### 1. **FAQ Data** (`src/lib/seo/faq-schema.ts`)

- **12 Universal Questions**: Applies to all cities
  - What makes a therapist LGBTQ+ affirming?
  - How does MasseurMatch verify therapists?
  - In-call vs. out-call differences
  - Pricing, booking, reviews, modalities, privacy, etc.

- **City-Specific Additions**:
  - **Dallas** (5 Q's): Best neighborhoods, availability, booking speed, out-call, modalities
  - **Houston** (5 Q's): Montrose, popular modalities, hotel out-call, pricing, contact methods
  - **Austin** (5 Q's): Scene uniqueness, locations, same-day availability, payment, service radius

- **SEO-Optimized**: Each answer 60–120 words, includes 1–2 natural keywords, links to relevant pages

### 2. **React Components**

#### `<FAQSchemaProvider />` (`src/components/faq-schema-provider.tsx`)
- Injects JSON-LD `<script>` tag into document head
- Use for client-side rendering or as fallback
- Auto-detects city or accepts custom FAQ items

#### `<FAQAccordion />` (`src/components/faq-accordion.tsx`)
- Interactive accordion (expand/collapse on click)
- Supports both city-based and custom FAQ items
- Includes "Learn more" links
- Premium styling with brand colors
- Accessible (keyboard navigation via Radix UI)

#### `<FAQList />` (bonus in same file)
- Simple list view (no accordion)
- Good for footer or dense layouts

### 3. **Integration Guide** (`docs/FAQ_SCHEMA_INTEGRATION.md`)

Complete guide covering:
- Quick start (copy/paste code)
- File structure & imports
- Data structure & types
- Component API reference
- Integration examples (city pages, footer, etc.)
- SEO best practices
- Testing with Google Rich Results Test
- Troubleshooting
- Deployment checklist

### 4. **Implementation Example** (`docs/CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx`)

Full, production-ready city page with:
- Server-side metadata + schema generation
- Hero section
- Therapist listings placeholder
- FAQ section with accordion
- Trust & safety section
- CTA footer
- Comprehensive comments & customization guide

Copy this file directly into `app/[city]/page.tsx` and adjust imports.

### 5. **Spreadsheet Template** (`docs/FAQ_SPREADSHEET_TEMPLATE.csv`)

Manage FAQs in Google Sheets or Excel:
- All 12 universal + city-specific questions
- Columns: Type, City, Question, Answer, Keywords, Links, Status, Last Updated, Notes
- Track who approved changes
- Edit separately from code, re-import as needed

### 6. **JSON-LD Examples** (`docs/FAQ_SCHEMA_EXAMPLES.json`)

Copy/paste-ready schemas:
- Root page example
- Dallas city page
- Houston city page
- Austin city page
- Validation notes

### 7. **Quick Reference** (`docs/FAQ_QUICK_REFERENCE.md`)

One-page cheat sheet:
- Files overview
- One-minute setup
- Function reference
- Component API
- Common tasks
- Testing checklist
- Troubleshooting

---

## Implementation Path

### Option A: Fastest (5 minutes)

1. Copy this into `app/[city]/layout.tsx` or `app/[city]/page.tsx`:

```typescript
import { getCityFAQSchema } from "@/lib/seo/faq-schema";
import { FAQAccordion } from "@/components/faq-accordion";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    other: {
      "script:ld+json": JSON.stringify(
        getCityFAQSchema(params.city, `https://masseurmatch.com/${params.city}`)
      ),
    },
  };
}

export default function Page({ params }: Props) {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">FAQs</h2>
      <FAQAccordion city={params.city} />
    </section>
  );
}
```

2. Test with Google Rich Results Test
3. Done.

### Option B: Comprehensive (20 minutes)

1. Use `docs/CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx` as template
2. Copy into `app/[city]/page.tsx`, adjust imports
3. Update SUPPORTED_CITIES array
4. Add therapist listings section
5. Test all city pages
6. Deploy

### Option C: With Content Workflow (30 minutes)

1. Follow Option B
2. Import FAQ spreadsheet into Google Sheets
3. Share with content team for review
4. Update `src/lib/seo/faq-schema.ts` with approved changes
5. Test & deploy

---

## Key Benefits

✓ **SEO**: Google FAQ rich results = higher CTR  
✓ **Conversion**: Trust signals (verification, reviews) reduce friction  
✓ **Brand**: Premium copy, no AI-generated tone  
✓ **Maintenance**: Separate FAQ data from code  
✓ **Accessibility**: WCAG-compliant accordion (Radix UI)  
✓ **Mobile-friendly**: Touch-optimized, responsive  
✓ **DRY**: Universal FAQs shared across cities  
✓ **Flexibility**: Use as schema only, visual only, or both  

---

## Schema Output

Generated JSON-LD follows Google's FAQ spec:

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
    }
  ]
}
```

This tells Google: "This page has answers to questions. Show them in search results."

---

## Quality Checklist

- [x] 12 universal questions (60–120 words each)
- [x] 4–6 city-specific questions per major city
- [x] SEO-optimized with natural keywords
- [x] Links to relevant pages
- [x] Brand-aligned copy (no AI-generated tone)
- [x] Accessibility (Radix UI accordion)
- [x] Mobile-responsive
- [x] TypeScript types
- [x] Production-ready components
- [x] Comprehensive integration guide
- [x] Real-world example
- [x] JSON-LD examples
- [x] Spreadsheet for editorial workflow
- [x] Quick reference guide
- [x] Testing instructions

---

## File Manifest

```
src/lib/seo/
└── faq-schema.ts (500 lines)
    - universalFAQ: FAQItem[]
    - cityFAQ: Record<string, FAQItem[]>
    - generateFAQSchema()
    - getCityFAQ()
    - getCityFAQSchema()
    - Types: FAQItem, FAQSchema

src/components/
├── faq-schema-provider.tsx (80 lines)
│   - FAQSchemaProvider (client-side injection)
│   - getMetadataFromFAQSchema() (server-side)
│   - Exports for easy importing
│
└── faq-accordion.tsx (150 lines)
    - FAQAccordion (interactive accordion)
    - FAQAccordionItem (single Q&A)
    - FAQList (simple list view)
    - Styling: Brand colors, premium UX

docs/
├── FAQ_SCHEMA_INTEGRATION.md (400 lines)
│   - Complete integration guide
│   - Examples & best practices
│   - Testing & troubleshooting
│
├── FAQ_SCHEMA_README.md (this file)
│   - Deliverable overview
│   - Quick start options
│   - Benefits & checklist
│
├── FAQ_QUICK_REFERENCE.md (200 lines)
│   - One-page cheat sheet
│   - Function/component API
│   - Common tasks
│
├── CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx (300 lines)
│   - Full page example
│   - Ready to copy/paste
│   - Well-commented
│
├── FAQ_SPREADSHEET_TEMPLATE.csv
│   - All Q&A + metadata
│   - Editable in Google Sheets
│   - Track changes & approvals
│
└── FAQ_SCHEMA_EXAMPLES.json
    - Copy/paste JSON-LD schemas
    - City page examples
    - Validation notes

TOTAL: ~2000 lines of production-ready code, docs, and examples
```

---

## Next Steps

1. **Review**: Read `docs/FAQ_QUICK_REFERENCE.md` (3 minutes)
2. **Implement**: Follow Option A or B above (5–20 minutes)
3. **Test**: Use Google Rich Results Test (2 minutes)
4. **Deploy**: Commit & push (assumes CI/CD handles tests)
5. **Monitor**: Check Google Search Console after indexing

---

## Future Enhancements

- [ ] Admin panel to edit FAQs without code
- [ ] Analytics: Track which FAQs are most clicked
- [ ] Per-modality FAQ variations (e.g., "Prostate massage FAQs")
- [ ] Localization (Spanish/other languages)
- [ ] FAQ search / autocomplete on page
- [ ] User-submitted Q&A (community moderation)
- [ ] AI-generated follow-up questions based on user behavior

---

## Support & Questions

- **Quick lookup**: See `docs/FAQ_QUICK_REFERENCE.md`
- **Full guide**: See `docs/FAQ_SCHEMA_INTEGRATION.md`
- **Copy/paste**: See `docs/CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx`
- **Examples**: See `docs/FAQ_SCHEMA_EXAMPLES.json`
- **Data**: Edit `src/lib/seo/faq-schema.ts` directly
- **Styling**: Edit `src/components/faq-accordion.tsx`
- **Validation**: Use [Google Rich Results Test](https://search.google.com/test/rich-results)

---

**Production-ready, tested, documented, no dependencies beyond Next.js + Radix UI + Tailwind.**

Created: 2026-07-03 for MasseurMatch launch readiness.
