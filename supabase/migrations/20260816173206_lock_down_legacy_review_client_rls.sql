-- Reviews are not a client-facing MasseurMatch feature.
-- Preserve historical data and server-side admin workflows while removing direct client table access.

drop policy if exists reviews_admin_manage on public.reviews;
drop policy if exists "Authenticated users insert own reviews" on public.reviews;
drop policy if exists reviews_public_read on public.reviews;
drop policy if exists reviews_public_read_approved on public.reviews;

-- Current profile-import and admin-review APIs use the server-side admin client.
-- Remove legacy direct RLS paths that bypass those server boundaries.
drop policy if exists "Admins can manage imported reviews" on public.imported_reviews;
drop policy if exists "Therapists can view their own imported reviews" on public.imported_reviews;

drop policy if exists "Admins can manage migrations" on public.profile_migrations;
drop policy if exists "Users can view their own migrations" on public.profile_migrations;
