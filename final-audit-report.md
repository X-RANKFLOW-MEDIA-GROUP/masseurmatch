# MasseurMatch — Pre-Launch Technical Audit

**Target:** https://www.masseurmatch.com (production, Vercel)
**Date:** 2026-07-02
**Auditor role:** QA Lead · Technical SEO · Performance · Web Security · Accessibility · Compliance
**Method:** Black-box testing against production + white-box review of the repository on branch `claude/masseurmatch-prelaunch-audit-2pv6au`. Every result below was produced by a tool that actually ran; nothing is assumed. Tooling limitations are listed in §24.

Supporting artifacts live in [`prelaunch-audit/`](./prelaunch-audit): CSVs, console/network JSON, HAR, Lighthouse HTML+JSON, Playwright HTML report, and 37 screenshots.

---

## 1. Executive Summary

MasseurMatch is a well-engineered Next.js/Supabase/Stripe directory with a
genuinely strong security, legal, and compliance foundation: HSTS-preload and a
full security-header set, server-side admin authorization on every admin API,
verified Stripe webhooks, no secrets in the client bundle, no public phone-OTP
login, and thorough FOSTA-SESTA / anti-trafficking language with a reachable
reporting channel. The 404 handling, host canonicalization, and robots policy
are all correct.

The blocking problem is **product substance, not plumbing**: the live directory
contains essentially **one working therapist profile** (`/therapists/kevin-os`),
yet the marketing surface advertises **"500+ Verified Therapists"** and **"Every
Profile Verified,"** the directory grid links to cards that **redirect away or
404**, and the **sitemap advertises five profile URLs that all return 404** while
omitting the one profile that works. For a pure directory, "browse → click a
therapist → view profile" is the core loop, and today it is broken. Shipping in
this state would send Google to dead URLs, present users with empty results
behind inflated counts, and expose the brand to a substantiation/trust problem
that its own legal pages explicitly disclaim.

