# PR Recovery Audit 2026-04-29

This audit summarizes the launch recovery work created after reviewing the recent MasseurMatch pull requests.

## Confirmed pattern

Several recent PRs were merged while Vercel deployments were failing or rate limited. That means merge status alone was not a reliable proof that the change was production ready.

## Reviewed PR scope

- PR #152 added Knotty, Trust, nav, auth redirect, city copy variation and badge styling, but it did not fully remove public tier behavior from therapist profiles.
- PR #158 added only the weekly newsletter template and did not address public profile, auth, dashboard, launch readiness or production deployment problems.
- PR #159 added a safe redirect helper for auth, but the login page still needed to use it with the provider dashboard fallback.
- PR #160 and later PR descriptions referenced a TypeScript failure in `src/app/pro/profile/ProProfilePageClient.tsx` caused by profile editor payload fields not matching the exported `ProProfileInput` type.
- PR #157 expanded the provider profile editor, but the validation and mutation type contract still needed to accept the new editor fields consistently.

## Recovery fixes included in this branch

1. Restored provider first login fallback to `/pro/dashboard` and routed it through the safe redirect helper.
2. Updated signed in header and mobile navigation to send users to `/pro/dashboard` instead of `/client/dashboard`.
3. Expanded `ProProfileInput` to include the full provider profile editor payload, including headline, neighborhood, location description, booking and messaging links, languages, massage techniques, outcall radius and SEO fields.
4. Hardened `massageTherapistProfileSchema` so the provider editor aliases `displayName`, `bio` and `phone` are accepted and normalized into the backend field names.
5. Removed public billing tier exposure from profile structured data.
6. Removed public gallery limits based on billing tier.
7. Removed fake demo profile fallback from the public profile route so missing profiles correctly 404 instead of publishing test content.
8. Removed public promo rendering gated by `_tier === "pro"`; promotions now render only when actual promotion data exists.
9. Cleaned the weekly newsletter template so production defaults are safe, English only, and do not include fake therapist mock data.

## Remaining validation required before merge

Run these before merging:

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm seo:audit || true
```

If Vercel fails because of `api-deployments-free-per-day`, wait for the deployment quota reset or trigger one manual deployment after the quota resets. Do not treat the PR as production ready until Vercel is green.

## Launch rule going forward

A PR is not considered ready just because it is merged. It is ready only when the required checks pass, Vercel deploys successfully, and the requested user facing change is confirmed in the modified files.
