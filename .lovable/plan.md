

## SEO URL Restructuring Plan

Currently the app uses `/city/:slug` for city pages and `/therapist/:id` for profiles. The goal is to restructure to flat, SEO-optimized URLs.

### New Route Structure

```text
/:city                        → City landing page (e.g. /dallas)
/:city/massage-therapists     → Listing page with filters (e.g. /dallas/massage-therapists)
/:city/therapist/:slug        → Profile page (e.g. /dallas/therapist/john-doe)
```

### Changes Required

**1. Database: Add `slug` column to `profiles`**
- Add unique `slug` text column to `profiles` table
- Create a database function to auto-generate slugs from `display_name` on insert/update (lowercase, hyphenated, unique with suffix if needed)
- Backfill existing profiles with generated slugs

**2. New Page: `CityListing.tsx`**
- New page for `/:city/massage-therapists` route
- Fetches profiles filtered by city matching the URL slug
- SEO-optimized with structured data (LocalBusiness list), breadcrumbs, meta tags
- Links each therapist card to `/:city/therapist/:slug`

**3. Update `City.tsx`**
- Change route from `/city/:slug` to `/:city`
- Update internal links to point to `/:city/massage-therapists` for the listing CTA
- Update therapist card links to `/:city/therapist/:slug`

**4. Update `TherapistProfile.tsx`**
- Accept both `:city` and `:slug` params instead of `:id`
- Fetch profile by `slug` column instead of `id`
- Use city param for breadcrumbs and canonical URL
- Update JSON-LD structured data with city context

**5. Update `App.tsx` Routes**
- Remove `/city/:slug` and `/therapist/:id`
- Add `/:city` (City page), `/:city/massage-therapists` (CityListing), `/:city/therapist/:slug` (TherapistProfile)
- Place these AFTER all static routes to avoid conflicts (e.g. `/pricing`, `/about`)

**6. Update Internal Links Across the App**
- Homepage featured therapists, explore page, city links in footer — all updated to new URL format
- Helper function: `buildProfileUrl(city, slug)` → `/${citySlug}/therapist/${slug}`

**7. Update Sitemap Edge Function**
- Generate URLs in new format: `/:city`, `/:city/massage-therapists`, `/:city/therapist/:slug`
- Remove old `/city/:slug` and `/therapist/:id` patterns

**8. Update `robots.txt`**
- Sitemap URL stays the same (edge function)
- No new disallow rules needed (public pages)

**9. Update `render-meta` Edge Function**
- Parse new URL patterns for crawler meta tag injection

### Route Conflict Prevention

Static routes (`/pricing`, `/about`, `/auth`, etc.) are registered first. The `/:city` catch-all goes last, just before the `*` 404 route. The City page component validates the slug against known cities and shows 404 if invalid.

