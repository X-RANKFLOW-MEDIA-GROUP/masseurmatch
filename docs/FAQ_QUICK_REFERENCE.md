# FAQ Schema Quick Reference

**TL;DR**: Use `getCityFAQSchema()` to inject JSON-LD, `<FAQAccordion />` to render visually.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/seo/faq-schema.ts` | Universal FAQ data + city FAQs + schema generators |
| `src/components/faq-schema-provider.tsx` | Injects JSON-LD into `<head>` |
| `src/components/faq-accordion.tsx` | Interactive FAQ accordion component |
| `docs/FAQ_SCHEMA_INTEGRATION.md` | Full integration guide |
| `docs/FAQ_SPREADSHEET_TEMPLATE.csv` | Editable FAQ spreadsheet |
| `docs/FAQ_SCHEMA_EXAMPLES.json` | Copy-paste JSON-LD examples |
| `docs/CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx` | Complete page example |

---

## One-Minute Setup

### Step 1: Add to Page Metadata (Server-side)

```typescript
// app/[city]/page.tsx or app/layout.tsx
import { getCityFAQSchema } from "@/lib/seo/faq-schema";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    other: {
      "script:ld+json": JSON.stringify(
        getCityFAQSchema("dallas", "https://masseurmatch.com/dallas")
      ),
    },
  };
}
```

### Step 2: Render Visually (Client-side)

```tsx
import { FAQAccordion } from "@/components/faq-accordion";

export default function Page() {
  return <FAQAccordion city="dallas" />;
}
```

**Done.** Schema is injected, FAQs render as accordion, Google can read it.

---

## Key Functions

### `getCityFAQSchema(city: string, pageUrl: string)`

Returns JSON-LD schema for a city. Use in `generateMetadata()`.

```typescript
const schema = getCityFAQSchema("houston", "https://example.com/houston");
// Returns: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [...] }
```

### `getCityFAQ(city: string)`

Returns all FAQ items (universal + city-specific) as an array.

```typescript
const items = getCityFAQ("austin");
// Returns: 12 universal + 5 Austin-specific questions
```

### `generateFAQSchema(items: FAQItem[], pageUrl: string)`

Generate JSON-LD from custom FAQ items.

```typescript
const customSchema = generateFAQSchema([
  { question: "Q?", answer: "A." }
], "https://example.com");
```

---

## Components

### `<FAQAccordion city="dallas" />`

Renders interactive accordion. Opens/closes questions on click.

**Props**:
- `city?: string` — Auto-fetch FAQ for city
- `items?: FAQItem[]` — Custom FAQ items
- `showLinks?: boolean` — Show "Learn more" links (default: true)

### `<FAQSchemaProvider city="dallas" />`

Injects `<script type="application/ld+json">` into `<head>`. Fallback if you can't use `generateMetadata()`.

---

## Data

### Universal Questions (12)

```typescript
import { universalFAQ } from "@/lib/seo/faq-schema";
// [
//   { question: "What makes a massage therapist LGBTQ+ affirming?", ... },
//   { question: "How does MasseurMatch verify therapists?", ... },
//   ... 10 more
// ]
```

### City Questions

```typescript
import { cityFAQ } from "@/lib/seo/faq-schema";
// {
//   dallas: [{ question: "...", ... }, ...],
//   houston: [...],
//   austin: [...]
// }
```

---

## Common Tasks

### Add a New Universal Question

Edit `src/lib/seo/faq-schema.ts`:

```typescript
export const universalFAQ: FAQItem[] = [
  // ... existing
  {
    question: "New question?",
    answer: "60–120 words with 1–2 keywords naturally...",
    keywords: ["keyword1", "keyword2"],
    linkText: "Learn more",
    linkHref: "/page",
  },
];
```

### Add City-Specific Question

```typescript
export const cityFAQ: Record<string, FAQItem[]> = {
  dallas: [
    // ... existing
    {
      question: "New Dallas question?",
      answer: "Answer...",
      keywords: ["Dallas-keyword"],
      linkText: "Link text",
      linkHref: "/link",
    },
  ],
};
```

### Use Custom FAQ on a Page

```tsx
import { FAQAccordion } from "@/components/faq-accordion";

const customFAQ = [
  { question: "Q1?", answer: "A1..." },
  { question: "Q2?", answer: "A2..." },
];

export default function Page() {
  return <FAQAccordion items={customFAQ} />;
}
```

### Extract FAQ for Spreadsheet

All data is in `FAQ_SPREADSHEET_TEMPLATE.csv`. Open in Google Sheets, edit, export, copy changes back to TypeScript.

---

## Testing

### Verify Schema

1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Paste your page URL
3. Should see "FAQ" in detected rich results
4. Check for any warnings

### Local Testing

```bash
# View page HTML
curl http://localhost:3000/dallas | grep FAQPage

# Or in browser DevTools
# → Right-click → View Page Source
# → Ctrl+F "FAQPage" → should find JSON-LD block
```

### Mobile Testing

Open page on mobile, tap FAQ questions—accordion should open/close smoothly.

---

## Styling

All components use MasseurMatch brand colors:

- Text: `#111111` (primary), `#6F6F6F` (secondary)
- Accent: `#8B1E2D` (red)
- Hover: `#6E1521` (darker red)
- Borders: `#E8E8E8` (subtle), `#D9D9D9` (strong)
- Surfaces: `#FFFFFF` (base), `#F7F7F7` (soft), `#FAFAFA` (card)

Customize by editing `src/components/faq-accordion.tsx`.

---

## SEO Tips

1. **Questions**: Keep natural, conversational (not keyword-stuffed).
2. **Answers**: 60–120 words optimal for snippet display.
3. **Keywords**: 1–2 per answer, naturally integrated.
4. **Links**: Point to relevant pages (e.g., `/verification-standards`).
5. **Updates**: Refresh quarterly based on user intent.
6. **Visibility**: Always pair JSON-LD with visible FAQs on page.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Schema not showing in Google Rich Results | Validate JSON at [jsonlint.com](https://jsonlint.com), re-test |
| Accordion not opening | Verify `@radix-ui/react-accordion` is installed (`npm ls`) |
| City FAQ empty | Check city slug matches key in `cityFAQ` (e.g., "dallas" not "Dallas") |
| Links not working | Verify `linkHref` paths exist in your app |
| Styling looks wrong | Check Tailwind config, ensure CSS is imported |

---

## Next Steps

- [ ] Integrate into `app/[city]/layout.tsx` or `app/[city]/page.tsx`
- [ ] Test with Google Rich Results Test
- [ ] Review FAQ copy for brand voice
- [ ] Deploy to staging, then production
- [ ] Monitor Google Search Console for FAQ impressions
- [ ] Update FAQs quarterly based on user questions

---

## Files Reference

- **Data**: `src/lib/seo/faq-schema.ts`
- **Components**: `src/components/faq-*.tsx`
- **Integration Guide**: `docs/FAQ_SCHEMA_INTEGRATION.md`
- **Examples**: `docs/CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx`
- **Spreadsheet**: `docs/FAQ_SPREADSHEET_TEMPLATE.csv`
- **JSON Examples**: `docs/FAQ_SCHEMA_EXAMPLES.json`

---

**Questions?** See `docs/FAQ_SCHEMA_INTEGRATION.md` for full guide.
