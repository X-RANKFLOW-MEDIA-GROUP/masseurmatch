# Next Manual QA Checklist

Use this checklist after `npm run dev` or against a deployed preview. The current production build succeeds, so this checklist is focused on behavioral verification rather than build validation.

## Auth

- [ ] Visit `/login` while signed out.
 Expected: login form renders without crashing and the `redirect` query string is preserved after submit.
- [ ] Visit `/register` while signed out.
 Expected: registration form renders, uses auth context correctly, and redirects or updates UI after sign-up.
- [ ] Visit `/forgot-password`.
 Expected: forgot-password form renders and submits without router errors.
- [ ] Visit `/login?redirect=%2Fpro%2Fdashboard` and authenticate.
 Expected: user lands on `/pro/dashboard` after successful login.
- [ ] Refresh each auth page directly in the browser.
 Expected: no client-only hook or hydration errors.

## Pro

- [ ] Visit `/pro/join` while signed out.
 Expected: marketing or join page renders.
- [ ] Visit `/pro/dashboard` while signed out.
 Expected: client auth gate redirects to `/login?redirect=%2Fpro%2Fdashboard`.
- [ ] Visit `/pro/onboard` while signed in.
 Expected: verification and profile steps render inside the auth provider.
- [ ] Visit `/pro/billing` while signed in.
 Expected: billing page renders, subscription state loads, and the customer portal action calls the billing function.
- [ ] Visit `/pro/billing?portal=1` while signed in.
 Expected: portal auto-open flow triggers once and does not loop.

## Admin

- [ ] Visit `/admin` while signed out.
 Expected: page renders the admin entry point or prompts for admin authentication without build/runtime errors.
- [ ] Visit `/admin/users`, `/admin/therapists`, `/admin/reviews`, `/admin/blog`, `/admin/cities`, and `/admin/keywords`.
 Expected: each page loads through the App Router without missing provider, routing, or hydration failures.
- [ ] Exercise one write action per admin area in a safe environment.
 Expected: API route responds correctly and the UI reflects the update.

## City

- [ ] Visit a city page such as `/new-york`.
 Expected: city landing page renders and metadata is correct for the city.
- [ ] Visit a city segment page such as `/new-york/lgbtq-friendly`.
 Expected: segment page renders and uses resolved dynamic params correctly.
- [ ] Visit a city segment keyword page such as `/new-york/lgbtq-friendly/deep-tissue`.
 Expected: keyword page renders and metadata resolves without runtime param errors.
- [ ] Refresh each of the three URL shapes directly.
 Expected: no 404 from App Router param handling.

## Therapist

- [ ] Visit `/therapists`.
 Expected: listing page loads and search or filters render.
- [ ] Visit at least one generated therapist detail route under `/therapists/[slug]`.
 Expected: page renders profile content and client interactions work.
- [ ] Confirm therapist detail metadata and social preview tags for one therapist.
 Expected: metadata matches the selected therapist.

## Blog

- [ ] Visit `/blog`.
 Expected: blog index renders with post cards or links.
- [ ] Visit each generated post slug from the production build output.
 Examples: `/blog/how-to-choose-a-massage-therapist`, `/blog/incall-vs-outcall-guide`, `/blog/first-session-etiquette`
 Expected: post page renders and static params resolve correctly.
- [ ] Confirm blog metadata for one post.
 Expected: title, description, and canonical path match the slug.

## Regression Notes

- [ ] Confirm sitemap generation still succeeds in fallback mode when `SUPABASE_SERVICE_ROLE_KEY` is unavailable.
 Current behavior: sitemap generation logs an invalid key warning but still produces URLs.
- [ ] Confirm no route depends on the old `src/pages` directory location.
 Current behavior: legacy view components now live under `src/legacy-pages` so Next only builds the App Router tree.
- [ ] Review remaining ESLint warnings before release.
 Current warnings are limited to pre-existing `react-hooks/exhaustive-deps` cases in legacy components.
