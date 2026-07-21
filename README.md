# MasseurMatch

MasseurMatch is a directory platform for independent massage therapists. Visitors browse city pages, compare therapist profiles, read editorial content, and contact providers directly. The platform does not process appointments or visitor logins.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase client packages for production integration
- Stripe SDKs for subscription billing

## Local Development

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm install
pnpm dev
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Environment

Copy `.env.example` to `.env.local` and supply the credentials for your deployment.

### Critical Production Environment Variables

The following variables **MUST** be set in production (Vercel Settings > Environment Variables):

- **`MM_CSRF_SECRET`** — HMAC secret for CSRF token validation (login, signup, password reset). Generate with `openssl rand -hex 32`. Without this, all state-changing operations fail with 503.
- **`MM_SESSION_SECRET`** — Secret for signing session cookies. Generate with `openssl rand -hex 32`. Without this, user sessions cannot be established.

Both can also use their alias names `CSRF_SECRET` and `SESSION_SECRET`, but `MM_*` names are preferred.

To validate that these are set in a deployment, visit `/api/health` — it returns 200 if all critical vars are present, 503 otherwise.

## Notes

- The app includes a local demo data store so therapist and admin flows can be exercised without a live backend.
- Supabase migrations live in `supabase/migrations`.
- Stripe webhook handling lives in `src/app/api/webhooks/stripe/route.ts`.
