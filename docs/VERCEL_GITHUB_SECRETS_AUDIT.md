# Vercel → GitHub Secrets Audit

Comparison of environment variables configured in the **Vercel** project
(`prj_ou8HAE72SwYWaB8EQ5rfPpzXvKlu`, team `masseurmatch`) against the secrets
referenced by GitHub Actions workflows in this repo (`.github/workflows/*`).

- **Vercel:** 71 unique keys (83 entries across production/preview/development).
- **GitHub:** 21 secrets referenced in CI (+ the auto-provided `GITHUB_TOKEN`).

> The GitHub side is derived from what the workflows **reference**, since the
> GitHub secrets REST API is not readable from the automation sandbox. A secret
> configured in GitHub but never referenced by a workflow won't appear here.

## In Vercel, missing from GitHub — candidates to migrate

App/CI secrets that exist in Vercel but are not wired into GitHub Actions:

| Key | Notes |
|---|---|
| `DEEPSEEK_API_KEY` | Primary Knotty LLM |
| `OPENAI_API_KEY` | Knotty fallback LLM |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_URL` | Image uploads |
| `CRON_SECRET` | Protects `/api/migrate/process` cron |
| `MM_SESSION_SECRET` / `MM_CSRF_SECRET` | Session + CSRF signing |
| `SUPABASE_URL` | Bare (server-only) variant |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | New-style Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | *(in both, listed for completeness)* |
| `SERPAPI_API_KEY` | SEO |
| `SEND_EMAIL_HOOK_SECRET` | Supabase email hook |
| `RESEND_FROM_EMAIL` / `ADMIN_NOTIFICATION_EMAIL` | Email config |
| `STRIPE_PUBLISHABLE_KEY` | Non-`NEXT_PUBLIC_` variant |
| `STRIPE_PRICE_STANDARD` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ELITE` | Plan price IDs |
| `STRIPE_IDENTITY_FLOW_ID` / `STRIPE_IDENTITY_VERIFY_URL` | Stripe Identity |
| `SEED_ADMIN_PASSWORD` / `SEED_THERAPIST_EMAIL` | Seed scripts |
| `TWILIO_PHONE_NUMBER` | SMS |
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL` | URLs |
| `NEXT_PUBLIC_BUGSNAG_API_KEY` / `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_POSTHOG_KEY` | Analytics/monitoring |
| `PLAYWRIGHT_BASE_URL` | E2E |

## In Vercel — do NOT copy to GitHub (Vercel-managed)

Auto-generated and rotated by Vercel Storage/Marketplace integrations and the
system. Copying them into GitHub creates duplicates that go stale. The migration
script skips these by default.

`POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PRISMA_URL`,
`POSTGRES_URL`, `POSTGRES_URL_DATABASE_URL`, `POSTGRES_URL_NON_POOLING`,
`POSTGRES_URL_POSTGRES_URL`, `POSTGRES_URL_PRISMA_DATABASE_URL`, `POSTGRES_USER`,
`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`,
`REDIS_URL`, `VERCEL_OIDC_TOKEN`, `VERCEL_AUTOMATION_BYPASS_SECRET`, `PORT`.

## In Vercel — verify before migrating (possibly legacy)

`AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN`, `AUTH0_SECRET` — the
app authenticates via Supabase; no `AUTH0_*` reference exists in the codebase.
Likely leftover from an earlier stack. Confirm before copying.

## Referenced in GitHub, not in Vercel (naming drift)

| GitHub name | Vercel equivalent |
|---|---|
| `SUPABASE_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| `VERCEL_PROTECTION_BYPASS` | `VERCEL_AUTOMATION_BYPASS_SECRET` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` / `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | *(not set in Vercel)* |
| `SITEMAP_SUPABASE_KEY` | *(not set in Vercel)* |

## How to run the migration

The GitHub secrets API is blocked from the automation sandbox, so run this
**locally**, where `gh` is authenticated:

```bash
export VERCEL_TOKEN=vcp_xxx          # a Vercel token with read access
./scripts/migrate-vercel-secrets-to-github.sh          # dry run — prints the plan
APPLY=1 ./scripts/migrate-vercel-secrets-to-github.sh  # write the missing secrets
APPLY=1 FORCE=1 ./scripts/migrate-vercel-secrets-to-github.sh  # also overwrite existing
```

By default it reads the `production` env, skips Vercel-managed vars, and skips
secrets already present in GitHub. See the script header for all options.
