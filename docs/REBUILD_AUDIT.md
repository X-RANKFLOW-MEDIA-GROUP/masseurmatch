# MasseurMatch Rebuild Audit

Status: Phase 1 aggressive production audit.

This document is intentionally harsh. Its purpose is to prevent cosmetic fixes from being mistaken for production readiness.

## Verdict

The project must not be treated as production ready until the P0 and P1 items below are closed through reviewable PRs with green CI.

The current product should be rebuilt through controlled phases, not through a single destructive rewrite. A single mega PR would hide regressions, destroy reviewability, and likely break visual fidelity.

## Non negotiable visual constraint

The rebuild must preserve the current MasseurMatch visual identity:

- Colors
- Typography
- Cards
- Header
- Footer
- Page hierarchy
- Animations
- Mobile responsiveness
- Current UX intent

Engineering quality must improve without a visual redesign.

## P0 blockers

### P0.1 Stripe SDK API version mismatch

`src/app/api/webhooks/stripe/route.ts` on main uses an API version not accepted by the installed Stripe SDK. This blocks production build.

Required action:

- Keep the Stripe API version aligned with the installed SDK.
- Add a regression test or CI guard so future merges cannot reintroduce the old version.

### P0.2 Stripe webhook fake success responses

Critical Stripe failures must not return fake `ok: true` responses.

Required action:

- Invalid signature returns 400.
- Missing production webhook configuration returns 500.
- Persistence failure returns 5xx so Stripe can retry.
- Duplicate event returns 200 only after durable idempotency exists or when confirmed already processed.

### P0.3 OAuth can create unusable app sessions

The OAuth callback must never create a production `mm_session` with a null role.

Required action:

- Production callback fails closed when role cannot be resolved.
- `/pro/dashboard` after Google login must work for provider role.
- `/admin` must remain admin only.

### P0.4 CI is the only source of truth

No production merge should be accepted without green checks:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:sitemap
pnpm validate:db-contract
pnpm release:audit
pnpm build
```

## P1 high risk architecture problems

### P1.1 Auth/session split brain

The app uses Supabase browser session and a custom signed `mm_session` cookie. This is acceptable only if every login, OAuth, register, and logout path writes and clears both consistently.

Required action:

- Document the source of truth in `docs/AUTH_AND_SESSION_LOCK.md`.
- Add tests for role based access.
- Stop any path from setting a server session without a valid role.

### P1.2 Data model aliases are out of control

The schema contains multiple fields representing the same business concept:

- `status`
- `profile_status`
- `visibility_status`
- `subscription_tier`
- `subscription_plan`
- `_tier`
- `profile_photos`
- `therapist_photos`
- `therapists`
- `profiles`

Required action:

- Define one source of truth in `docs/DB_SOURCE_OF_TRUTH.md`.
- Code must read and write the same canonical field.
- Deprecated aliases may remain temporarily only with explicit sync strategy.

### P1.3 Middleware should not use local memory for public rate limiting

Serverless and edge runtime memory is not a reliable distributed rate limit store.

Required action:

- Remove public in memory rate limiting.
- Reintroduce rate limiting only through a distributed backend such as Upstash, Vercel KV, Supabase RPC, or similar.

### P1.4 SEO noindex rules need route level discipline

`/explore` browse/search UX may be noindex, but canonical city and programmatic SEO routes must not be accidentally noindexed.

Required action:

- Lock indexability rules in `docs/SEO_ROUTE_LOCK.md`.
- Tests must verify canonical SEO pages do not receive `X-Robots-Tag: noindex`.

### P1.5 Stripe idempotency is not durable enough

In memory event maps are not sufficient in production.

Required action:

- Add a durable table such as `stripe_webhook_events`.
- Process event only once through insert first or unique idempotency key.
- Retain safe retry behavior.

## P2 maintainability problems

### P2.1 Dependency bloat and mixed architecture

`react-router-dom` in a Next App Router app is suspicious unless explicitly justified. `twilio` is also suspicious if Twilio OTP is not part of the production auth flow.

Required action:

- Run dependency usage audit.
- Remove unused packages after confirming imports.
- Document intentionally retained packages.

### P2.2 API smoke tests do not cover enough production behavior

Current tests are useful but shallow.

Required action:

- Add auth role tests.
- Add webhook event tests.
- Add sitemap and robots assertions.
- Add protected route tests.
- Add profile read/write tests with controlled fixtures or mocks.

### P2.3 Dashboard data should be real or explicitly unavailable

Production dashboards must not show fake operational data unless clearly mocked in development only.

Required action:

- Audit admin and pro dashboard data sources.
- Replace production mocks with real queries or explicit empty states.

## P3 cleanup

### P3.1 Documentation drift

Docs must match implementation. Any lock doc that diverges from code becomes technical debt.

Required action:

- Treat lock docs as part of CI/review checklist.

## Required rebuild PR sequence

1. Hardening blockers.
2. Audit and architecture locks.
3. Auth/session rebuild.
4. DB/data access rebuild.
5. Stripe durable idempotency rebuild.
6. Dashboard data rebuild.
7. SEO/performance rebuild.
8. Security/accessibility QA hardening.

## Definition of done

A rebuild phase is done only when:

- Visual identity is unchanged.
- CI is green.
- The PR explains rollback risk.
- Tests cover the changed behavior.
- No duplicate system is introduced.
