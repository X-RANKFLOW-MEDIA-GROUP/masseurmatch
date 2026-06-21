# CI Fix History — MasseurMatch

This document records every CI error category found across all workflow runs (from CI run #1, page 42) through to the current clean baseline, and the PR that resolved each one.

> **Current status:** All CI gates pass on `main` as of June 21, 2026.

---

## Error Log (oldest → newest)

| Run | Branch | Error Category | Root Cause | Fixed in PR |
|-----|--------|---------------|------------|-------------|
| #1–3 | `feat/seo-admin-knotty` | ESLint build error | `<a>` tags used for internal routes instead of `next/link` | #418 |
| #1–3 | `feat/seo-admin-knotty` | TypeScript error | Stale Supabase generated types — `is_demo` column not reflected | #418 |
| #1–3 | `feat/seo-admin-knotty` | TypeScript error | `const topLevelParts` used before declaration in `middleware.ts` | #418 |
| #4–5 | `backup-current-state` | TypeScript error | `contact_events`, `demand_scores`, `identity_verified_at` missing from `types.ts` | #419 |
| #4–5 | `backup-current-state` | TypeScript error | `CityData.label` → `.name` mismatch (5 locations in visiting route) | #419 |
| #6–8 | `main` (direct push) | `validate:db-contract` | `PRODUCTION_SCHEMA_LOCK.sql` drifted from applied migrations | #420 |
| #7–11 | `feat/seo-admin-knotty`, `fix/seo-structure` | E2E CI timeout | Playwright `apt install` hanging, consuming entire 30-min budget | #421 |
| #11–13 | `fix/seo-structure`, `fix/seo-route-guardrails` | `release:audit` | Forbidden phrase `"Book Now"` in `design-system/buttons/page.tsx` | #424 |
| #11–13 | `fix/seo-structure`, `fix/seo-route-guardrails` | `release:audit` | Portuguese copy in `button-liquid-metal.tsx` JSDoc | #424 |
| #12 | `main` (direct push) | `validate:db-contract` | Parser only handled `CREATE TABLE`, missed `CREATE VIEW` / `CREATE MATERIALIZED VIEW` | #429 |
| #12 | `main` (direct push) | Build error | `CODE_TTL_MINUTES` undefined in `api/provider/verification/text/send/route.ts` | #430 |
| #12 | `main` (direct push) | Dependency error | `package-lock.json` artifact co-existing with `pnpm-lock.yaml` | #430 |
| Various | Various | Security audit | dompurify CVEs (XSS, template bypass) + react-router-dom open redirect | #432 |

---

## CI Commands (full suite)

The `release-checks.yml` workflow runs the following in order:

```bash
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
```

---

## Branch Consolidation Plan

Once this PR is green, integrate old branches **one by one, oldest first**. Fix CI after each merge before proceeding.

| Order | Branch | Status | Notes |
|-------|--------|--------|-------|
| 1 | `feat/seo-admin-knotty` | ⏳ pending | Oldest branch — had ESLint + TS errors (all fixed in `main`) |
| 2 | `backup-current-state` | ⏳ pending | Had TS type errors (all fixed in `main`) |
| 3 | `fix/seo-structure` | ⏳ pending | Had `release:audit` forbidden phrase errors |
| 4 | `fix/seo-route-guardrails` | ⏳ pending | Had `release:audit` + E2E timeout errors |

### Rules
- Do **not** delete branches
- Do **not** disable CI checks
- Do **not** merge old branches directly if they diverge significantly — cherry-pick specific commits instead
- Do **not** push directly to `main`
- Fix CI after **each** branch merge before moving to the next

---

## Package Manager

`pnpm@10.32.1` (see `package.json` `packageManager` field and `.github/workflows/release-checks.yml`)

---

## Remaining Risks

| Risk | Severity | Notes |
|------|----------|-------|
| PR #431 (rebrand) has no `release-checks` run yet | Medium | Vercel deploy passed but full lint/typecheck/build gate not triggered |
| Old branches may have conflicts with 400+ commits on `main` | High | Manual conflict resolution required — do not auto-merge |
| 6 remaining pnpm audit vulnerabilities | Low | Reduced from 15 by PR #432; remaining are transitive deps with no fix available yet |
| `GEMINI_API_KEY` rotation needed | Medium | Two historical commits (`dccff74`, `993d065`) contained an example key (now allowlisted in `.gitleaks.toml`) — rotate if not already done |
