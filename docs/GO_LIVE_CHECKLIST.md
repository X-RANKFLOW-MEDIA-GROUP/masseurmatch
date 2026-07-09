# MasseurMatch Go Live Checklist

This checklist defines the minimum release gates required before sending MasseurMatch to production.

> **Launch-day closure pass (2026-07-09):** full repository gate (section 1) passes end to end.
>
> Changes in this pass (2026-07-09):
> - `supabase/PRODUCTION_SCHEMA_LOCK.sql`: removed duplicate column definitions that
>   would make the file fail with `column specified more than once` on a fresh database:
>   `profile_reviews.admin_notes`, `text_verifications.submitted_text`,
>   `text_verifications.code`, `admin_actions.action`, `moderation_queue.content_type`,
>   `appointments.user_id` (kept the `on delete cascade` variant matching migration
>   `20260626000001_add_missing_schema_columns.sql`), and
>   `payment_transactions.provider_transaction_id` / `payment_transactions.provider`.
> - Verified: homepage and search render only `profile_status = 'approved'` profiles via
>   `getPublicTherapists`; OAuth callback syncs `mm_session` and routes new profiles to
>   `/pro/onboard`; Stripe checkout/webhook metadata and downgrade paths intact;
>   no public phone OTP UI; no Portuguese comments in source.
> - `supabase/PRODUCTION_SCHEMA_LOCK.sql`: added a convergence section at the end of the
>   file. A live-schema diff (PostgREST OpenAPI vs. the lock) found 63 columns across 19
>   tables that exist only inside `create table if not exists` blocks — those blocks are
>   skipped on databases where the tables already exist, so production never received the
>   columns. The new section adds each one via `alter table ... add column if not exists`
>   (NOT NULL kept only where a DEFAULT exists; PRIMARY KEY not repeated). Re-apply the
>   lock in the Supabase SQL editor to converge production.
> - Validation results (2026-07-09): `pnpm install --frozen-lockfile`, lockfile diff clean,
>   `pnpm lint` (0 errors), `pnpm typecheck`, `pnpm test` (117 unit + 8 API smoke),
>   `pnpm validate:sitemap`, `pnpm validate:db-contract`, `pnpm release:audit`, and
>   `pnpm build` all pass.
>
> **Final closure pass (2026-06-26 — pass 2):** full repository gate (section 1) passes end to end.
>
> Changes in this pass (2026-06-26):
> - `scripts/test-api-routes.mjs`: delete `.next/server/pages` before spawning the Next.js dev server so stale CJS production build artifacts do not conflict with ESM dev mode. Fixes `pnpm test:api` after a `pnpm build`.
> - `prisma/schema.prisma`: translated Portuguese comment to English (`"Prisma schema para o perfil do massagista"` → `"Massage therapist profile model (reference only)."`). 
> - `.gitignore`: added `repo-audit-report/` to the local-audit-artifact exclusion block.
>
> Previous closure (2026-06-26 — pass 1):
> - CI workflow (`ci.yml`) fixed: all GitHub Actions pinned to `@v4` (were using non-existent `@v6` which caused CI failures).
> - `actions/cache` bumped to `@v4` in the build job.
> - No legacy artifacts, no `profile_status: "submitted"` references detected.
> - OAuth callback already redirects new profiles to `/pro/onboard`; existing users go to their requested path.
> - Stripe checkout sends `user_id` in session metadata and subscription metadata.
> - Stripe webhook correctly syncs `subscription_tier`, `_tier`, `photo_limit`, `visibility_level`, `stripe_customer_id`, `stripe_subscription_id`, and `current_period_end`; cancellation downgrades to free.
> - `validate:db-contract`, `release:audit`, `validate:sitemap`, lint, typecheck, and unit tests all pass.
>
> Previous closure (2026-06-19):
> - Legacy artifacts removed: `package-lock.json`, `src/pages/500.tsx`, `issue-pre-lancamento.md`.
> - `therapist_analytics_daily` added to `PRODUCTION_SCHEMA_LOCK.sql` (fixes `validate:db-contract`).
> - SMS API routes now return proper 401/403 via `errorResponse()` instead of 500.
> - Console errors fixed: analytics API 500, cloudinary-sign CORS, contact inquiries 403, customer-portal 500.
> - Liability-risk language removed across marketing pages and locales.
> - Travel schedule editing UI added to provider profile editor.
>
> Previous closure (2026-06-17):
> - `profile_status: "submitted"` replaced with `"pending_approval"` everywhere.
>   `"submitted"` remains only in the `profile_reviews` review-workflow table constraint.
> - OAuth callback redirects new profiles to `/pro/onboard` (→ `/signup/plan`).
> - `release:audit` fails if `STRIPE_SECRET_KEY` is set but any `STRIPE_PRICE_*`
>   ID is missing or malformed.
> - `MM_SESSION_SECRET` is the only valid session secret in production.

## 1. Repository gates

Run these commands from the repository root:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:sitemap
pnpm validate:db-contract
pnpm release:audit
pnpm release:check
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
9. Auth UI exposes email/password and OAuth only. It must not render email OTP tabs, OTP entry fields or Send OTP actions for launch.

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


## 12. Launch constraints

- Phone OTP and email OTP UI are disabled for public launch. The launch auth surface is email/password plus configured OAuth only.
- Apply `supabase/PRODUCTION_SCHEMA_LOCK.sql` before deployment and block release if `pnpm validate:db-contract` fails.
