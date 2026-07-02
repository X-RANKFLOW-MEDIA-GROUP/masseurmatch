# MasseurMatch — Pre-Launch Checklist

Status legend: [x] verified passing · [ ] must fix before launch · [~] partial / needs confirmation

## Launch blockers (must be [x] to go live)

- [ ] **Directory browse → profile flow works** — every card on `/therapists`
      opens a live profile (today only `/therapists/kevin-os` resolves; the
      `bruno-dallas-tx` card redirects to `/therapists`, and a
      `/therapists/page-…` card 404s). (C-1)
- [ ] **Sitemap lists only live, indexable profiles** — the 5 profile URLs in
      `/sitemap.xml` currently return 404; the one working profile is absent. (C-2)
- [ ] **No fabricated inventory claims** — homepage "500+", "Every Profile
      Verified", "verified credentials" must reflect real published inventory
      (city pages show "2+"). (C-3)

## SEO

- [x] `robots.txt` blocks `/admin`, `/pro`, `/api`, `/login`, `/dashboard`, auth
- [x] apex/non-www and http→https canonicalized (308 to `https://masseurmatch.com`)
- [x] Canonical host consistent across all pages (apex)
- [x] Real 404s for non-existent routes (no soft-404s)
- [ ] Remove `noindex` from sitemap URLs (43 conflicts) or drop them from sitemap (H-2)
- [ ] Trim titles > ~60 chars (97 pages) and descriptions > ~160 chars (110 pages) (M-2)
- [x] Structured data present on profile (`ProfilePage`, `LocalBusiness`, `FAQPage`, `BreadcrumbList`)
- [~] Legacy `/cities/*-xx` URLs 308-redirect correctly (290) — ensure no internal links still point at them

## Performance (see Lighthouse section of report)

- [ ] Homepage LCP within target on mobile
- [ ] Resolve homepage React hydration error #418 (all viewports) (H-3)
- [ ] Fix Bugsnag double-initialization (37×) (M-5)

## Accessibility

- [ ] Fix serious color-contrast failures on `/`, `/therapists`, `/dallas`, `/blog`, `/search` (H-4)
- [x] Visible keyboard focus on header/nav
- [x] No missing-alt / ARIA violations flagged by axe at WCAG 2 A/AA
- [~] Verify zoom-200% and dropdown `aria-expanded` manually

## Security

- [x] HSTS (preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP all present
- [x] No secrets in client bundle (Supabase anon key only, as expected)
- [x] `/admin` and `/pro/*` gated (redirect to login); admin APIs return 401
- [x] Admin API routes enforce server-side admin role (`requireAdminSession`)
- [x] No public Phone OTP / SMS login UI
- [ ] Remove `http://localhost:*` from production CSP `frame-src`; scope `script-src` (M-1)
- [ ] Add rate limiting to `/api/search/therapists` and `/api/hotel-search` (H-5)
- [~] Confirm `mm_session` cookie flags: Secure, HttpOnly, SameSite (needs authenticated session)

## Stripe / billing

- [x] Webhook verifies signature; sets/updates tier, photo_limit, visibility_level, customer/subscription ids, period end
- [x] Checkout sets `metadata.user_id`
- [x] Subscription cancellation downgrades to free
- [ ] Make missing `STRIPE_PRICE_*` env fail the release audit (today it silently mints prices) (M-3)

## Compliance / product QA

- [x] Directory-not-booking and no-session-payment stated on terms/legal/safety
- [x] Anti-trafficking / FOSTA-SESTA language + National Human Trafficking Hotline
- [x] Report/abuse mechanism reachable (`trust@`, `/report-block-safety`, footer)
- [x] Badge disclaimer honest (identity vs license vs self-declared)
- [x] Role-based contact emails listed (support/trust/legal/privacy/billing/dmca)
- [ ] Align marketing verification copy with badge policy (H-1)
- [ ] Confirm paid features (Demand Radar, per-profile Knotty 24/7, heatmaps) are live or label "coming soon"
- [ ] Reconcile Dover vs Wilmington DE mailing address

## Auth flows (require test credentials — not provided this pass)

- [~] Login success → dashboard redirect
- [~] Session persists across refresh; logout ends session
- [~] Signup multi-step advance and validation
- [~] Provider dashboard / photo upload / publish-unpublish
- [~] Google OAuth → `mm_session` sync → `/pro/onboard`/`/pro/dashboard`
- [ ] Invalid-login shows a visible error promptly (button stuck on "Signing in…" in test) (M-4)
