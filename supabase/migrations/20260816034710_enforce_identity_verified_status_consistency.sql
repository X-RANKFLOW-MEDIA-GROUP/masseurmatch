-- Keep identity verification status consistent across public filters, SEO routes,
-- badges, and profile eligibility. A profile may only carry the canonical
-- `verified` status after the separate identity-review workflow has set
-- `is_verified_identity = true`.

update public.profiles
set verification_status = 'unverified',
    updated_at = now()
where verification_status = 'verified'
  and coalesce(is_verified_identity, false) = false;

alter table public.profiles
  drop constraint if exists profiles_verified_status_requires_identity;

alter table public.profiles
  add constraint profiles_verified_status_requires_identity
  check (
    verification_status is distinct from 'verified'
    or is_verified_identity is true
  ) not valid;

alter table public.profiles
  validate constraint profiles_verified_status_requires_identity;
