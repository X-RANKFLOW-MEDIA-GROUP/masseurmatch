-- Keep the production directory complete and prevent incomplete profiles from being public.
-- Existing records without a city are intentionally backfilled to Dallas, TX per product decision.

alter table public.profiles disable trigger prevent_sensitive_profile_mutation;

update public.profiles
set city = 'Dallas',
    state = 'TX',
    canonical_city_slug = 'dallas',
    updated_at = now()
where nullif(btrim(coalesce(city, '')), '') is null;

update public.profiles
set visibility_status = 'hidden',
    is_featured = false,
    moderation_notes = concat_ws(E'\n', nullif(moderation_notes, ''), 'Auto-hidden: city and phone are required for public publication.'),
    updated_at = now()
where visibility_status = 'public'
  and coalesce(nullif(btrim(phone), ''), nullif(btrim(phone_number), '')) is null;

alter table public.profiles enable trigger prevent_sensitive_profile_mutation;

alter table public.profiles drop constraint if exists profiles_public_requires_city_phone;
alter table public.profiles
  add constraint profiles_public_requires_city_phone
  check (
    visibility_status is distinct from 'public'
    or (
      nullif(btrim(coalesce(city, '')), '') is not null
      and coalesce(nullif(btrim(phone), ''), nullif(btrim(phone_number), '')) is not null
    )
  ) not valid;

alter table public.profiles validate constraint profiles_public_requires_city_phone;

-- Keep the legacy therapist table aligned so it cannot become a backdoor for incomplete listings.
update public.therapists
set city = 'Dallas',
    state = 'TX',
    updated_at = now()
where nullif(btrim(coalesce(city, '')), '') is null;

update public.therapists
set status = 'pending',
    updated_at = now()
where status = 'approved'
  and nullif(btrim(coalesce(phone, '')), '') is null;

alter table public.therapists drop constraint if exists therapists_approved_requires_city_phone;
alter table public.therapists
  add constraint therapists_approved_requires_city_phone
  check (
    status is distinct from 'approved'
    or (
      nullif(btrim(coalesce(city, '')), '') is not null
      and nullif(btrim(coalesce(phone, '')), '') is not null
    )
  ) not valid;

alter table public.therapists validate constraint therapists_approved_requires_city_phone;
