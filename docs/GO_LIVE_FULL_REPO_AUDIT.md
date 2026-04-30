# MasseurMatch Full Repo Go Live Verification Audit

## Audit status

This document consolidates the verified audit findings from the repo review requested by the owner. No item is marked checked unless directly inspected or explicitly identified through repository search/fetch.

## Checked folders and files

### .agents/skills

- Checked: `.agents/skills/supabase-postgres-best-practices/SKILL.md`
- Checked: `.agents/skills/supabase-postgres-best-practices/README.md`
- Checked: `.agents/skills/supabase-postgres-best-practices/AGENTS.md`
- Checked: `.agents/skills/supabase-postgres-best-practices/CLAUDE.md`

Findings:
- Skill content is valid but generic.
- Missing mandatory MasseurMatch database contract rule.
- README references skill package commands that may not exist in this repo root.
- AGENTS.md and CLAUDE.md must remain synchronized.

Required changes:
- Add database contract rule.
- Clarify README commands.
- Prevent agents from making partial Supabase column patches.

### .claude

- Checked: `.claude/settings.local.json`
- Missing or inaccessible: `.claude/settings.json`
- Missing or inaccessible: `.claude/commands/README.md`

Findings:
- Allows direct Supabase SQL execution through MCP.
- Allows apply migration without schema lock.
- Does not explicitly allow the complete production release gate.

Required changes:
- Deny direct `execute_sql` and `apply_migration` until `PRODUCTION_SCHEMA_LOCK.sql` and `validate-db-contract` exist and pass.
- Allow safe validation commands only.

### .github/workflows

- Checked: `.github/workflows/release-checks.yml`

Findings:
- Workflow runs lint, typecheck, test, sitemap, release audit and build.
- Missing `pnpm validate:db-contract`.
- Missing explicit lockfile drift check.
- Does not run Playwright/redirect checks in the release workflow.

Required changes:
- Add `pnpm validate:db-contract`.
- Add `git diff --exit-code package.json pnpm-lock.yaml`.
- Prefer canonical `pnpm release:check`.

### .vscode

- Checked: `.vscode/extensions.json`
- Missing or inaccessible: `.vscode/settings.json`
- Missing or inaccessible: `.vscode/launch.json`

Findings:
- Recommends `denoland.vscode-deno`, but this is a Next.js pnpm Node project.

Required changes:
- Replace Deno recommendation with ESLint, Prettier and Tailwind CSS extensions.

### docs

Checked:
- `docs/RELEASE_REPORT.md`
- `docs/deploy-checklist.md`
- `docs/GO_LIVE_CHECKLIST.md`
- `docs/seo-operational-plan.md`
- `docs/search-interest-index.md`
- `docs/lifecycle-email-esp-ready.html`
- `docs/mobile-ui-overflow-fix.md`
- `docs/masseurmatch-legal-polished.html`
- `docs/next-manual-qa-checklist.md`
- `docs/lifecycle-email-visualizacao.html`
- `docs/masseurmatch-wireframe-handoff.md`
- `docs/lifecycle-email-esp-mobile-compact.html`
- `docs/deployment-log-analysis-2026-04-10.md`
- `docs/AUTH_FLOW_TEST_REPORT_2026-04-25.md`
- `docs/masseurmatch-complete-legal-package.html`

Findings:
- Go live checklist does not include `pnpm validate:db-contract`.
- Auth report confirms signup, signin, email confirmation, phone confirmation and ID verification were not fully verified end to end.
- Phone confirmation remains in test scope even though SMS/Twilio is not launch ready.
- Checklist uses `pnpm install` instead of `pnpm install --frozen-lockfile`.

Required changes:
- Update GO_LIVE_CHECKLIST.md.
- Mark Phone OTP disabled for public launch.
- Add schema contract validation.
- Add this full repo audit document.

### src

Checked critical files:
- `src/app/_lib/store.ts`
- `src/app/api/pro/profile/route.ts`
- `src/app/api/provider/profile/submit/route.ts`
- `src/app/api/admin/profile/[id]/approve/route.ts`
- `src/app/api/admin/profile/[id]/reject/route.ts`
- `src/app/api/admin/profile/[id]/request-changes/route.ts`
- `src/app/api/admin/summary/route.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/app/api/provider/dashboard/route.ts`
- `src/app/api/search/therapists/route.ts`
- `src/app/_components/auth-forms.tsx`
- `src/app/api/auth/sync-session/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/env.ts`
- `src/app/api/_lib/session.ts`
- `src/app/api/_lib/supabase-server.ts`

Findings:
- Provider submit writes `profile_status: submitted` but returns `pending_approval`.
- Admin approve writes columns that must exist in profiles: `approved_by`, `moderation_notes`.
- Admin/provider routes use `profile_reviews` and `admin_actions`; these must exist in schema.
- OAuth uses `/api/auth/callback`; callback must exist and create `mm_session`.
- Phone OTP remains exposed in auth UI.
- Supabase types use generic `Record<string, any>` and hide schema problems.
- Stripe webhook depends on subscription columns that must exist in profiles.

Required changes:
- Canonicalize `profile_status = pending_approval`.
- Create or verify auth callback route.
- Remove or hide Phone OTP for launch.
- Strengthen Supabase types or add contract validator.

### supabase

Checked:
- `supabase/migrations/20260420000000_profiles_table.sql`
- `supabase/migrations/20260427200000_provider_admin_verification_system.sql`

