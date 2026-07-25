# Production Deployment Checklist — Verification Run (2026-07-25)

Verified against commit `d6dd2ee` on branch
`claude/production-deployment-checklist-45x1u5`.

Legend: ✅ verified in this run · 🔶 verified at the code level (external
service must be confirmed in its dashboard) · 🚩 finding that needs a
decision · ⏭ manual step that cannot be verified from the repository.

---

## 1. Repository gates — ✅ ALL PASS

Executed from the repository root with `pnpm@10.32.1` (via corepack):

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | ✅ Pass |
| `pnpm lint` | ✅ Pass (0 errors) |
| `pnpm typecheck` | ✅ Pass (0 errors) |
| `pnpm test` | ✅ Pass — 142 unit tests (8 files) + 8 API smoke checks |
| `pnpm validate:sitemap` | ✅ Pass (source validation; see note in §8) |
| `pnpm validate:db-contract` | ✅ Pass — "DB contract OK" |
| `pnpm release:audit` | ✅ Pass |
| `pnpm release:check` | ✅ Pass (full aggregate incl. build) |
| `pnpm build` | ✅ Pass — production build completes, all routes compile |

Note: local Node was v22 against the `24.x` engines field (warning only —
Vercel production should pin Node 24).

## 2. Vercel configuration — 🔶 code-verified, dashboard must be confirmed

- Build commands: `pnpm install --frozen-lockfile` + `pnpm build`
  (`pnpm build` runs `validate:supabase-env` → `clean:next` → `next build`).
- ✅ Every required production variable in the checklist is documented in
  `.env.example` (all 16 checked programmatically).
- ✅ `scripts/release-audit.mjs` enforces the required key set
  (`NEXT_PUBLIC_APP_URL`, Supabase URL/keys, `MM_SESSION_SECRET`, Stripe
  secret/webhook/price IDs) in CI/Vercel context, so a missing required var
  fails the release audit instead of shipping broken.
- ✅ Optional vars (Twilio, Gemini, Sightengine, SerpAPI, Firecrawl, Maps,
  `KNOTTY_*`) are consumed defensively — no build-time hard requirement.
- ⏭ Actual values in the Vercel project must be confirmed in the dashboard.

## 3. Supabase — 🔶 code-verified, dashboard must be confirmed

- ✅ `scripts/validate-supabase-env.mjs` pins the production project ref
  (`ijsdpozjfjjufjsoexod`) and fails the build on URL/key mismatch (items 1–2).
- ✅ `supabase/PRODUCTION_SCHEMA_LOCK.sql` exists; `pnpm validate:db-contract`
  passes (items 3, and §12 constraint).
- ✅ Item 10 verified empirically: the production build was booted locally
  **without any Supabase credentials** and every public route rendered with
  the curated fallback directory (`src/app/_lib/directory-fallback.ts`) —
  no crash, no blank state.
- ⏭ RLS policies, profile read/write scoping, signup trigger behaviour, and
  `app.settings.*` database settings for cron Edge Functions must be
  confirmed in the Supabase dashboard / SQL editor (items 4–9, 11).

## 4. Stripe — 🔶 code-verified, dashboard must be confirmed

- ✅ Webhook route exists at `src/app/api/webhooks/stripe/route.ts` (item 1).
- ✅ Standard/Pro/Elite price IDs are consumed via env
  (`supabase/functions/create-checkout/index.ts`); `release:audit` fails if
  `STRIPE_SECRET_KEY` is set but any `STRIPE_PRICE_*` is missing, so
  production cannot silently fall back to runtime price minting (items 3, 7).
- ✅ No visitor→therapist payment flow exists; checkout is therapist
  subscription only (items 4, 8).
- ⏭ Webhook endpoint URL + signing secret pairing, and live
  subscription-update/deletion sync must be confirmed against the Stripe
  dashboard (items 2, 5, 6).

## 5. Auth and signup — ✅ smoke-tested locally, one finding

Against the production build (`pnpm start`, no Supabase credentials):

- ✅ `/login` renders (200).
- ✅ `/register` 301-redirects to `/signup/account`, which renders (200).
- ✅ `/reset-password` renders (200); the recovery flow uses scanner-safe
  `token_hash` verification — this is link verification, not an OTP UI.
- ✅ `/login` and `/register`/`/signup/account` render **no** OTP tabs, OTP
  entry fields, or "Send OTP" actions — launch auth surface is
  email/password + OAuth only (item 9).
- ✅ Public pages never require login (all §6 routes rendered without auth).
- ⏭ Dashboard-redirect and signup-creates-pending-profile checks require a
  live Supabase session (items 3–5).
