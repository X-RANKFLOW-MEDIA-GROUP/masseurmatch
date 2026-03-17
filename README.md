# MasseurMatch

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