Performance, on the pages that render, is acceptable but carries a **reproducible
React hydration error (#418) on the homepage across all viewports** and a
**Bugsnag double-initialization**. Accessibility is close but has **serious
color-contrast failures** on five key templates.

## 2. Final Verdict: **NO-GO**

```
Final Verdict: NO-GO
Blocking Failures: 3
Critical Issues: 3
High Issues: 6
Medium Issues: 7
Low Issues: 5
Pages Crawled: 677 (378 unique HTML, 200 OK)
Links Tested: 700+ (internal link graph, header/footer, directory cards)
Not Tested: authenticated flows (no test credentials), Stripe checkout live mode, cookie flags on mm_session
```

**Single most immediate action to unblock launch:** make the directory real —
publish live profiles and fix the profile-status filter so that the sitemap,
the `/therapists` grid, and the `/therapists/[slug]` route all agree on the same
set of live, indexable profiles. Everything else is secondary to that.

## 3. Coverage Report

| Area | Tool | Ran? | Evidence |
|---|---|---|---|
| HTTP status / redirects / headers | Node fetch sweep (49 routes) | ✅ | `prelaunch-audit/http-sweep.json` |
| SEO crawl (metadata, canonicals, schema, thin, links) | cheerio crawler, 3 waves | ✅ | `seo-crawl.csv`, `metadata-issues.csv`, `thin-pages.csv`, `broken-links.csv`, `redirect-chains.csv` |
| Interactive QA (nav, forms, auth-negative, profile, 4 viewports) | Playwright 1.61, 20 tests | ✅ | `playwright-report/`, `playwright-results.json` |
| Console / network / HAR | Playwright capture, 25 pages + viewport matrix | ✅ | `console-errors.json`, `console-warnings.json`, `network-errors.json`, `network.har` |
| Lighthouse (mobile + desktop) | lighthouse 12, 16 URLs × 2 | ✅ | `lighthouse-reports/` |
| Accessibility | axe-core WCAG 2 A/AA, 10 pages + keyboard | ✅ | `a11y-results.json` |
| robots / sitemap / indexation | fetch + parse | ✅ | §19 |
| Security headers / secrets / auth | curl + repo review | ✅ | §12, §13 |
| Compliance / copy | live-page fetch + read | ✅ | §11 |
| Authenticated dashboard / admin / Stripe checkout | — | ⚠️ Not tested | no test credentials provided (§24) |

## 4. Launch Blockers

1. **C-1 — Directory cards do not resolve to live profiles.** The core browse
   flow is broken.
2. **C-2 — Sitemap advertises 5 profile URLs that 404; the one live profile is
   not in the sitemap.**
3. **C-3 — Fabricated inventory / verification claims** contradicted by the live
   site and by the product's own disclaimers.

---

## 5. Critical Bugs

### C-1 — Directory grid links to dead / redirecting profile cards
- **Severity:** Critical
- **Area:** Directory / core product flow
- **URL:** `/therapists` → cards
- **Environment:** Production, all viewports
- **How to reproduce:** Open `/therapists`. The rendered cards link to
  `/therapists/bruno-dallas-tx`, `/therapists/kevin-os`, and
  `/therapists/page-949b095a8707d907`. Click each.
- **Actual result:** `/therapists/bruno-dallas-tx` HTTP 200 but **redirects to
  `/therapists`** (a static route `src/app/therapists/bruno-dallas-tx/page.tsx`
  literally calls `redirect("/therapists")`); `/therapists/page-949b095a8707d907`
  returns **404**. Only `/therapists/kevin-os` opens a profile.
- **Expected result:** Every directory card opens that therapist's profile.
- **Impact — user:** The primary action of a directory fails; users bounce.
- **Impact — SEO:** Dead internal links; crawl budget wasted; no real profile
  depth to index.
- **Impact — conversion:** Direct hit to the only conversion path (contact a
  therapist).
- **Cause (probable):** Hard-coded placeholder/redirect routes shadow the
  dynamic `[slug]` route, and the grid renders slugs (including a malformed
  `page-…` pagination artifact) that the profile route rejects.
- **Recommended fix:** Remove the placeholder static routes; render cards only
  for profiles that `getPublicTherapistBySlug` will serve; fix the
  `page-<hash>` link artifact in the directory pagination.
- **Effort:** M
- **Evidence:** `prelaunch-audit/http-sweep.json`, `broken-links.csv`; screenshots `screenshots/desktop-therapists.png`.

### C-2 — Sitemap lists profile URLs that all 404; live profile omitted
- **Severity:** Critical
- **Area:** SEO / indexation
- **URL:** `/sitemap.xml`
- **How to reproduce:** Fetch `/sitemap.xml`; HTTP-check each `/therapists/*`.
- **Actual result:** `/therapists/bruno-3890ba48`, `/therapists/carlos-luis-pena-fd794a8e`,
  `/therapists/david-213c8e32`, `/therapists/kevinos-beaf90c6`,
  `/therapists/tamerat-molla-83ce3629` → **all 404**. The working profile
  `/therapists/kevin-os` is **not** in the sitemap.
- **Expected result:** Sitemap contains exactly the live, indexable profiles,
  each returning 200.
- **Impact — SEO:** Google crawls five 404s and indexes zero real profiles;
  sitemap trust degraded.
- **Cause (probable):** `src/app/sitemap.ts` emits DB profiles by
  `therapist.slug` using a different status/visibility filter than
  `getPublicTherapistBySlug` (which `notFound()`s them). Sitemap and public
  route disagree on "what is live."
- **Recommended fix:** Drive the sitemap from the same query/filter that the
  public profile route uses (approved + visible only), so both agree.
- **Effort:** S–M
- **Evidence:** `prelaunch-audit/http-sweep.json` (profile 404s), `seo-crawl.csv`.

### C-3 — Fabricated inventory & verification claims on the homepage
- **Severity:** Critical (trust/compliance) — violates the project's own
  "no fabricated claims pre-launch" rule.
- **Area:** Compliance / marketing copy
- **URL:** `/` (and per-city counts)
- **How to reproduce:** Fetch `/`; compare to live inventory and to `/dallas`.
- **Actual result:** Homepage renders **"500+" "Total Verified,"** **"Every
  Profile Verified,"** **"Every therapist on MasseurMatch goes through identity
  verification before their profile goes live,"** and **"verified credentials."**
  The live directory links to **2 profiles (one of which redirects away)**, and
  `/dallas`'s own title reads **"2+ Verified Male Massage Therapists in Dallas."**
- **Expected result:** Counts and verification claims reflect real, published,
  verified inventory.
- **Impact:** Substantiation/consumer-protection risk; directly contradicts
  `/badge-disclaimer` ("does not verify professional licenses… no background
  checks") and `/pricing` (Verified badge is a paid Pro/Elite feature, not
  universal). Erodes trust the moment a user clicks through to an empty city.
- **Cause (probable):** Hard-coded marketing figures not bound to real data.
- **Recommended fix:** Bind counts to live published-profile data (or remove
  numeric claims until inventory exists); reword "Every Profile Verified" /
  "verified credentials" to match the badge policy ("identity-reviewed," a
  Pro/Elite feature).
- **Effort:** S (copy) + data binding
- **Evidence:** exact strings quoted above from `/` HTML; `/dallas` title.

---

## 6. High Priority Bugs

### H-1 — Marketing verification copy contradicts badge policy
- **Severity:** High · **Area:** Compliance · **URL:** `/`, `/about`
- **Detail:** "Every therapist… identity verification before their profile goes
  live" and "verified credentials" contradict `/pricing` (Verified badge = paid
  Pro/Elite, via Stripe Identity) and `/badge-disclaimer` ("basic identity
  confirmation… does not verify professional licenses/certifications/background").
- **Fix:** Reword to "identity-reviewed (Pro/Elite)"; never imply credential/
  license verification. **Effort:** S.

### H-2 — 43 sitemap URLs carry `noindex` (contradictory crawl signal)
- **Severity:** High · **Area:** SEO · **URL:** `/sitemap.xml` + city/area pages
- **Detail:** 43 URLs are in the sitemap yet serve `<meta name="robots"
  content="noindex, follow">` (e.g. `/dallas`, `/austin`, `/houston/wellness`,
  `/dallas/areas/*`). A sitemap asks Google to index; the page says do not.
- **Fix:** Either drop `noindex` when a city/area has live inventory, or remove
  those URLs from the sitemap until they do. **Effort:** S. **Evidence:**
  `metadata-issues.csv` (`SITEMAP+NOINDEX-conflict`).

### H-3 — Reproducible React hydration error (#418) on the homepage
- **Severity:** High · **Area:** Performance / correctness · **URL:** `/`
- **Detail:** `pageerror: Minified React error #418` fired on `/` at **all four
  viewports** (desktop, laptop, tablet, mobile). #418 = server/client HTML text
  mismatch — causes a re-render/flash and can drop interactivity on the most
  important page.
- **Fix:** Find the non-deterministic render on `/` (date/relative-time, random
  order, or client-only value rendered during SSR) and gate it behind a mount
  check. **Effort:** M. **Evidence:** `console-errors.json`.

### H-4 — Serious color-contrast failures (WCAG 2 AA)
- **Severity:** High · **Area:** Accessibility
- **Detail:** axe-core `color-contrast` (serious) on `/` (5), `/therapists` (4),
  `/dallas` (3), `/search` (5), **`/blog` (13)**. Other tested pages clean.
- **Fix:** Raise foreground contrast for muted grays / red-on-tint text to ≥
  4.5:1 (≥ 3:1 for large text). **Effort:** S–M. **Evidence:** `a11y-results.json`.

### H-5 — No rate limiting on search and hotel-search APIs
- **Severity:** High · **Area:** Security / cost · **URL:** `/api/search/therapists`, `/api/hotel-search`
- **Detail:** Repo review: `contact` and `newsletter` use `assertRateLimit`, but
  `/api/search/therapists` has none and `/api/hotel-search` (which proxies an
  LLM) has none — abuse/cost exposure. Middleware's public limiter explicitly
  skips `/api`.
- **Fix:** Add `assertRateLimit` to both, tighter on the LLM route. **Effort:** S.

### H-6 — Poor mobile performance (LCP ≈ 10–11 s) on nearly every template
- **Severity:** High · **Area:** Performance · **URL:** all except `/` are worst
- **Detail:** Lighthouse (mobile, throttled 4G + 4× CPU) — **median mobile
  Performance 51, median LCP 10.8 s, median TBT 540 ms.** `/therapists` scores
  **44 / LCP 11.1 s**; `/search`, `/pricing`, city and legal pages all ≈ 10–11 s
  LCP. Only the homepage is better (65 / 4.2 s). Desktop is excellent (median
  Perf 100, LCP 0.6 s, CLS ≈ 0), so this is specifically a **mobile
  render/JS-cost** problem — heavy client hydration on throttled devices.
- **Fix:** Reduce mobile JS (code-split/defer non-critical client components,
  lazy-mount the map and chat below the fold), ensure the LCP element is
  server-rendered and preloaded, trim third-party/hydration cost. Re-measure
  until mobile LCP < 2.5 s. **Effort:** M–L. **Evidence:**
  `prelaunch-audit/lighthouse-reports/*.mobile.html`, `summary.csv`.

---

## 7. Medium Priority Bugs

- **M-1 — Production CSP contains `http://localhost:*` in `frame-src`** and uses
  `script-src 'unsafe-inline'`. Remove the localhost dev leftover and scope
  inline scripts with a nonce/hash. *Area: Security · Evidence: `curl -I /`.*
- **M-2 — Title/description length at scale:** 97 pages with titles > ~60 chars,
  110 pages with descriptions > ~160 chars → SERP truncation. *Area: SEO ·
  Evidence: `metadata-issues.csv`.*
- **M-3 — Missing `STRIPE_PRICE_*` env does not fail the release audit.** The
  checkout edge function silently falls back to creating Stripe products/prices
  at runtime. Make missing price IDs a hard release-audit failure. *Area:
  Billing (repo).*
- **M-4 — (withdrawn after re-test)** Originally flagged as "no error feedback
  on invalid login." Re-test showed a clear "Invalid email or password" toast
  and a 401 response — the flow works. Kept as a numbered placeholder so other
  references stay stable. See §14.
- **M-5 — Bugsnag initialized 37×** ("Bugsnag.start() was called more than once.
  Ignoring."). Initialize once at the app root. *Area: Perf/observability ·
  Evidence: `console-warnings.json`.*
- **M-6 — `profile_status` value `"banned"` referenced in code but absent from
  the DB check constraint** (`draft,pending,pending_approval,under_review,
  approved,suspended,rejected,changes_requested`). A write of `'banned'` would
  violate the constraint. Confirm it is read-only or add it. *Area: Data (repo).*
- **M-7 — Middleware trusts the role embedded in the `mm_session` cookie** for
  page guards (stale until expiry after a role change). Mitigated because admin
  **APIs** re-check the role against the DB. Consider a short cookie TTL or a
  DB re-check for sensitive pages. *Area: Security (repo).*
- **M-8 — 290 legacy `/cities/*-xx` 308 redirects.** Correct as permanent
  redirects, but ensure no internal links still point at the old scheme (extra
  hop). *Area: SEO · Evidence: `redirect-chains.csv`.*

## 8. Low Priority Bugs

- **L-1** — Mixed "Book & Enjoy / direct bookings" wording on `/` vs the
  directory-only messaging everywhere else. Reword to "connect / contact."
- **L-2** — Mailing address inconsistency: "Wilmington, DE" (`/privacy`) vs
  "Dover, DE" (`/legal`, `/prohibited-conduct`). Pick one.
- **L-3** — `/signup/plan` and `/signup/account` canonical to `/signup` (and are
  `noindex`) — intentional, but flagged for awareness.
- **L-4** — Paid features (`Demand Radar`, per-profile "Knotty AI 24/7,"
  heatmaps, profile-view analytics) presume traffic/telemetry a pre-launch
  directory lacks; confirm they function or label "coming soon" as was correctly
  done for the AI Voice Receptionist.
- **L-5** — A couple of header nav triggers are focusable `div`s rather than
  buttons (keyboard reaches them, but semantics are off).

---

## 9. Performance Findings

**Headline (medians across 16 URLs):**

| Form factor | Performance | LCP | TBT | CLS | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|---|---|
| **Mobile** (throttled) | **51** | **10.8 s** | 540 ms | 0 | 96 | 100 | 100 |
| **Desktop** | **100** | **0.6 s** | 0 ms | 0 | 96 | 100 | 100 |

Desktop is production-grade. **Mobile is a High finding (H-6):** median LCP
10.8 s and Performance 51 — the mobile experience is far off Core Web Vitals
targets on every template except the homepage. Full per-URL table in §15.


- **HTML delivered Brotli-compressed** from Vercel edge (`content-encoding: br`),
  `x-vercel-cache: HIT` on cached routes — good.
- **TTFB** on the HTTP sweep: homepage ≈ 0.77 s cold, most pages < 0.5 s.
- **Homepage hydration error #418** (H-3) forces a client re-render — the single
  biggest correctness/perf smell on the most important page.
- **Bugsnag double-init** (M-5) — redundant SDK work on every page.
- No broken/oversized image resources were observed in the network capture
  (only the intentional `/this-page-should-404` 404). See `network.har`.

## 10. SEO Findings

- **Blocking:** sitemap ↔ profile-route disagreement (C-2); dead directory
  cards (C-1).
- **High:** 43 sitemap URLs are `noindex` (H-2).
- **Medium:** 97 over-length titles, 110 over-length descriptions (M-2).
- **Good:** consistent apex canonicalization (all canonicals →
  `masseurmatch.com`); http→https and www→apex 308s; robots blocks
  `/admin`,`/pro`,`/api`,`/login`,`/dashboard`; real 404s (no soft-404s — bogus
  cities/services correctly 404); rich structured data on the profile page
  (`ProfilePage`, `LocalBusiness`, `FAQPage`, `Service`, `BreadcrumbList`); no
  invalid JSON-LD found; duplicate titles/descriptions limited to the
  intentional `/signup*` steps and the `/dallas` gay-massage vs lgbtq-friendly
  pair.
- **Thin content:** 24 indexable pages under 200 words (e.g. `/states`,
  `/therapists`, `/explore`, `/advertise`) — largely index/hub pages, but
  `/therapists` being thin reflects the empty-inventory problem. `thin-pages.csv`.

## 11. Accessibility Findings

- **Serious color-contrast** violations on 5 templates (H-4) — the only
  WCAG-A/AA rule axe flagged.
- **Positive:** visible keyboard focus on header/nav; no missing-alt, no
  ARIA-state violations at the A/AA level on the 10 pages scanned; logical tab
  order into the primary nav.
- **Not automatable / to verify manually:** zoom-to-200 %, dropdown
  `aria-expanded` toggling, chat-widget focus trapping, modal focus return.

## 12. Security Findings

- **PASS — Headers:** `Strict-Transport-Security: max-age=63072000;
  includeSubDomains; preload`, `X-Frame-Options: SAMEORIGIN`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy:
  camera=(), microphone=(), geolocation=(self)`, and a CSP — present on home,
  city, profile, legal, pricing.
- **PASS — Secrets:** the only credential in the client bundle is the Supabase
  **anon** key (JWT `role: anon`) + public Supabase URL — expected. No
  service-role or Stripe secret in any `'use client'` file (repo scan).
- **PASS — AuthZ:** `/admin` and `/pro/*` redirect anonymous users to `/login`;
  `/api/admin/stats` returns **401**; every `src/app/api/admin/**` route calls
  `requireAdminSession`/`requireAdminClient`, which does a **live DB role check**.
- **PASS — No public Phone-OTP login** (`signInWithOtp` absent; the only
  `verifyOtp` is `type: "email"`).
- **PASS — Rate limiting** on `contact` and `newsletter`.
- **RISK — CSP** includes `http://localhost:*` (frame-src) and `'unsafe-inline'`
  (M-1).
- **RISK — No rate limit** on search / hotel-search (H-5).
- **Not tested:** `mm_session` cookie flags (Secure/HttpOnly/SameSite) — no
  authenticated session available this pass (§24).

## 13. Backend / Admin Findings (repo review)

- **Stripe — PASS:** webhook verifies signature (`constructEvent` with
  `STRIPE_WEBHOOK_SECRET`), is idempotent (`stripe_events` dedupe), checkout sets
  `metadata.user_id`, and the sync RPC updates `subscription_tier`, `photo_limit`,
  `visibility_level`, `stripe_customer_id`, `stripe_subscription_id`,
  `current_period_end`; `customer.subscription.deleted` downgrades to **free**.
  *Risk M-3:* missing price env → runtime price creation instead of failing.
- **OAuth — PASS:** `/api/auth/callback` exchanges the code, ensures profile/role,
  sets `mm_session`, and redirects new users → `/pro/onboard` (which middleware
  forwards to `/signup/plan`), existing → `/pro/dashboard`.
- **Schema contract — PASS:** `supabase/PRODUCTION_SCHEMA_LOCK.sql` +
  `scripts/validate-db-contract.mjs` statically scan code for table/column
  references and fail on drift; `profile_status` allow-list enforced in CI
  (see M-6 for the `"banned"` gap).

## 14. Playwright Results

**20 tests · 16 passed · 2 skipped · 2 failed** (viewport used: 1440×900;
matrix screenshots also captured at 1280×800, 768×1024, 390×844). Full HTML
report: `prelaunch-audit/playwright-report/`.

Passing (highlights): header renders and links; `/therapists` renders cards or
empty state; footer internal links all < 400; **404 page is friendly and returns
404**; `/search` accepts a city query; `/pricing` shows plans + CTAs and an
anonymous plan CTA does **not** reach live Stripe checkout; empty-login stays on
`/login`; **anonymous `/dashboard`, `/admin`, `/pro/dashboard` all redirect to
`/login`**; `/forgot-password` renders a form; profile page renders with a
contact CTA; the dead `bruno-dallas-tx` profile does not white-screen.

**The 2 failing tests were re-run manually and both turned out to be
test-harness artifacts, not product defects:**

- *"login rejects wrong credentials with visible error"* — On re-test the
  `/api/auth/login` call returns **401**, the page shows a clear **"Login
  failed — Invalid email or password"** toast, and the submit button resets to
  "Sign in" (screenshot `screenshots/retest-login-error.png`). The original test
  waited only 4 s and matched body text; the error is a toast the first selector
  missed. **Verdict: PASS — negative login works correctly.**
- *"floating chat opens via knotty:open event"* — On re-test, dispatching
  `window.dispatchEvent(new CustomEvent("knotty:open"))` opens the panel: a
  dialog + input `textarea` appear (screenshot `screenshots/retest-knotty.png`).
  The original selector excluded the matching element. **Verdict: PASS — Knotty
  opens via the event.**

Net functional result after re-test: **18 pass-equivalent, 2 skipped, 0 real
failures.**

**3× consecutive stability run (per the audit brief).** After correcting the two
faulty assertions above, the suite was run three consecutive times with
`retries: 2`:

| Run | Passed | Skipped | Hard failures | Flaky (passed on retry) |
|---|---|---|---|---|
| 1 | 17 | 2 | 0 | 1 |
| 2 | 17 | 2 | 0 | 1 |
| 3 | 17 | 2 | 0 | 1 |

All three runs are green (Playwright exit 0); the results were re-confirmed after
a mid-run container restart (Run 1: 18 passed; Runs 2–3: 17 passed + the same 1
flaky, each passing within `retries: 2`). The single flaky test is the
404-status check, and the flake is in the **test assertion, not the site**: the
test reads `body.innerText` immediately after navigation and asserts
`length > 20`, but the `/404` page carries very little visible text (essentially
"404 ERROR / Page not found / Sorry, we couldn't find the page you're looking
for" plus two recovery links). When `innerText` is sampled a beat before the
client finishes hydrating, it returns the near-empty pre-hydration body and the
tight `> 20` threshold trips; it passes on retry. The 404 page itself is correct
and friendly — verified by screenshot (`screenshots/desktop-this-page-should-404.png`
and the failure capture in `playwright-report/`) and by `curl` (real HTTP `404`
+ `"Page not found | MasseurMatch"` title with a full page body); across the HTTP
sweep every non-existent route returns a true 404. **Fix for the test** (not a
launch item): loosen the threshold or wait for the heading, e.g.
`await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible()`.
Reproducible specs and config are in `prelaunch-audit/tools/`.

## 15. Lighthouse Results

| URL | Form | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|---|
| / | mobile | 65 | 96 | 96 | 92 | 1.8 s | 4.2 s | 690 ms | 0 | 4.5 s |
| /therapists | mobile | 44 | 95 | 96 | 100 | 3.2 s | 11.1 s | 860 ms | 0 | 5.7 s |
| /search | mobile | 53 | 95 | 100 | 100 | 3.2 s | 11.1 s | 460 ms | 0 | 5.9 s |
| /pricing | mobile | 53 | 100 | 100 | 100 | 3.1 s | 10.4 s | 540 ms | 0 | 4.7 s |
| /signup | mobile | 50 | 100 | 100 | 69 | 2.9 s | 10.3 s | 640 ms | 0 | 5.2 s |
| /login | mobile | 47 | 98 | 100 | 69 | 4.0 s | 10.8 s | 570 ms | 0 | 6.8 s |
| /about | mobile | 48 | 100 | 100 | 100 | 3.5 s | 10.8 s | 560 ms | 0 | 6.5 s |
| /trust | mobile | 51 | 95 | 100 | 100 | 3.4 s | 10.5 s | 460 ms | 0 | 6.6 s |
| /safety | mobile | 51 | 100 | 100 | 100 | 3.5 s | 10.8 s | 440 ms | 0 | 6.5 s |
| /contact | mobile | 49 | 100 | 100 | 100 | 2.9 s | 10.9 s | 650 ms | 0 | 5.8 s |
| /blog | mobile | 51 | 96 | 100 | 100 | 2.9 s | 10.9 s | 590 ms | 0 | 5.8 s |
| /legal | mobile | 51 | 96 | 100 | 100 | 3.1 s | 10.9 s | 520 ms | 0 | 6.0 s |
| /dallas | mobile | 54 | 96 | 100 | 92 | 3.2 s | 10.5 s | 500 ms | 0 | 4.8 s |
| /austin | mobile | 48 | 96 | 100 | 92 | 4.0 s | 11.0 s | 490 ms | 0 | 6.9 s |
| /miami | mobile | 57 | 96 | 100 | 92 | 2.9 s | 10.2 s | 430 ms | 0 | 4.2 s |
| /therapists/kevin-os | mobile | 54 | 100 | 100 | 100 | 2.9 s | 10.3 s | 510 ms | 0 | 4.7 s |
| / | desktop | 99 | 96 | 96 | 92 | 0.3 s | 0.6 s | 0 ms | 0 | 1.1 s |
| /therapists | desktop | 100 | 95 | 96 | 100 | 0.3 s | 0.6 s | 10 ms | 0.024 | 0.7 s |
| /search | desktop | 100 | 95 | 100 | 100 | 0.4 s | 0.7 s | 0 ms | 0 | 0.7 s |
| /pricing | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.6 s | 10 ms | 0 | 0.8 s |
| /signup | desktop | 99 | 100 | 100 | 69 | 0.3 s | 0.7 s | 40 ms | 0 | 1.3 s |
| /login | desktop | 88 | 98 | 100 | 69 | 0.3 s | 2.1 s | 0 ms | 0.071 | 1.0 s |
| /about | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0.6 s | 0 ms | 0 | 0.8 s |
| /trust | desktop | 100 | 95 | 100 | 100 | 0.3 s | 0.5 s | 0 ms | 0 | 0.8 s |
| /safety | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.5 s | 20 ms | 0 | 0.9 s |
| /contact | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0.6 s | 20 ms | 0 | 0.8 s |
| /blog | desktop | 100 | 96 | 100 | 100 | 0.4 s | 0.5 s | 0 ms | 0 | 0.7 s |
| /legal | desktop | 100 | 96 | 100 | 100 | 0.4 s | 0.6 s | 0 ms | 0 | 0.8 s |
| /dallas | desktop | 99 | 96 | 100 | 92 | 0.3 s | 0.6 s | 0 ms | 0 | 1.0 s |
| /austin | desktop | 100 | 96 | 100 | 92 | 0.4 s | 0.6 s | 0 ms | 0 | 0.8 s |
| /miami | desktop | 100 | 96 | 100 | 92 | 0.3 s | 0.6 s | 0 ms | 0 | 0.8 s |
| /therapists/kevin-os | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 0.8 s |

*Mobile = Lighthouse default throttling (slow 4G, 4× CPU). Desktop = desktop preset. Full HTML report per URL in `prelaunch-audit/lighthouse-reports/*.html`; extracted metrics in `summary.json`/`summary.csv` (the large per-URL raw JSON was dropped to keep the repo lean). `/signup` and `/login` SEO=69 is the expected `noindex` penalty for auth pages.*

## 16. Console Errors

- **4 × pageerror** — React #418 hydration mismatch, all on `/` (H-3).
- **1 × error** — a 404 resource, exclusively the intentional
  `/this-page-should-404` probe (no real broken resources).
- **37 × warning** — Bugsnag double-init (M-5).
Full logs: `prelaunch-audit/console-errors.json`, `console-warnings.json`.

## 17. Network Errors

Only failure captured across the browser sweep + HAR was the intentional
`/this-page-should-404` (HTTP 404). No 5xx, no broken images, no mixed-content,
no failed chunks. `prelaunch-audit/network-errors.json`, `network.har`.

## 18. Broken Links

5 broken URLs, all therapist profiles from the sitemap (C-2), plus the
functionally-dead `bruno-dallas-tx` directory card (C-1, redirects rather than
404s). No broken header/footer links. `prelaunch-audit/broken-links.csv`.

## 19. Sitemap / Robots Findings

- **robots.txt — PASS:** per-bot groups; blocks `/admin`, `/pro`, `/api`,
  `/login`, `/register`, `/signup`, `/dashboard`, `/auth`, and tokenized/faceted
  query strings; `Sitemap:` and `Host:` both point to the apex — consistent with
  canonicals.
- **sitemap.xml — 124 URLs.** Issues: (C-2) 5 profile 404s + missing live
  profile; (H-2) 43 URLs are `noindex`. Sitemap correctly excludes `/login`,
  `/dashboard`, `/admin`, `/pro`.

## 20. Screenshots Index

`prelaunch-audit/screenshots/` — 37 PNGs: `desktop-*` for 25 routes (incl. the
404), plus `laptop-1280-*`, `tablet-768-*`, `mobile-390-*` for `/`, `/therapists`,
`/therapists/kevin-os`, `/pricing`. Playwright failure screenshots under
`prelaunch-audit/playwright-report/` (and `test-results/`).

## 21. Recommended Fix Roadmap

1. **Make the directory real (C-1, C-2):** one query/filter for live+indexable
   profiles feeding the grid, the `[slug]` route, and the sitemap; remove
   placeholder/redirect profile routes and the `page-<hash>` link artifact.
2. **De-inflate marketing copy (C-3, H-1):** bind counts to real data; align
   verification wording with the badge policy.
3. **Fix homepage hydration (H-3)** and **Bugsnag init (M-5).**
4. **Sitemap ↔ noindex reconciliation (H-2)** and **title/description trimming (M-2).**
5. **Color-contrast pass (H-4).**
6. **Security hardening:** CSP cleanup (M-1), rate-limit search/hotel-search (H-5).
7. **Billing guardrail:** fail release audit on missing Stripe price IDs (M-3).
8. **Copy cleanup:** booking wording (L-1), DE address (L-2), paid-feature claims (L-4).

## 22. Pre-launch Checklist

See [`prelaunch-audit/prelaunch-checklist.md`](./prelaunch-audit/prelaunch-checklist.md).

## 23. Retest Plan

See [`prelaunch-audit/retest-plan.md`](./prelaunch-audit/retest-plan.md). Re-run
the automated suite **3 consecutive clean times** before flipping to GO.

## 24. Not Tested / Limitations

- **Authenticated flows** (login success → dashboard, session persistence,
  logout, signup step-advance, provider profile editor, photo upload,
  publish/unpublish, admin approval/moderation, billing UI): **Not Tested — no
  test credentials were provided.** The negative/authorization paths (anonymous
  redirects, wrong-credential rejection, admin 401) were tested and pass.
- **Stripe checkout live run:** **Not Tested** — no real purchase made by design;
  verified only that anonymous plan CTAs do not reach live checkout and (via
  repo) that webhooks are signed and correct.
- **`mm_session` cookie flags (Secure/HttpOnly/SameSite):** **Not Tested** — no
  authenticated session available.
- **Screaming Frog:** not installed; SEO crawl performed with a custom
  cheerio-based crawler instead (677 URLs, 3 waves).
- **Browser proxy accommodation:** the headless Chromium had to route through
  the environment egress proxy with Chrome's post-quantum TLS key share disabled
  (`--disable-features=PostQuantumKyber --ssl-version-max=tls1.2`), which the
  re-terminating proxy otherwise drops. This affects only the test browser's
  transport, not the site; production TLS (TLS 1.3, HSTS-preload) was verified
  independently via curl.
