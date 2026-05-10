# MasseurMatch Routes Inventory

This document records the public, signup, pro, and SEO route surface confirmed from the Next.js App Router files in `src/app`.

Last updated: 2026-05-09
Branch created from: `main`

## Public Core Routes

| Route | Source file | Purpose | Indexing note |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Public homepage and directory entry point | Indexable |
| `/search` | `src/app/search/page.tsx` | Public directory search | Filtered states are noindexed |
| `/therapists` | `src/app/therapists/page.tsx` | Public therapist listing index | Filtered and paginated states are noindexed |
| `/therapists/[slug]` | `src/app/therapists/[slug]/page.tsx` | Public therapist profile | Missing profiles are noindexed |
| `/for-therapists` | `src/app/for-therapists/page.tsx` | Therapist acquisition landing page | Indexable |
| `/pricing` | `src/app/pricing/page.tsx` | Plans and add ons | Indexable |
| `/contact` | `src/app/contact/page.tsx` | Support and business contact page | Indexable |
| `/safety` | `src/app/safety/page.tsx` | Trust and safety guidance | Indexable |
| `/terms` | `src/app/terms/page.tsx` | Terms of Service | Indexable |
| `/login` | `src/app/login/page.tsx` | Account login | Noindex |

## Editorial Routes

| Route | Source file | Purpose |
|---|---|---|
| `/blog` | `src/app/blog/page.tsx` | Blog hub |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | Individual blog article generated from `getBlogSlugs()` |

## Competitor Comparison Routes

| Route | Source file | Purpose |
|---|---|---|
| `/compare` | `src/app/compare/page.tsx` | Competitor comparison hub |
| `/compare/[slug]` | `src/app/compare/[slug]/page.tsx` | Static comparison page generated from `competitorSlugs` |

## Signup Flow Routes

| Route | Source file | Purpose |
|---|---|---|
| `/signup` | `src/app/signup/page.tsx` | Signup entry page |
| `/signup/plan` | `src/app/signup/plan/page.tsx` | Plan selection |
| `/signup/account` | `src/app/signup/account/page.tsx` | Account creation |
| `/signup/verify` | `src/app/signup/verify/page.tsx` | Email and identity verification |
| `/signup/profile` | `src/app/signup/profile/page.tsx` | Profile creation |
| `/signup/review` | `src/app/signup/review/page.tsx` | Final submission review |
| `/signup/pending` | `src/app/signup/pending/page.tsx` | Pending approval confirmation |

## Pro Dashboard Routes

| Route | Source file | Purpose |
|---|---|---|
| `/pro/dashboard` | `src/app/pro/dashboard/page.tsx` | Pro account dashboard |
| `/pro/listing` | `src/app/pro/listing/page.tsx` | Listing editor and moderation handoff |
| `/pro/photos` | `src/app/pro/photos/page.tsx` | Photo upload and moderation queue |
| `/pro/inquiries` | `src/app/pro/inquiries/page.tsx` | Client inquiry manager |
| `/pro/subscription` | `src/app/pro/subscription/page.tsx` | Subscription plan management entry |
| `/pro/settings` | `src/app/pro/settings/page.tsx` | Account, security, and notification settings |

## Dynamic SEO Templates

| Route template | Source file | Generation source |
|---|---|---|
| `/[city]` | `src/app/[city]/page.tsx` | `getCities()` |
| `/[city]/[segment]` | `src/app/[city]/[segment]/page.tsx` | `getLaunchSegmentPaths()` and `isLaunchUrl()` |
| `/[city]/[segment]/[keyword]` | `src/app/[city]/[segment]/[keyword]/page.tsx` | `getLaunchKeywordPaths()` and `isLaunchUrl()` |
| `/[city]/areas/[area]` | `src/app/[city]/areas/[area]/page.tsx` | `getLaunchAreaPaths()` and `isLaunchUrl()` |

## Launch URL Inventory

The following URL list is sourced from `src/app/_lib/launch-urls.ts` and represents the currently hardcoded SEO route set allowed by `isLaunchUrl()`.

```txt
/dallas
/dallas/verified-profiles
/dallas/lgbtq-friendly
/dallas/male-therapists
/dallas/wellness
/dallas/wellness/deep-tissue
/dallas/wellness/outcall
/dallas/wellness/incall
/dallas/wellness/swedish
/dallas/wellness/sports-recovery
/dallas/wellness/mobile-massage
/dallas/wellness/hotel-massage
/dallas/areas/oak-lawn
/dallas/areas/turtle-creek
/dallas/areas/uptown
/dallas/areas/deep-ellum
/dallas/areas/medical-district
/dallas/areas/love-field
/dallas/areas/dfw-airport
/dallas/areas/highland-park
/dallas/areas/university-park
/dallas/areas/downtown
/dallas/areas/design-district
/plano
/plano/lgbtq-friendly
/plano/male-therapists
/plano/wellness/deep-tissue
/plano/wellness/outcall
/irving
/irving/lgbtq-friendly
/irving/male-therapists
/irving/wellness/outcall
/highland-park
/houston
/houston/verified-profiles
/houston/wellness
/houston/wellness/outcall
/houston/wellness/incall
/houston/wellness/swedish
/houston/wellness/thai
/houston/areas/montrose
/houston/areas/the-heights
/houston/areas/midtown
/houston/areas/downtown-houston
/austin
/austin/verified-profiles
/austin/wellness
/austin/wellness/deep-tissue
/austin/wellness/outcall
/austin/wellness/incall
/austin/areas/south-congress
/austin/areas/east-austin
/miami
/miami/verified-profiles
/miami/wellness
/miami/wellness/outcall
/miami/wellness/swedish
/miami/wellness/hotel-massage
/miami/areas/brickell
/chicago
/chicago/verified-profiles
/chicago/wellness
/chicago/wellness/deep-tissue
/chicago/wellness/outcall
/chicago/wellness/incall
/chicago/wellness/sports-recovery
/chicago/areas/river-north
/dallas/gay-massage
/houston/gay-massage
/austin/gay-massage
/miami/gay-massage
/chicago/gay-massage
/los-angeles/gay-massage
/new-york/gay-massage
/san-francisco/gay-massage
/atlanta/gay-massage
/denver/gay-massage
/seattle/gay-massage
/portland/gay-massage
/fort-lauderdale/gay-massage
/west-hollywood/gay-massage
/palm-springs/gay-massage
/provincetown/gay-massage
/key-west/gay-massage
/fire-island/gay-massage
/san-diego/gay-massage
/phoenix/gay-massage
/las-vegas/gay-massage
/nashville/gay-massage
/new-orleans/gay-massage
/philadelphia/gay-massage
/minneapolis/gay-massage
/washington-dc/gay-massage
/san-antonio/areas/king-william
```

## Maintenance Notes

1. Keep this file updated when adding, removing, or renaming `page.tsx` files.
2. Keep `src/app/_lib/launch-urls.ts` and this inventory in sync when changing SEO launch pages.
3. The root app font loading is handled in `src/app/layout.tsx` through `next/font/google`; do not add page level custom font `<link>` tags.
4. Private account routes such as `/login` and pro dashboard pages should remain noindex or authentication protected.
