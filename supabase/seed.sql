-- Preview/local seed data only.
--
-- Supabase preview branches are isolated from production data by design. This
-- fixture gives preview deployments one deterministic, routable public provider
-- so directory, profile, image, responsive, and structured-data E2E paths run
-- against the real database/RLS contract instead of application fallbacks.
--
-- This file is used by Supabase seeding workflows and is not a production
-- migration. It contains no real user data and no usable contact information.

begin;

-- Seed runs outside an end-user JWT context. Mark this transaction as the
-- trusted backend role so the existing restricted-profile trigger allows the
-- fixture to move from the signup default (draft/hidden) to approved/public.
select set_config('request.jwt.claim.role', 'service_role', true);

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values (
  '73200000-0000-4000-8000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'preview-provider@masseurmatch.invalid',
  now(),
  '+10000000000',
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"provider","full_name":"Preview Provider"}'::jsonb,
  now(),
  now(),
  false,
  false
)
on conflict (id) do update set
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  email_confirmed_at = excluded.email_confirmed_at,
  phone = excluded.phone,
  phone_confirmed_at = excluded.phone_confirmed_at,
  confirmed_at = excluded.confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at,
  deleted_at = null,
  banned_until = null,
  is_anonymous = false;

-- `on_auth_user_created` creates the canonical users/profile/user_roles rows on
-- first seed. Re-running the seed updates that same deterministic profile.
update public.profiles
set
  user_id = '73200000-0000-4000-8000-000000000001'::uuid,
  email = 'preview-provider@masseurmatch.invalid',
  email_address = 'preview-provider@masseurmatch.invalid',
  full_name = 'Preview Provider',
  display_name = 'Preview Provider',
  slug = 'preview-provider-directory',
  headline = 'Professional massage provider',
  bio = 'Synthetic provider profile for isolated MasseurMatch preview validation.',
  city = 'Austin',
  state = 'TX',
  phone = '+10000000000',
  phone_number = '+10000000000',
  show_phone = false,
  show_email = false,
  service_categories = array['Massage Therapy']::text[],
  massage_techniques = array['Deep Tissue']::text[],
  specialties = array['Deep Tissue']::text[],
  offers_incall = true,
  offers_outcall = false,
  incall_price = 120,
  starting_price = 120,
  years_experience = 5,
  languages = array['English']::text[],
  profile_status = 'approved',
  status = 'approved',
  visibility_status = 'public',
  is_verified_phone = true,
  verification_status = 'unverified',
  subscription_tier = 'free',
  _tier = 'free',
  tier = 'free',
  is_featured = false,
  is_suspended = false,
  is_banned = false,
  is_demo = false,
  lgbtq_affirming = true,
  avatar_url = '/images/placeholder-therapist.jpg',
  approved_at = now(),
  moderation_status = 'approved',
  updated_at = now()
where id = '73200000-0000-4000-8000-000000000001'::uuid;

insert into public.profile_photos (
  id,
  profile_id,
  user_id,
  storage_path,
  url,
  is_primary,
  sort_order,
  moderation_status,
  storage_bucket
)
values (
  '73200000-0000-4000-8000-000000000002'::uuid,
  '73200000-0000-4000-8000-000000000001'::uuid,
  '73200000-0000-4000-8000-000000000001'::uuid,
  '/images/placeholder-therapist.jpg',
  '/images/placeholder-therapist.jpg',
  true,
  0,
  'approved',
  'external'
)
on conflict (id) do update set
  profile_id = excluded.profile_id,
  user_id = excluded.user_id,
  storage_path = excluded.storage_path,
  url = excluded.url,
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order,
  moderation_status = excluded.moderation_status,
  storage_bucket = excluded.storage_bucket,
  updated_at = timezone('utc', now());

commit;
