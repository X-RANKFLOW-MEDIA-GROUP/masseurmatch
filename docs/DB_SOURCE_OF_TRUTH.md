# Database Source of Truth

## Purpose

This document prevents MasseurMatch from continuing to accumulate aliases, duplicate tables, and inconsistent reads/writes.

## Canonical entities

### User identity

Canonical source:

- `auth.users`

Application mirror:

- `public.users`

`public.users` is a convenience mirror only. It must not override Supabase Auth identity.

### User role

Canonical source:

- `public.user_roles.role`

Allowed values:

- `admin`
- `provider`
- `client`
- `therapist` only as legacy compatibility alias

### Therapist profile

Canonical source:

- `public.profiles`

Primary key for app joins:

- `profiles.user_id` for authenticated owner operations
- `profiles.id` for profile scoped assets
- `profiles.slug` for public profile routes

### Profile moderation status

Canonical field:

- `profiles.status`

Allowed lifecycle:

- `draft`
- `pending`
- `pending_approval`
- `submitted`
- `under_review`
- `approved`
- `suspended`
- `rejected`
- `changes_requested`

Compatibility field:

- `profiles.profile_status`

Rule:

`profile_status` may exist for backward compatibility, but new code must prefer `status` unless a specific legacy consumer requires `profile_status`.

### Public visibility

Canonical field:

- `profiles.visibility_status`

Allowed values:

- `hidden`
- `public`
- `paused`
- `suspended`

Do not use moderation status to infer public visibility without explicit mapping.

### Subscription tier

Canonical field:

- `profiles.subscription_tier`

Allowed values:

- `free`
- `standard`
- `pro`
- `elite`
- `featured`

Compatibility fields:

- `profiles._tier`
- `profiles.subscription_plan`

Rule:

Stripe writes must update `subscription_tier`. UI must read `subscription_tier`. Compatibility aliases must not become new sources of truth.

### Subscription status

Canonical fields:

- `profiles.subscription_status`
- `profiles.stripe_customer_id`
- `profiles.stripe_subscription_id`
- `profiles.current_period_end`

### Photo gallery

Canonical public gallery target:

- `profile_photos`

Compatibility/staging table:

- `therapist_photos`

Rule:

If `therapist_photos` remains in use, its purpose must be dashboard staging/moderation only. Public profile rendering must have a documented path to the canonical gallery.

### Verification state

Canonical field for profile display:

- `profiles.verification_status`

Provider specific records:

- `identity_verifications`
- `text_verifications`

Rule:

Verification records can store provider event history, but UI badge logic must resolve to canonical profile state.

## Forbidden patterns

- Writing one field and reading another for the same business concept.
- Creating new tables for existing entities without documenting migration path.
- Dropping or renaming production columns destructively.
- Creating non idempotent SQL migrations.
- Using service role outside server only code.

## Required validation

Every PR touching data access must run:

```bash
pnpm validate:db-contract
pnpm typecheck
pnpm test
```