Findings:
- Initial profiles migration is old and incompatible with current src code.
- Later migration is additive but still uses `submitted` instead of `pending_approval`.
- `visibility_status` only allows `public` and `hidden`.
- `subscription_tier` does not allow `featured`.
- `therapist_photos` exists, but compatibility with `profile_photos` must be guaranteed.

Required changes:
- Create `supabase/PRODUCTION_SCHEMA_LOCK.sql`.
- Include all columns used by src.
- Add `profile_reviews`, `admin_actions`, `profile_photos`, `therapist_photos` compatibility.
- Expand allowed status values.

### scripts

Checked:
- `scripts/setup.sh`
- `scripts/clean-next.mjs`
- `scripts/run_migrations.py`
- `scripts/_fix-admin.mjs`
- `scripts/CRITICAL_MIGRATION.sql`
- `scripts/seed-supabase.mjs`
- `scripts/_diagnose-auth.mjs`
- `scripts/validate-sitemap.mjs`
- `scripts/insert-bruno-profile.sql`
- `scripts/check-supabase-admin-connection.mjs`
- `scripts/build-manual-migration-bundle.mjs`
- `scripts/release-audit.mjs`
- `scripts/post-merge.sh`
- `scripts/requirements.txt`
- `scripts/run-migrations.js`
- `scripts/install_deps.sh`
- `scripts/test-api-routes.mjs`
- `scripts/_test-login.mjs`
- `scripts/_test-supabase-connection.mjs`
- `scripts/_test-login2.mjs`
- `scripts/seed-test-therapists.sql`

Findings:
- `scripts/validate-db-contract.mjs` is required by package.json but was not found in the scripts inventory during audit.
- `release-audit.mjs` does not validate the database contract.
- Migration scripts are fragmented across Python, JS, bundle generation and critical SQL.
- `CRITICAL_MIGRATION.sql` is not a production schema lock.

Required changes:
- Create `scripts/validate-db-contract.mjs` if missing.
- Add database contract checks to release audit.
- Mark `CRITICAL_MIGRATION.sql` as legacy or replace with schema lock.

### tests

Checked:
- `tests/redirects.spec.ts`
- `tests/auth/flows.spec.ts`
- `tests/seo-normalization.spec.ts`
- `tests/api/profiles-listing.spec.ts`
- `tests/auth/smoke.spec.ts`

Findings:
- Auth flow test expects `status` but app is moving to `profile_status`.
- Auth flow test expects `/signup/plan`, while current app flow may use `/pro/onboard`.
- Test expects several checkbox labels that may not exist in the current form.
- Smoke test has Portuguese comments.
- Missing database contract tests.

Required changes:
- Update tests to `profile_status`.
- Align redirect expectation with actual launch flow.
- Add db contract coverage.
- Translate comments to English.

### root and config files

Checked:
- `package.json`
- `.env.example`
- `next.config.mjs`
- `tsconfig.json`
- `tsconfig.typecheck.json`
- `components.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `package-lock.json`
- `vercel.json`
- `vite.config.ts`

Findings:
- Project uses pnpm but `package-lock.json` exists.
- `.env.example` still marks Vite Supabase aliases as required.
- `.env.example` includes Twilio for Phone OTP even though public launch should not expose Phone OTP.
- `package.json` includes `twilio`, `react-router-dom`, and `next-auth`; usage should be verified and removed if unused.
- `validate:db-contract` is referenced in package.json and release check.

Required changes:
- Remove `package-lock.json` if unused.
- Keep pnpm only.
- Move Vite envs to legacy optional.
- Mark Twilio/Phone OTP as disabled for launch.
- Verify/remove unused legacy dependencies.

## Global blockers before go live

1. Missing or incomplete production schema lock.
2. Missing or incomplete database contract validator.
3. Auth callback and OAuth session sync must be confirmed.
4. Phone OTP must be hidden or removed for launch.
5. Status model must be canonicalized to `profile_status`.
6. Stripe metadata and subscription columns must be verified.
7. CI must include database contract validation.
8. Tests must match current flow and schema.
9. Duplicate package managers must be cleaned.

## Required PR implementation after this audit

1. Create `supabase/PRODUCTION_SCHEMA_LOCK.sql`.
2. Create or fix `scripts/validate-db-contract.mjs`.
3. Update `release-audit.mjs` and workflow.
4. Fix auth callback and remove Phone OTP from launch UI.
5. Canonicalize `profile_status`.
6. Align tests.
7. Update docs and env.
8. Remove package manager drift.

## Final smoke test checklist

- Apply `supabase/PRODUCTION_SCHEMA_LOCK.sql`.
- Confirm Vercel envs.
- Run `pnpm install --frozen-lockfile`.
- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run `pnpm validate:sitemap`.
- Run `pnpm validate:db-contract`.
- Run `pnpm release:audit`.
- Run `pnpm release:check`.
- Run `pnpm build`.
- Signup with email.
- Confirm email.
- Login with email.
- Login with Google.
- Confirm dashboard opens.
- Edit and save profile.
- Submit profile.
- Admin approves profile.
- Public profile appears.
- Stripe checkout upgrades tier.
- Stripe cancel downgrades tier.
- Sitemap loads.
- Robots loads.
- No Twilio OTP visible publicly.
- No missing column errors.
