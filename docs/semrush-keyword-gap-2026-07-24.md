# Semrush Keyword Gap — Execution Priorities

Source: Semrush Keyword Gap export, United States desktop database, July 24, 2026.

## Competitive baseline

- MasseurMatch ranking keywords: approximately 80
- MasseurFinder ranking keywords: approximately 6,800
- RentMasseur ranking keywords: approximately 2,600
- Shared keywords: 31
- Missing keywords: approximately 1,600
- Weak keywords: 16
- Untapped keywords: approximately 7,600

The immediate opportunity is not to create thousands of thin pages. The priority is to improve URLs that already have inventory, rankings, and low-difficulty commercial queries.

## Priority 0: Dallas quick wins

The Semrush export shows MasseurMatch already ranking outside page one for several low-difficulty Dallas terms. These should be consolidated into the canonical Dallas cluster rather than split into near-duplicate pages.

| Keyword | Volume | KD | Observed MasseurMatch position |
| --- | ---: | ---: | ---: |
| male massage dallas | 480 | 5 | 32 |
| dallas male massage | 320 | 7 | 22 |
| massage dallas gay | 210 | 13 | 33 |
| male massage dallas tx | 170 | 6 | 26 |
| dallas masseur finder | 110 | 13 | 26 |
| m4m massage dallas | 110 | 4 | 43 |
| male massage dallas texas | 110 | 5 | 29 |
| massage m4m dallas | 90 | 11 | 32 |
| dallas gay male massage | 70 | 16 | 21 |
| masseur finder dallas | 70 | 9 | 36 |
| dallas massage m4m | 50 | 0 | 25 |

### Required implementation

- Keep `/{city}` as the canonical city landing page.
- Use the Dallas page to naturally cover `male massage dallas`, `dallas male massage`, and `massage dallas gay` intent.
- Keep service, audience, and neighborhood pages indexable only when their exact filtered query returns public inventory.
- Add contextual internal links from Dallas profiles, guides, state pages, and relevant service pages back to `/dallas`.
- Avoid creating typo-targeted pages or doorway URLs for variants such as `massuer` or `messuer`.

## Priority 1: Houston and Austin

After Dallas is strengthened, publish or improve Houston and Austin only when each city has real public profile inventory. Use the existing inventory qualification and noindex safeguards.

Recommended clusters:

- Houston: city page, LGBTQ-friendly, verified profiles, male therapists, outcall, incall, deep tissue, and supported neighborhoods.
- Austin: city page, LGBTQ-friendly, verified profiles, male therapists, outcall, incall, deep tissue, and supported neighborhoods.

## Priority 2: Fort Worth and San Antonio

Publish after Dallas, Houston, and Austin have sufficient inventory and internal links. Do not index empty city/service combinations.

## Technical requirements already represented in the repository

The current repository already contains several important controls:

- Dynamic Next.js sitemap generation.
- Inventory-gated city inclusion.
- Exact-query checks before service and neighborhood URLs enter the sitemap.
- Canonical path normalization.
- Profile slug safety filtering.
- Sitemap exclusion for intentionally noindexed routes.

These controls must remain in place during expansion.

## Work that cannot be completed only in code

The following are required to rank but depend on production access, content operations, or external authority:

1. Verify the canonical domain property in Google Search Console.
2. Submit and monitor `/sitemap.xml`.
3. Inspect priority URLs and resolve discovered/crawled-not-indexed exclusions.
4. Confirm production redirects enforce one host and protocol.
5. Acquire legitimate backlinks and brand mentions.
6. Increase real provider inventory in target cities.
7. Improve provider profile completeness, image quality, and update frequency.
8. Track non-brand impressions, clicks, indexation, CTA clicks, and city-level conversions.
9. Validate Core Web Vitals using production field data.
10. Maintain editorial review so local copy is unique and factual.

## Release sequence

### Sprint A

- Dallas metadata and visible copy audit.
- Dallas internal-link audit.
- Dallas structured-data validation.
- Production canonical and redirect verification.

### Sprint B

- Houston and Austin inventory check.
- Publish only qualifying routes.
- Add links from homepage, state hubs, guides, and profiles.

### Sprint C

- Fort Worth and San Antonio rollout.
- Expand supported neighborhoods and service combinations based on Search Console demand.

## Success measures

- Priority Dallas queries move into the top 10.
- Growth in non-brand impressions and clicks.
- Increase in valid indexed city and intent pages without growth in soft 404s or duplicate pages.
- Higher profile-detail and contact CTA click-through rates from organic landing pages.
