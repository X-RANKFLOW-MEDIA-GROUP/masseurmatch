# MasseurMatch Go Live Checklist

This checklist defines the minimum release gates required before sending MasseurMatch to production.

## 1. Repository gates

Run these commands from the repository root:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:sitemap
pnpm release:audit
pnpm build
```

Production is not ready until all commands pass.

## 2. Vercel configuration

Set the production project to use:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Required production variables:

```bash
NEXT_PUBLIC_APP_URL=https://masseurmatch.com
VITE_PUBLIC_APP_URL=https://masseurmatch.com
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MM_SESSION_SECRET=
SESSION_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STANDARD=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ELITE=
RESEND_API_KEY=
RESEND_FROM_EMAIL=MasseurMatch <concierge@masseurmatch.com>
```

Optional variables must not block deploy:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
REVALIDATE_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_PHONE_NUMBER=
GEMINI_API_KEY=
GOOGLE_API_KEY=
SIGHTENGINE_API_USER=
SIGHTENGINE_API_SECRET=
SERPAPI_API_KEY=
FIRECRAWL_API_KEY=
KNOTTY_LEARNING_ENABLED=false
KNOTTY_DEBUG_RANKING=false
```

## 3. Supabase checklist

Verify:

1. Production project URL and anon key match Vercel env vars.
2. Service role key is only stored server side.
3. Migrations are applied.
4. RLS is enabled.
5. Public users can read only active and approved profiles.
6. Therapists can create and update only their own profile.
7. Admin and webhook paths use server side credentials only.
8. Auth signup creates a pending therapist profile.
9. Missing optional columns do not break signup.
10. Public pages fall back safely if Supabase is unavailable.
11. Database settings for cron-triggered Edge Functions are configured: `app.settings.supabase_url`, `app.settings.supabase_anon_key`, and `app.settings.service_role_key`.

## 4. Stripe checklist

Verify:

1. Stripe webhook endpoint points to `/api/webhooks/stripe`.
2. `STRIPE_WEBHOOK_SECRET` is from the same endpoint.
3. Standard, Pro and Elite price IDs are set.
4. Checkout creates therapist subscription only.
5. Subscription update syncs tier.
6. Subscription deletion downgrades safely.
7. Missing price IDs return a configured error, not a crash.
8. There is no visitor to therapist payment flow.

## 5. Auth and signup checklist

Verify manually:

1. `/register` renders.
2. `/login` renders.
3. Registration creates or simulates a therapist profile.
4. User lands in dashboard or safe demo dashboard.
5. Dashboard does not infinite redirect.
6. Reset password renders.
7. Public pages do not require login.
8. Visitors never need an account to browse or contact therapists.

## 6. Public route smoke test

Open these routes in production preview:

```text
/
/therapists
/search
/pricing
/for-therapists
/about
/safety
/trust
/contact
/faq
/blog
/guides
/compare
/privacy
/terms
/dallas
/dallas/lgbtq-friendly
/dallas/wellness/deep-tissue
/dallas/areas/oak-lawn
/sitemap.xml
/robots.txt
```

Each route must render without crash, blank state, broken layout or accidental login requirement.

## 7. Therapist profile checklist

Verify:

1. Profile card renders correctly on mobile and desktop.
2. Profile page renders for a fallback therapist.
3. Call, SMS, WhatsApp, email and website CTAs are safe.
4. Sticky contact bar does not overlap content.
5. Profile copy never says Book Now, Pay Now or license verified by MasseurMatch.
6. Trust badges use Identity checked, Profile reviewed and Photo checked only.

## 8. SEO checklist

Verify:

1. `pnpm validate:sitemap` passes.
2. `pnpm release:audit` passes.
3. Sitemap excludes admin, dashboard, login, register, API and checkout routes.
4. Robots blocks private routes and filter query duplicates.
5. Public city, segment, keyword, area and therapist pages have metadata.
6. Public pages are not accidentally noindex.
7. Canonicals are stable.

## 9. UI and mobile checklist

Check mobile viewport widths 360, 390, 430 and desktop 1440.

Verify:

1. No horizontal overflow.
2. Hero text is not clipped.
3. Therapist cards are not clipped.
4. Pricing labels fit.
5. Header menu works.
6. Footer links wrap.
7. Search filters fit in mobile drawer.
8. Knotty does not block contact CTA.
9. Contrast is readable on dark sections.

## 10. Legal language checklist

Required language:

1. MasseurMatch is a directory platform.
2. Providers are independent.
3. Visitors contact providers directly.
4. MasseurMatch does not book or manage appointments.
5. MasseurMatch does not process payments between visitors and therapists.
6. MasseurMatch does not verify professional licenses.
7. MasseurMatch does not guarantee provider services, pricing, availability or credentials.

Support routing:

```text
General: support@masseurmatch.com
Billing: billing@masseurmatch.com
Legal: legal@masseurmatch.com
```

## 11. Final go live decision

Go live only when:

1. All repository gates pass.
2. Vercel preview deploy passes.
3. Auth/signup smoke test passes.
4. Public routes smoke test passes.
5. Sitemap and robots pass.
6. Stripe webhook is configured.
7. Supabase production env is configured.
8. Legal pages are live.
