Act as a principal Next.js App Router engineer, Supabase architect, Stripe engineer, CI/CD engineer, security auditor, QA lead, and production release manager.

Repository:
X-RANKFLOW-MEDIA-GROUP/masseurmatch

Branch:
fix/final-production-go-live-closure

Goal:
Perform the final production go-live audit and fix every detectable repository issue. The result must be build-clean, lint-clean, type-safe, test-clean, schema-safe, CI-safe, and deploy-safe.

Rules:
Do not redesign the website.
Do not rebuild the app.
Do not create duplicate dashboards.
Do not create duplicate auth systems.
Do not remove working features.
Do not introduce unnecessary dependencies.
Do not create mock-only pages when real data can be used.
Patch only what is required for production stability.
Keep Next.js App Router.
Keep Supabase.
Keep Stripe.
Keep pnpm only.
Use English only in code, comments, docs, UI copy, and tests.

Execution:
1. Inspect the full repository.
2. Search and review src, scripts, tests, supabase, docs, workflows, package.json, pnpm-lock.yaml, middleware, env handling, auth, Stripe, Supabase, admin, therapist dashboard, signup, and onboarding.
3. Remove legacy artifacts if present:
   vite.config.ts
   index.html
   package-lock.json
   public/robots.txt
4. Ensure packageManager stays pnpm@10.32.1.
5. Ensure .gitattributes is exactly:
   * text=auto eol=lf
6. Ensure .vscode/extensions.json recommends only:
   dbaeumer.vscode-eslint
   esbenp.prettier-vscode
   bradlc.vscode-tailwindcss
7. Remove Tailwind legacy paths:
   ./src/mm/**/*
   ./src/pages/**/*
8. Create or fix supabase/PRODUCTION_SCHEMA_LOCK.sql.
9. Create or fix scripts/validate-db-contract.mjs so it scans src, scripts, tests, and supabase for Supabase table and column references and fails if anything is missing from PRODUCTION_SCHEMA_LOCK.sql.
10. Replace only:
   profile_status: "submitted"
   with:
   profile_status: "pending_approval"
11. Do not globally replace every word submitted.
12. Remove submitted from profiles.profile_status constraint.
13. Keep submitted only where review workflows still require review submission state.
14. Fix OAuth callback so Google login syncs mm_session and redirects to /pro/onboard or /pro/dashboard.
15. Remove or hide public Phone OTP UI for launch.
16. Keep phone as a profile field only.
17. Ensure Stripe checkout sends metadata.user_id.
18. Ensure Stripe webhook updates subscription_tier, _tier, photo_limit, visibility_level, stripe_customer_id, stripe_subscription_id, and current_period_end.
19. Ensure subscription cancellation downgrades to free.
20. Ensure missing Stripe price IDs fail release audit.
21. Update .github/workflows/release-checks.yml to run each command separately:
   pnpm install --frozen-lockfile
   git diff --exit-code package.json pnpm-lock.yaml
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm validate:sitemap
   pnpm validate:db-contract
   pnpm release:audit
   pnpm release:check
   pnpm build
22. Update docs/GO_LIVE_CHECKLIST.md.
23. Fix tests to match /pro/onboard redirects and profile_status usage.
24. Translate Portuguese comments to English.

Validation:
Run:
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm install --frozen-lockfile
git diff --exit-code package.json pnpm-lock.yaml
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:sitemap
pnpm validate:db-contract
pnpm release:audit
pnpm release:check
pnpm build

If anything fails:
Fix the root cause.
Re-run the failed command.
Then re-run the full validation chain.

Do not open the PR until all commands pass.

After all validation passes:
Create the PR with this title:
FINAL GO LIVE: production schema, auth, CI, Stripe, and legacy cleanup

PR body must include:
Files changed
What was removed
What was fixed
Schema file to run
Validation results
Manual smoke test checklist
Risk notes
