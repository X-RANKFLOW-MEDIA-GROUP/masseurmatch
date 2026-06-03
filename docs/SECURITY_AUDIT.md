# Security Audit — masseurmatch

Date: 2026-06-01
Scope: full repository (Next.js 15 App Router + Supabase + Stripe).
Method: empirical validation chain (lint, typecheck, test, db-contract,
release-audit, build) plus a manual code-level review of auth, middleware,
API routes, Stripe integration, secret handling, input validation, and
dependencies.

## Baseline (verified, not assumed)

The full validation chain passes on this branch:

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | OK (lockfile in sync) |
| `pnpm lint` | OK |
| `pnpm typecheck` | OK |
| `pnpm test` | OK (8 API smoke checks) |
| `pnpm validate:sitemap` | OK |
| `pnpm validate:db-contract` | OK |
| `pnpm release:audit` | OK |
| `pnpm build` | OK |
| `pnpm audit --prod` | 0 known vulnerabilities (after fixes below) |

## Fixed in this branch

### 1. CRITICAL — Unauthenticated notification/email/SMS sender
`src/app/api/notifications/send/route.ts` accepted anonymous `POST` requests
and used the Supabase service-role client plus Resend (email) and Twilio (SMS)
to send messages to any `userId`. This enabled notification spoofing, email
bombing, and SMS toll fraud.

Fix: require an authenticated `mm_session`; re-derive admin status from the
authoritative `user_roles` table; non-admin callers can only target their own
`userId`.

### 2. HIGH — Vulnerable dependencies
`pnpm audit --prod` reported HIGH advisories in production dependencies.

- `next@15.5.15` → bumped to `^15.5.18` (fixes SSRF via WebSocket upgrades,
  multiple Middleware/Proxy bypasses, and DoS advisories; this app uses
  middleware, so the proxy-bypass issues were directly relevant).
- `axios` (transitive via `twilio`) → pinned `>=1.16.0` via `pnpm.overrides`
  (prototype-pollution / credential-injection advisories).
- `ws` (transitive via `@supabase/realtime-js`) → pinned `>=8.20.1`
  (uninitialized memory disclosure).
- `qs` (transitive via `stripe`, `twilio`) → pinned `>=6.15.2` (DoS).

All bumps stay within the same major version. `pnpm audit --prod` now reports
no known vulnerabilities.

### 3. HIGH — No rate limiting on authentication endpoints
`login`, `register`, `forgot-password`, and `resend-confirmation` had no rate
limiting (the middleware limiter explicitly skips `/api`). Added the existing
in-memory `assertRateLimit` helper (already used by the contact and pro routes)
to each, throttling credential guessing and email bombing per client IP.

### 4. LOW — PostgREST filter interpolation hardening
`getPublicTherapistBySlug` interpolated a user-supplied slug into a PostgREST
`.or()` expression. Added a `^[a-z0-9-]+$` allowlist (valid for both slugs and
UUIDs) so filter operators (`,` `.` `)`) cannot be injected.

## Open recommendations (not auto-applied — require deployment context)

These were left for a human to apply because they touch deployment
configuration or coupled secret-resolution logic, where a blind change could
cause a production outage.

### A. HIGH — Session-secret resolution fallback (partially fixed)
`src/app/api/_lib/session.ts` and `src/middleware.ts` resolve the HMAC signing
secret as `MM_SESSION_SECRET || … || SUPABASE_SERVICE_ROLE_KEY`, with a
hardcoded `'dev-only-…'` constant.

Fixed: the constant fallback is now restricted to `NODE_ENV` of `development`
or `test`. Any deployed environment (production, preview, staging) without a
real secret now throws instead of silently signing with a forgeable constant.
The resolution order is otherwise unchanged, so existing deployments keep the
same secret (no forced logouts).

Still recommended: set a dedicated `MM_SESSION_SECRET` in **every** deployed
environment and drop the `SUPABASE_SERVICE_ROLE_KEY` fallback so the signing
key is decoupled from the database key. Not done automatically because
production may currently rely on that fallback (removing it without first
setting `MM_SESSION_SECRET` would invalidate all live sessions).

### B. MEDIUM — Middleware authorizes on the cookie `role` claim
`src/middleware.ts` gates `/pro`, `/client`, `/admin` on the cookie `role`.
This is safe only while the HMAC secret is strong and unique (see A). Admin
**pages**/server components should re-check `getUserRole` against `user_roles`
rather than trusting the cookie alone. (Admin **API** routes already do via
`requireAdminSession`.)

### C. LOW — Dead component with unsanitized HTML
`src/components/sections/EnhancedBlog.tsx` renders `post.content` via
`dangerouslySetInnerHTML`. The component is not imported anywhere, so it is not
currently exploitable. Delete it or sanitize with the existing `dompurify`
dependency before wiring it to a live route.

### D. LOW — `admin/run-migrations` HTTP endpoint
`src/app/api/admin/run-migrations/route.ts` is admin-gated but runs arbitrary
`.sql` files through an `exec_sql` RPC. Consider running migrations from CI
only and removing this endpoint from the deployed app to shrink blast radius if
an admin account is compromised.

## Verified correct (no change needed)

- Stripe webhook (`src/app/api/webhooks/stripe/route.ts`) reads the raw body and
  verifies the signature with `STRIPE_WEBHOOK_SECRET`.
- Stripe payment-intent/refund/identity routes derive the user from the
  server-side session and never trust a client-supplied `user_id`.
- Service-role key is never imported into client components or exposed via
  `NEXT_PUBLIC_`; no hardcoded secrets in `src`.
- OAuth callback validates the `next` redirect (`/`-prefixed, not `//`).
- Security headers and a CSP are configured in `next.config.mjs`.
