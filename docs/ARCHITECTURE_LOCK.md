# Architecture Lock

## Purpose

This file prevents the rebuild from becoming a visual redesign, a framework migration, or another pile of duplicated systems.

## Stack lock

MasseurMatch stays on:

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS
- Radix UI primitives
- Supabase Auth and Postgres
- Stripe subscriptions
- Vercel deployment

No framework migration is allowed during rebuild.

## Product model lock

MasseurMatch is a directory platform.

Users visiting the public site browse therapist profiles and contact providers directly outside the platform.

Forbidden product changes:

- Visitor booking engine
- Visitor payment checkout
- Required client account for browsing
- Internal appointment calendar
- Managed marketplace transaction flow

## Visual lock

Preserve current:

- Color palette
- Layout hierarchy
- Header and footer structure
- Cards
- Typography intent
- Animations
- Mobile responsiveness
- Premium directory feel

Engineering refactors must not alter UI output unless explicitly required to fix accessibility or a broken responsive behavior.

## Route ownership

- Public SEO routes are server first where possible.
- Account routes require server authorization.
- API routes must validate input and fail with truthful status codes.
- Middleware handles redirects and coarse route guards only.
- Business logic must not be buried in UI components.

## Error handling standard

- Critical failures must not return fake success.
- User facing errors must be safe and non leaking.
- Server logs should include enough context for debugging without exposing secrets.
- Stripe, auth, billing, and admin actions must fail closed.

## Performance standard

- Prefer server components for data loaded public pages.
- Use client components only for interactivity.
- Lazy load heavy widgets.
- Use `next/image` for local/public images where appropriate.
- Avoid blocking homepage and public SEO pages on optional third party services.

## Security standard

- No service role in client code.
- No secrets in client bundles.
- No local memory rate limiting as production protection.
- No unsanitized user generated HTML rendering.
- Admin mutations require admin server authorization.
- Provider mutations require owner or admin authorization.

## PR standard

Every rebuild PR must state:

- Files changed.
- Behavior changed.
- Tests added or updated.
- Commands run.
- Visual impact.
- Rollback risk.
- Remaining blockers.

## Merge standard

No merge without green:

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
