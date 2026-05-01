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
corepack prepare pnpm@9.15.4 --activate
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

## Notes

- The app includes a local demo data store so therapist and admin flows can be exercised without a live backend.
- Supabase migrations live in `supabase/migrations`.
- Stripe webhook handling lives in `src/app/api/webhooks/stripe/route.ts`.
