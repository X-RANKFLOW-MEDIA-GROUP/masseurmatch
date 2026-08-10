# MasseurMatch Go Live Checklist

This checklist defines the minimum release gates required before sending MasseurMatch to production.

> **Final go-live closure pass (2026-08-09):** full repository gate (section 1) passes end to end.
>
> The repository entered this pass already green on every gate, so this pass is
> narrow by design: it closes two real defects and one blind spot in the gate
> itself rather than restating checks that already hold.
>
> Changes in this pass (2026-08-09):
> - `scripts/validate-db-contract.mjs`: the contract gate validated tables and
>   columns but never functions, so a `.rpc()` call with no matching SQL
>   definition passed every gate and failed only at runtime (a Stripe webhook
>   that never syncs a tier, an admin panel that never loads). The validator now
>   collects every RPC the app invokes — both the direct call form and the
>   `as unknown as` cast form used where the generated Supabase types do not
>   know the function — and fails when any of them has no
>   `create [or replace] function` anywhere under `supabase/`. All 14 RPCs
>   currently referenced resolve; the check was verified against a deliberately
>   broken reference before being committed.
> - `src/app/auth/callback/route.ts` + new `src/app/auth/callback/destination.ts`:
>   fixed the Google sign-in destination. The social buttons on the "Sign up"
>   tab always attach `next=/pro/onboard`, and the callback honoured `next`
>   verbatim for any account that already had a profile — so an existing
>   provider who signed in with Google from that tab was sent back into the plan
>   picker instead of their dashboard. New accounts now enter onboarding at
>   `/pro/onboard` (the same entry point the password signup form uses, so
>   social and password signups converge); returning users get `next`, except
>   when `next` is the onboarding entry, which resolves to `/pro/dashboard`.
>   The routing rules moved into a dependency-free module so they are unit
>   tested (`tests/unit/auth-callback-destination.test.ts`, 7 cases, including
>   open-redirect rejection).
> - `.github/workflows/release-checks.yml`: added the `pnpm release:check`
>   aggregate step between `release:audit` and `build`. See the risk note below.
> - `src/components/ui/therapist-card-tilt.tsx`: translated the remaining
>   Portuguese in the usage example (`"Deep Tissue · Relaxamento"` /
>   `"São Paulo, SP"`) to the English US sample already used by the design-system
>   page. `tests/api/profiles-listing.spec.ts`: the anonymous-rejection case now
>   filters on an encoded US city instead of `São Paulo`.
> - Re-verified as already correct, unchanged: no legacy artifacts
>   (`vite.config.ts`, `index.html`, `package-lock.json`, `public/robots.txt`
>   absent); `packageManager` is `pnpm@10.32.1`; `.gitattributes` is exactly
>   `* text=auto eol=lf`; `.vscode/extensions.json` recommends only the three
>   required extensions; Tailwind content paths contain no `src/mm` or
>   `src/pages` globs; `profiles_profile_status_check` already excludes
>   `submitted` and no `profile_status: "submitted"` remains in source
>   (`submitted` is retained only on `profile_reviews.status`, where the review
>   workflow needs it); no public phone OTP UI (only email OTP and Stripe
>   Identity — phone stays a profile field); Stripe checkout sends
>   `metadata.user_id` on both the session and the subscription; the webhook
>   verifies signatures, is idempotent via `stripe_events`, and syncs tier,
>   `_tier`, `photo_limit`, `visibility_level`, customer/subscription IDs and
>   `current_period_end`, downgrading to `free` on
>   `customer.subscription.deleted`; `release:audit` fails when
>   `STRIPE_PRICE_STANDARD|PRO|ELITE` are unset while `STRIPE_SECRET_KEY` is set.
> - Risk note — `pnpm release:check` in CI: this step re-runs lint, typecheck,
>   test, validate:sitemap, validate:db-contract, release:audit **and build**,
>   all of which already ran as discrete steps, and is followed by another
>   `pnpm build`. It adds no new signal and roughly doubles CI wall time. It is
>   included because the release specification enumerates it; deleting the step
>   is a safe one-line revert if throughput matters more than the aggregate
>   script staying exercised.
> - Open item — `mm_session`: the specification asks the OAuth callback to
>   "sync mm_session". No such cookie is issued anywhere in the codebase; the
>   app is fully on Supabase SSR cookies (`sb-*`), and `mm_session` survives
>   only as a name in the logout sweep and the cookie-policy copy. The callback
>   does establish the session (`exchangeCodeForSession` writes the auth cookies
>   onto the response) and does sync the profile/role rows via
>   `ensureUserProfileAndRole`. Re-introducing a bespoke session cookie would be
>   a second, parallel auth system, so it was deliberately not done. Removing
>   the two dead `mm_session` references is left as separate cleanup.
> - Validation results (2026-08-09): `pnpm install --frozen-lockfile`, lockfile
>   diff clean, `pnpm lint` (0 errors), `pnpm typecheck`, `pnpm test`
>   (201 unit + 8 API smoke), `pnpm validate:sitemap`,
>   `pnpm validate:db-contract`, `pnpm release:audit`, `pnpm release:check`, and
>   `pnpm build` all pass.
>
> Previous closure (2026-07-25): full repository gate (section 1) passes end to end.
>
> Changes in this pass (2026-07-25):
> - `.github/workflows/release-checks.yml`: the single `pnpm release:check` step was split
>   into discrete steps (lint → typecheck → test → validate:sitemap → validate:db-contract →
>   release:audit → build) so CI failures point at the exact failing gate.
> - `src/lib/profile-fields-config.ts`: the admin-only `profile_status` field choices now
>   match the `profiles_profile_status_check` constraint in `PRODUCTION_SCHEMA_LOCK.sql`
>   (removed stale `submitted`/`active`/`archived`; added `pending`, `pending_approval`,
>   `under_review`, `changes_requested`, `rejected`).
> - Re-verified: no legacy artifacts (`vite.config.ts`, `index.html`, `package-lock.json`,
>   `public/robots.txt` absent); `packageManager` is `pnpm@10.32.1`; `.gitattributes` and
>   `.vscode/extensions.json` match spec; Tailwind content paths contain no legacy
>   `src/mm` / `src/pages` globs; no public phone OTP UI; Stripe checkout sends
>   `metadata.user_id` on session and subscription; webhook syncs all tier fields and
>   downgrades to free on deletion; release audit enforces `STRIPE_PRICE_*` IDs; no
>   Portuguese comments in source.
> - Known live-only observation: the deployed sitemap still lists `/explore` (served
>   `noindex` by middleware). Source is already consistent (#593 removed it); the next
>   production deploy resolves the mismatch.
> - Validation results (2026-07-25): `pnpm install --frozen-lockfile`, lockfile diff clean,
>   `pnpm lint` (0 errors), `pnpm typecheck`, `pnpm test` (142 unit + 8 API smoke),
>   `pnpm validate:sitemap`, `pnpm validate:db-contract`, `pnpm release:audit`, and
>   `pnpm build` all pass.
>
> Previous closure (2026-07-09): full repository gate (section 1) passes end to end.
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
