# MasseurMatch

<<<<<<< HEAD
MasseurMatch is a directory for gay-friendly and male massage therapists. Visitors browse listings, compare providers by city and specialty, and contact therapists directly.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Supabase

## Local Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build
```

The build now generates `public/sitemap.xml` automatically before Vite runs.

To regenerate only the sitemap:

```sh
npm run generate:sitemap
```

## Environment

Copy `.env.example` to `.env.local` and provide the required values before connecting live services.

For the most complete sitemap, set one server-side key for the sitemap script: `SITEMAP_SUPABASE_KEY` (preferred), `SUPABASE_SECRET_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`.

Use a key from the same Supabase project as `NEXT_PUBLIC_SUPABASE_URL`. Public keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`) can run the query but may return fewer profiles because of RLS.

### Keys For Verification And OTP

The repository already includes the following integrations:

- Photo moderation: `supabase/functions/moderate-photo` using `SIGHTENGINE_API_USER` and `SIGHTENGINE_API_SECRET`
- Text moderation: `supabase/functions/moderate-text` using `SIGHTENGINE_API_USER` and `SIGHTENGINE_API_SECRET`
- SMS OTP (Twilio Verify): `supabase/functions/sms-otp` using `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID`

Additional API keys tracked in `.env.example`:

- `SERPAPI_API_KEY`
- `FIRECRAWL_API_KEY`

To set secrets for Supabase Edge Functions in a hosted project:

```sh
supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_VERIFY_SERVICE_SID=... SIGHTENGINE_API_USER=... SIGHTENGINE_API_SECRET=...
```

## Deployment

The repository includes a `vercel.json` rewrite so client-side routes work correctly on Vercel for SPA deployment.

=======
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
>>>>>>> 14f585c6ffaead32cd933636ddd3286e7124f036
