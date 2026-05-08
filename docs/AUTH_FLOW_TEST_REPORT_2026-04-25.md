# Auth Flow Test Report — 2026-04-25

## Scope requested
- Sign up
- Sign in
- Email confirmation
- Phone confirmation
- ID verification
- Access control
- Logout

## What was executed

1. `npx playwright test tests/auth/smoke.spec.ts tests/auth/flows.spec.ts`
 - Result: Could not execute browser tests because Playwright Chromium is not installed in the environment.
 - `tests/auth/flows.spec.ts` was also skipped by design when Supabase service-role credentials are not present.

2. `npx playwright install --with-deps chromium`
 - Result: failed due to apt/network proxy restrictions (`403 Forbidden`).

3. `npx playwright install chromium`
 - Result: failed due to CDN/network proxy restrictions (`403 Forbidden`).

4. `npm run test:api`
 - Result: passed.
 - Covered endpoints include: forgot-password, contact, og, admin-blog-unauthorized, pro-profile-unauthorized, login-validation, register-validation, logout.

5. `npm run check-all`
 - Result: lint warnings only, but typecheck fails on unrelated compile-time issues currently present in the repository.

## Current verification status for requested flow

- Sign up UI + flow: **Blocked in this environment** (browser dependency not installable).
- Sign in UI + flow: **Blocked in this environment** (browser dependency not installable).
- Email confirmation: **Blocked in this environment** (requires browser + OTP handling and configured auth backend).
- Phone confirmation: **Blocked in this environment** (requires browser + OTP handling and configured SMS provider).
- ID verification: **Blocked in this environment** (requires browser flow + Stripe Identity session and external redirect).
- Access checks (unauthenticated redirect): **API-level and test intent present**, browser execution blocked.
- Logout: **API smoke test passed**.

## Notes from existing E2E coverage in repo

- `tests/auth/flows.spec.ts` already includes checks that:
 - Registration should provision user/profile/role,
 - Login should succeed,
 - Fake verification claims are rejected by `/api/signup/submit`,
 - Identity verification session can be created through `/api/stripe/identity/create-session`.
- This suite is conditionally skipped without Supabase service-role credentials.

## Recommended next step to fully complete your requested run

Run in an environment where all are available:
- Playwright Chromium binary install access,
- Valid Supabase credentials (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`),
- Email/SMS providers configured,
- Stripe Identity test keys/webhooks configured.

Then execute:
- `npx playwright test tests/auth/flows.spec.ts`
- `npx playwright test tests/auth/smoke.spec.ts`

