# Deployment Incident Analysis — 2026-04-10

## Scope
This document analyzes the latest deployment/build failure reproduced from the project build pipeline and records the remediation steps.

## Most recent deployment/build errors observed
Command used:

```bash
pnpm build
```

### 1) Next.js font download failures (`next/font/google`)
**Errors**
- `Failed to fetch font 'DM Sans' from Google Fonts`
- `Failed to fetch font 'Playfair Display' from Google Fonts`
- `Failed to fetch font 'Inter' from Google Fonts`

**Nature of error**
- Build-time external dependency/network fetch error.
- Next.js tries to download Google Fonts at build time when using `next/font/google`.

**Root cause**
- Build environment could not reach `fonts.googleapis.com`/Google Fonts endpoints during compilation.
- This made the build non-deterministic and environment-dependent.

### 2) Webpack parse error from duplicate import
**Error**
- `Module parse failed: Identifier 'Link' has already been declared`
- File: `src/app/reset-password/ResetPasswordPageClient.tsx`

**Nature of error**
- Static compile-time syntax/module error.

**Root cause**
- `Link` from `next/link` was imported twice in the same module.

## Corrective actions implemented

### A) Remove network dependency from root layout fonts
- Replaced `next/font/google` usage in `src/app/layout.tsx` with the existing CSS variable fallback font stack already defined in `src/index.css`.
- This removes build-time outbound font fetches and makes deployments resilient in restricted CI/deployment environments.

### B) Fix duplicate import in reset password client page
- Removed the duplicate `import Link from "next/link";` in `src/app/reset-password/ResetPasswordPageClient.tsx`.

## Verification
After the fixes:

- `pnpm build` completed successfully.
- Next.js finished compilation and static generation without deployment-blocking errors.

## Preventive follow-ups
1. Keep build-critical assets local or bundled to avoid hard external runtime/build dependencies.
2. Add lint rule coverage for duplicate imports (`no-duplicate-imports`) if not already enforced.
3. Keep this incident record for future triage of environment-specific deployment failures.


## Follow-up deployment failure (Vercel build log)
A later Vercel build (iad1, 2026-04-10) failed with module resolution errors:

- `Module not found: Can't resolve '@/lib/supabase/client'`
- `Module not found: Can't resolve '@/components/ui/alert'`

### Root causes
1. Some app pages/components referenced a legacy Supabase import path (`@/lib/supabase/client`) while the active implementation lived at `@/integrations/supabase/client`.
2. Some pages imported a shadcn-style alert component file (`@/components/ui/alert`) that was missing from the codebase.

### Corrective actions
- Added compatibility shim: `src/lib/supabase/client.ts` that re-exports `supabase` from `@/integrations/supabase/client`.
- Added `src/components/ui/alert.tsx` with `Alert`, `AlertTitle`, and `AlertDescription` exports compatible with existing UI imports.

### Verification after follow-up fixes
- `pnpm build` succeeded (no unresolved module errors).
- `pnpm lint` succeeded.
