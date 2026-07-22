-- Performance: the public directory query (getPublicTherapists, city pages,
-- search, sitemap) filters every request on
--   visibility_status = 'public' AND profile_status = 'approved'
--   AND is_suspended = false AND is_banned = false
-- and then applies several leading-wildcard `display_name NOT ILIKE '%test%'`
-- style exclusions. Leading-wildcard ILIKE cannot use an index, so without a way
-- to first narrow to the (small) set of public+approved rows, every directory
-- read sequential-scans the whole profiles table (P75 ~720ms observed).
--
-- A PARTIAL index whose predicate matches the directory filter lets Postgres
-- restrict to just the listable rows; the ILIKE exclusions then run over that
-- small set instead of the entire table. Keyed on city so city-scoped pages
-- also get an ordered access path. Additive and safe — CREATE INDEX IF NOT
-- EXISTS, no data or behavior change.

create index if not exists idx_profiles_public_directory
  on public.profiles (city)
  where visibility_status = 'public'
    and profile_status = 'approved'
    and is_suspended = false
    and is_banned = false;
