-- Migration history alignment for the identity verification and billing contract.

alter table public.identity_verifications
  add column if not exists provider text default 'stripe',
  add column if not exists metadata jsonb,
  add column if not exists stripe_verification_report_id text;

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'USD',
  billing_interval text not null default 'month' check (billing_interval in ('free', 'month', 'year')),
  priority_rank integer not null default 0,
  max_photos integer not null default 1,
  can_publish boolean not null default true,
  can_feature boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stripe_product_id text,
  stripe_price_id text,
  features jsonb not null default '{}'::jsonb
);

alter table public.subscription_plans enable row level security;

create table if not exists public.therapist_subscriptions (
  id uuid primary key default gen_random_uuid(),
  therapist_profile_id uuid not null,
  plan_id uuid not null references public.subscription_plans(id),
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  provider text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  profile_id uuid references public.profiles(id)
);

alter table public.therapist_subscriptions enable row level security;

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  therapist_profile_id uuid,
  plan_id uuid references public.subscription_plans(id),
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  status text not null default 'created' check (status in ('created', 'open', 'complete', 'expired', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.checkout_sessions enable row level security;
