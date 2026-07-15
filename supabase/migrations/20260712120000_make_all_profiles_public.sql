-- Make every real masseur profile visible in the public directory "right now".
--
-- The public site reads from `public.profiles` (the `public_therapists` view is
-- just a view over it) and, in buildPublicTherapistsQuery (src/app/_lib/directory.ts),
-- only shows a row when ALL of these hold:
--   visibility_status = 'public'
--   profile_status    = 'approved'
--   is_suspended      = false
--   is_banned         = false
-- plus a set of anti-junk guards on display_name / slug / email_address / phone.
--
-- This migration flips visibility_status -> 'public' and profile_status ->
-- 'approved' for all legitimate profiles so they appear immediately, while
-- MIRRORING those same anti-junk guards so test / admin / demo rows are left
-- untouched (the app would filter them out anyway, so approving them would be a
-- no-op for the site and just dirties the data).
--
-- It intentionally does NOT un-suspend or un-ban anyone: rows with
-- is_suspended = true or is_banned = true are skipped so moderation decisions
-- are preserved. Re-running is safe — already-public/approved rows are skipped.

do $$
declare
  affected integer;
begin
  with updated as (
    update public.profiles p
    set
      visibility_status = 'public',
      profile_status    = 'approved',
      updated_at        = timezone('utc', now())
    where
      -- preserve moderation decisions
      coalesce(p.is_suspended, false) = false
      and coalesce(p.is_banned, false) = false
      and coalesce(p.is_demo, false)   = false
      -- only touch rows that are not already fully visible (idempotency)
      and (p.visibility_status is distinct from 'public'
           or p.profile_status is distinct from 'approved')
      -- must have a name to render a card
      and p.display_name is not null
      and p.display_name !~* '(test|debug|admin|example|demo)'
      -- mirror the directory query's slug / email / phone junk guards
      and (p.slug is null
           or p.slug !~* '(admin|test|example|dev)')
      and (p.email_address is null
           or (p.email_address !~* '@example' and p.email_address !~* 'admin\.dev@'))
      and (p.phone is null
           or p.phone !~* '555')
    returning 1
  )
  select count(*) into affected from updated;

  raise notice 'make_all_profiles_public: % profile(s) set to public/approved', affected;
end $$;
