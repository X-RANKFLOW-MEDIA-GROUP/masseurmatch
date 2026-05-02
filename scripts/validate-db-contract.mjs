import fs from 'node:fs';

const schemaPath = 'supabase/PRODUCTION_SCHEMA_LOCK.sql';

if (!fs.existsSync(schemaPath)) {
  console.error(`Missing schema lock file: ${schemaPath}`);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8').replace(/\s+/g, ' ').toLowerCase();

const requiredTokens = [
  'create extension if not exists pgcrypto',
  'create extension if not exists citext',
  'create or replace function public.set_updated_at()',
  'create or replace function public.is_admin()',
  'create table if not exists public.user_roles',
  'create table if not exists public.users',
  'create table if not exists public.profiles',
  'create table if not exists public.profile_photos',
  'create table if not exists public.therapist_photos',
  'create table if not exists public.profile_reviews',
  'create table if not exists public.identity_verifications',
  'create table if not exists public.text_verifications',
  'create table if not exists public.admin_actions',
  'create table if not exists public.audit_log',
  'create table if not exists public.lifecycle_email_queue',
  'create table if not exists public.contact_inquiries',
  'create table if not exists public.newsletter_subscribers',
  'create table if not exists public.site_settings',
  'add column if not exists profile_status',
  'add column if not exists visibility_status',
  'add column if not exists subscription_tier',
  'add column if not exists stripe_customer_id',
  'add column if not exists stripe_subscription_id',
  'add column if not exists stripe_verification_session_id',
  'add column if not exists submitted_at',
  'add column if not exists approved_at',
  'add column if not exists rejected_at',
  'add column if not exists reviewed_at',
  'add column if not exists admin_notes',
  'add constraint profiles_status_check',
  'add constraint profiles_profile_status_check',
  'add constraint profiles_subscription_tier_check',
  'add constraint profiles_visibility_status_check',
  'add constraint profiles_verification_status_check',
  'add constraint identity_verifications_status_check',
  'alter table public.users enable row level security',
  'alter table public.user_roles enable row level security',
  'alter table public.profiles enable row level security',
  'alter table public.profile_reviews enable row level security',
  'alter table public.therapist_photos enable row level security',
  'create index if not exists idx_profiles_user_id',
  'create index if not exists idx_profiles_profile_status',
  'create index if not exists idx_profiles_status',
  'create index if not exists idx_profiles_visibility_status',
  'create index if not exists idx_profiles_subscription_tier',
  'create index if not exists idx_profile_reviews_profile',
  'create index if not exists idx_profile_reviews_user',
  'create index if not exists idx_therapist_photos_user',
  'create index if not exists idx_therapist_photos_profile',
  'create trigger on_auth_user_created',
  'create trigger set_profiles_updated_at',
  "insert into storage.buckets(id,name,public) values ('profile-photos','profile-photos',true)",
  "insert into storage.buckets(id,name,public) values ('identity-documents','identity-documents',false)",
];

const forbiddenTokens = [
  'pending_approval_at',
];

const missing = requiredTokens.filter((token) => !schema.includes(token));
const forbidden = forbiddenTokens.filter((token) => schema.includes(token));

if (schema.length < 10000) {
  missing.push('schema lock is unexpectedly small; expected full production contract');
}

if (missing.length > 0 || forbidden.length > 0) {
  if (missing.length > 0) {
    console.error('DB contract validation failed. Missing required contract entries:');
    for (const item of missing) console.error(`- ${item}`);
  }

  if (forbidden.length > 0) {
    console.error('DB contract validation failed. Forbidden entries detected:');
    for (const item of forbidden) console.error(`- ${item}`);
  }

  process.exit(1);
}

console.log('DB contract OK');
