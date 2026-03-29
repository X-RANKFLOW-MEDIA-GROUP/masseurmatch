# MasseurMatch

A directory platform for independent massage therapists. Visitors browse city pages, compare therapist profiles, read editorial content, and contact providers directly. The platform does not process appointments or visitor logins.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Database/Auth**: Supabase
- **Payments**: Stripe
- **Email**: Resend + React Email
- **AI**: Google Gemini
- **Package Manager**: pnpm

## Project Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Shared React components
- `src/lib/` - Utility libraries
- `src/hooks/` - Custom React hooks
- `src/contexts/` - React context providers
- `src/emails/` - React Email templates
- `public/` - Static assets
- `prisma/` - Prisma schema (if used)
- `supabase/` - Supabase migrations and config
- `scripts/` - Utility scripts

## Running the App

```bash
pnpm run dev       # Development server on port 5000
pnpm run build     # Production build
pnpm run start     # Production server on port 5000
```

## Replit Configuration

- Dev server runs on port **5000** bound to `0.0.0.0` for Replit preview compatibility
- Workflow: "Start application" runs `pnpm run dev`
- Allowed dev origins include `*.replit.dev` and `*.repl.co`

## Environment Variables Required

See `.env.example` for the full list. Key variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Email sending API key
- `GEMINI_API_KEY` - Google Gemini API key
- `SESSION_SECRET` - Session signing secret

## Production Hardening (Completed)

- **Env validation**: `src/app/_lib/env-validation.ts` validates all required env vars at startup; imported in root layout
- **Available Now tier enforcement**: Server-side validation in `src/app/api/_lib/available-now.ts` with per-tier limits (Standard: 2hr/1day, Pro: 3hr/2day, Elite: 4hr/unlimited)
- **Security**: Hardcoded API keys removed from `.env.example`; Resend throws on missing key instead of using placeholder
- **Redirect loop fix**: Removed case-insensitive `/Auth`→`/auth` and `/Privacy`→`/privacy` redirects from `next.config.mjs` (Next.js matches redirects case-insensitively, causing 308 loops)
- **Line endings**: All source files normalized from `\r\n` to `\n` (Windows→Unix)
- **Dev origins**: `*.spock.replit.dev` added to `allowedDevOrigins` in `next.config.mjs`
- **Supabase profiles table**: Uses `_tier` column (not `tier`) for subscription tier
- **Admin pages**: All 7 admin pages use `"use client"` with client-side data fetching

## Public Profile Page Design (Redesigned)

The `/therapists/[slug]` profile page uses a new design system with:
- **Fonts**: Cormorant Garamond (serif headings), Outfit (body sans), DM Mono (labels/monospace) — loaded via next/font/google in layout.tsx
- **Layout**: Navy hero section (with grid/radial-gradient background) + cream (#FCFBF8) main content area with 2-column grid (left content + 340px right sticky sidebar)
- **Components**: Breadcrumb bar (DM Mono), hero with photo frame/badges/tags/quick stats/CTAs, About section, Techniques (pills), Rate cards (navy with large serif prices), Payment chips, Reviews (orange left-border accent cards), Booking sidebar card (orange header + navy body), Location/Amenities/Credentials info cards, SEO related search links footer
- **Key files**: `src/app/therapists/[slug]/_components/PremiumProfile*.tsx`, `premium-profile.css`
- **Color tokens**: navy (#0B1F3A), orange (#FF8A1F), cream (#FCFBF8), blue (#1E4B8F)
