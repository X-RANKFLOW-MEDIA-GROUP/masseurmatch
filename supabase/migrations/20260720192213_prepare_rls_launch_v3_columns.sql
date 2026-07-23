-- Prepare the additive columns referenced by the legacy launch-v3 RLS
-- migration. Production already contains these columns. The IF EXISTS / IF
-- NOT EXISTS guards make this safe on both clean preview branches and the
-- live schema without changing existing data or constraints.

alter table if exists public.appointments
  add column if not exists user_id uuid,
  add column if not exists therapist_id uuid,
  add column if not exists profile_id uuid;

alter table if exists public.favorites
  add column if not exists user_id uuid,
  add column if not exists therapist_id uuid,
  add column if not exists profile_id uuid;

alter table if exists public.conversations
  add column if not exists user_id uuid,
  add column if not exists therapist_id uuid,
  add column if not exists profile_id uuid;

alter table if exists public.payment_transactions
  add column if not exists user_id uuid,
  add column if not exists therapist_id uuid;

alter table if exists public.therapist_availability
  add column if not exists therapist_id uuid,
  add column if not exists profile_id uuid;

alter table if exists public.user_mfa
  add column if not exists user_id uuid;

alter table if exists public.mfa_pending
  add column if not exists user_id uuid;

alter table if exists public.user_suspensions
  add column if not exists user_id uuid;

alter table if exists public.photo_moderations
  add column if not exists therapist_id uuid;

alter table if exists public.profile_reports
  add column if not exists profile_id uuid;

alter table if exists public.profile_status_debug_log
  add column if not exists profile_id uuid;

alter table if exists public.profile_status_invalid_log
  add column if not exists profile_id uuid;

alter table if exists public.imported_profile_data
  add column if not exists profile_id uuid;

alter table if exists public.therapist_learning_scores
  add column if not exists profile_id uuid,
  add column if not exists therapist_id uuid;

alter table if exists public.profile_documents
  add column if not exists profile_id uuid;

alter table if exists public.profiles
  add column if not exists boost_score integer default 0,
  add column if not exists is_demo boolean not null default false,
  add column if not exists canonical_city_slug text;