- 🚩 **Finding:** `src/app/signup/verify/page.tsx` (the therapist signup
  wizard's "Verify" step) renders a "Send Verification Code" action and a
  6-digit code entry field (`supabase.auth.verifyOtp({ type: "signup" })`).
  This is an **email-confirmation fallback** for the signup confirmation
  link (scanner-safe, same rationale as the reset-password flow), not a
  passwordless login surface — but under a strict reading of §12
  ("email OTP UI disabled") it is an OTP entry field. Decide: keep it as a
  deliberate confirmation-link fallback (recommended — removing it makes
  signup fail for users whose mail scanners consume the link), or remove
  the code-entry branch and rely on the link alone.

## 6. Public route smoke test — ✅ ALL PASS (local production build)

All 22 checklist routes returned **HTTP 200 with substantive HTML**
(`/register` → 301 → `/signup/account` → 200):

`/`, `/therapists`, `/search`, `/pricing`, `/for-therapists`, `/about`,
`/safety`, `/trust`, `/contact`, `/faq`, `/blog`, `/guides`, `/compare`,
`/privacy`, `/terms`, `/dallas`, `/dallas/lgbtq-friendly`,
`/dallas/wellness/deep-tissue`, `/dallas/areas/oak-lawn`, `/sitemap.xml`,
`/robots.txt`.

No crash, blank state, or login requirement — verified with Supabase
entirely unavailable (worst case). ⏭ Re-run against the Vercel production
preview before go-live.

## 7. Therapist profile — ✅ code + fallback verified

- ✅ Fallback profile `/therapists/ethan-cole` renders (200, full page).
- ✅ Zero occurrences of "Book Now", "Pay Now", or "license verified"
  anywhere in `src/` (case-insensitive repo-wide search).
- ✅ Trust badges use exactly "Identity checked", "Profile reviewed",
  "Photo checked" (`public-profile.ts`, `VoxProfile.tsx`,
  `ProfileStructuredData.tsx`, `safety/page.tsx`).
- ⏭ Mobile/desktop visual rendering and sticky-bar overlap need a visual
  pass (see §9).

## 8. SEO — ✅ pass, one live-site note

- ✅ `pnpm validate:sitemap` and `pnpm release:audit` pass.
- ✅ Local production sitemap contains **zero** admin/dashboard/login/
  register/API/checkout URLs (verified by grep against the rendered XML).
- ✅ `src/app/robots.ts` disallows all private prefixes (`/admin/`, `/api/`,
  `/pro/`, `/login/`, `/register/`, `/signup/`, `/forgot-password/`,
  `/reset-password/`, `/dashboard/`, `/client/`, `/portal/`, `/auth/`) and
  filter-query duplicates (`/explore?*`, `/*?city=*`, `/*?zip=*`).
- ✅ Public pages (`/`, `/therapists`, `/pricing`, `/dallas`, `/privacy`,
  `/terms`) all emit `robots: index, follow`.
- 🚩 **Live-site note:** the validator's live check reports the *currently
  deployed* sitemap still lists `/explore`, which serves
  `X-Robots-Tag: noindex`. The code on this branch already excludes
  `/explore` from the sitemap, so this resolves itself on deploy. Minor
  cleanup candidate: `/explore` serves a `noindex` response header alongside
  an `index, follow` meta tag (header wins; harmless but inconsistent).

## 9. UI and mobile — ⏭ manual visual pass required

Viewports 360/390/430/1440 need a human or browser-automation pass on the
Vercel preview. Not verifiable from static analysis in this run.

## 10. Legal language — ✅ present

- ✅ Directory-platform / independent-providers / no-booking / no-payments /
  no-license-verification / no-guarantee language present across
  `terms`, `privacy`, `provider-terms`, `client-terms`, `verification`,
  `platform-disclaimer`, `badge-disclaimer`, `moderation-policy`,
  `acceptable-use`, `faq`, and the legal-center data.
- ✅ `support@`, `billing@`, and `legal@masseurmatch.com` routing present in
  contact/legal surfaces and the Resend integration.

## 11. Go-live decision status

| Gate | Status |
| --- | --- |
| Repository gates | ✅ Pass (this run) |
| Vercel preview deploy | ⏭ Confirm in Vercel |
| Auth/signup smoke test | ✅ Local pass; ⏭ live Supabase pass pending |
| Public routes smoke test | ✅ Local pass; ⏭ preview pass pending |
| Sitemap and robots | ✅ Pass |
| Stripe webhook configured | ⏭ Confirm in Stripe dashboard |
| Supabase production env | ⏭ Confirm in Vercel + Supabase |
| Legal pages live | ✅ In build; live after deploy |

## 12. Launch constraints

- ✅ Login/register expose email/password + OAuth only — no phone OTP UI
  anywhere in the auth surface. See the 🚩 in §5 for the signup wizard's
  email-confirmation code fallback, which needs an explicit keep/remove
  decision.
- ✅ `supabase/PRODUCTION_SCHEMA_LOCK.sql` is in the repo and
  `pnpm validate:db-contract` passes; apply the lock before deployment and
  keep `validate:db-contract` as a release blocker (already wired into
  `release:check`).
