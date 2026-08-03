-- Referral program for provider signups and premium entitlement rewards.
-- Rules implemented:
--   * one unique referral code per provider
--   * one referral attribution per new user
--   * reward only after a paid Stripe subscription invoice
--   * one premium month per paid referral, capped at six lifetime months
--   * referral bonus remains an entitlement if the Stripe subscription ends

create extension if not exists pgcrypto with schema extensions;

alter table public.profiles
  add column if not exists referral_bonus_months integer not null default 0,
  add column if not exists referral_bonus_expires_at timestamptz,
  add column if not exists referral_bonus_tier text;

alter table public.profiles
  drop constraint if exists profiles_referral_bonus_months_check;
alter table public.profiles
  add constraint profiles_referral_bonus_months_check
  check (referral_bonus_months between 0 and 6);

alter table public.profiles
  drop constraint if exists profiles_referral_bonus_tier_check;
alter table public.profiles
  add constraint profiles_referral_bonus_tier_check
  check (referral_bonus_tier is null or referral_bonus_tier in ('standard', 'pro', 'elite'));

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique,
  referral_count integer not null default 0 check (referral_count >= 0),
  premium_months_earned integer not null default 0 check (premium_months_earned between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_signups (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.referral_codes(id) on delete restrict,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'rejected')),
  stripe_subscription_id text,
  stripe_invoice_id text,
  reward_months integer not null default 0 check (reward_months in (0, 1)),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_signups_no_self_referral check (referrer_user_id <> referred_user_id)
);

create unique index if not exists referral_signups_stripe_invoice_uidx
  on public.referral_signups (stripe_invoice_id)
  where stripe_invoice_id is not null;
create index if not exists referral_signups_referrer_idx
  on public.referral_signups (referrer_user_id, payment_status, created_at desc);
create index if not exists referral_signups_code_idx
  on public.referral_signups (referral_code_id);

alter table public.referral_codes enable row level security;
alter table public.referral_signups enable row level security;

revoke all on table public.referral_codes from public, anon;
revoke all on table public.referral_signups from public, anon;
grant select on table public.referral_codes to authenticated;
grant select on table public.referral_signups to authenticated;

create policy "Providers can read their own referral code"
  on public.referral_codes for select to authenticated
  using (auth.uid() = user_id);

create policy "Providers can read referrals involving their account"
  on public.referral_signups for select to authenticated
  using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);

create or replace function public.make_referral_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  loop
    v_code := 'REF' || upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 10));
    exit when not exists (
      select 1 from public.referral_codes where code = v_code
    );
  end loop;

  return v_code;
end;
$$;

create or replace function public.ensure_referral_code(p_user_id uuid)
returns table (
  code text,
  referral_count integer,
  premium_months_earned integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_service_role_caller();

  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'valid user is required' using errcode = '22023';
  end if;

  loop
    begin
      insert into public.referral_codes (user_id, code)
      values (p_user_id, public.make_referral_code())
      on conflict (user_id) do nothing;
      exit;
    exception when unique_violation then
      -- A random code collision is extremely unlikely; retry safely if it occurs.
    end;
  end loop;

  return query
  select rc.code, rc.referral_count, rc.premium_months_earned
  from public.referral_codes rc
  where rc.user_id = p_user_id;
end;
$$;

create or replace function public.claim_referral_signup(
  p_referred_user_id uuid,
  p_referral_code text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.referral_codes%rowtype;
  v_normalized_code text := upper(trim(coalesce(p_referral_code, '')));
begin
  perform public.assert_service_role_caller();

  if p_referred_user_id is null or v_normalized_code = '' then
    return false;
  end if;

  select * into v_code
  from public.referral_codes
  where code = v_normalized_code;

  if not found or v_code.user_id = p_referred_user_id then
    return false;
  end if;

  insert into public.referral_signups (
    referral_code_id,
    referrer_user_id,
    referred_user_id
  ) values (
    v_code.id,
    v_code.user_id,
    p_referred_user_id
  )
  on conflict (referred_user_id) do nothing;

  return exists (
    select 1
    from public.referral_signups rs
    where rs.referred_user_id = p_referred_user_id
      and rs.referral_code_id = v_code.id
  );
end;
$$;

create or replace function public.process_paid_referral(
  p_referred_user_id uuid,
  p_stripe_subscription_id text,
  p_stripe_invoice_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_signup_id uuid;
  v_referrer_user_id uuid;
  v_months_earned integer;
  v_reward_months integer;
  v_profile_found boolean := false;
  v_profile_tier text;
  v_profile_period_end timestamptz;
  v_existing_bonus_end timestamptz;
  v_existing_bonus_months integer;
  v_existing_bonus_tier text;
  v_bonus_tier text;
  v_bonus_expiry timestamptz;
begin
  perform public.assert_service_role_caller();

  if p_referred_user_id is null
     or nullif(trim(coalesce(p_stripe_subscription_id, '')), '') is null
     or nullif(trim(coalesce(p_stripe_invoice_id, '')), '') is null then
    return false;
  end if;

  if exists (
    select 1 from public.referral_signups
    where stripe_invoice_id = p_stripe_invoice_id
  ) then
    return false;
  end if;

  select rs.id, rs.referrer_user_id, rc.premium_months_earned
    into v_signup_id, v_referrer_user_id, v_months_earned
  from public.referral_signups rs
  join public.referral_codes rc on rc.id = rs.referral_code_id
  where rs.referred_user_id = p_referred_user_id
    and rs.payment_status = 'pending'
  for update of rs, rc;

  if not found then
    return false;
  end if;

  v_reward_months := case when v_months_earned < 6 then 1 else 0 end;

  update public.referral_signups
     set payment_status = 'completed',
         stripe_subscription_id = p_stripe_subscription_id,
         stripe_invoice_id = p_stripe_invoice_id,
         reward_months = v_reward_months,
         paid_at = now(),
         updated_at = now()
   where id = v_signup_id
     and payment_status = 'pending';

  if not found then
    return false;
  end if;

  update public.referral_codes
     set referral_count = referral_count + 1,
         premium_months_earned = least(6, premium_months_earned + v_reward_months),
         updated_at = now()
   where user_id = v_referrer_user_id;

  if v_reward_months = 1 then
    select
      p.subscription_tier,
      p.current_period_end,
      p.referral_bonus_expires_at,
      p.referral_bonus_months,
      p.referral_bonus_tier
    into
      v_profile_tier,
      v_profile_period_end,
      v_existing_bonus_end,
      v_existing_bonus_months,
      v_existing_bonus_tier
    from public.profiles p
    where p.user_id = v_referrer_user_id
    for update;

    v_profile_found := found;

    if v_profile_found then
      v_bonus_tier := case
        when v_profile_tier in ('standard', 'pro', 'elite') then v_profile_tier
        when v_existing_bonus_tier in ('standard', 'pro', 'elite') then v_existing_bonus_tier
        else 'standard'
      end;

      v_bonus_expiry := greatest(
        now(),
        coalesce(v_profile_period_end, now()),
        coalesce(v_existing_bonus_end, now())
      ) + interval '1 month';

      update public.profiles
         set referral_bonus_months = least(6, coalesce(v_existing_bonus_months, 0) + 1),
             referral_bonus_expires_at = v_bonus_expiry,
             referral_bonus_tier = v_bonus_tier,
             subscription_tier = v_bonus_tier,
             _tier = v_bonus_tier,
             subscription_status = case
               when v_profile_tier in ('standard', 'pro', 'elite') then subscription_status
               else 'referral_bonus'
             end,
             current_period_end = v_bonus_expiry,
             photo_limit = greatest(coalesce(photo_limit, 2), case v_bonus_tier when 'elite' then 20 when 'pro' then 12 else 6 end),
             visibility_level = greatest(coalesce(visibility_level, 1), case v_bonus_tier when 'elite' then 4 when 'pro' then 3 else 2 end),
             updated_at = now()
       where user_id = v_referrer_user_id;
    end if;
  end if;

  return true;
end;
$$;

create or replace function public.expire_referral_bonus_for_user(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bonus_end timestamptz;
  v_subscription_tier text;
  v_subscription_status text;
  v_subscription_end timestamptz;
begin
  perform public.assert_service_role_caller();

  select referral_bonus_expires_at
    into v_bonus_end
  from public.profiles
  where user_id = p_user_id
  for update;

  if not found or v_bonus_end is null or v_bonus_end > now() then
    return false;
  end if;

  select s.tier, s.status, s.current_period_end
    into v_subscription_tier, v_subscription_status, v_subscription_end
  from public.subscriptions s
  where s.user_id = p_user_id
    and s.status in ('active', 'trialing')
    and (s.current_period_end is null or s.current_period_end > now())
  order by s.updated_at desc nulls last
  limit 1;

  if found then
    update public.profiles
       set referral_bonus_expires_at = null,
           referral_bonus_tier = null,
           subscription_tier = coalesce(v_subscription_tier, 'free'),
           _tier = coalesce(v_subscription_tier, 'free'),
           subscription_status = coalesce(v_subscription_status, 'active'),
           current_period_end = v_subscription_end,
           updated_at = now()
     where user_id = p_user_id;
  else
    update public.profiles
       set referral_bonus_expires_at = null,
           referral_bonus_tier = null,
           subscription_tier = 'free',
           _tier = 'free',
           subscription_status = 'free',
           current_period_end = null,
           photo_limit = 2,
           visibility_level = 1,
           updated_at = now()
     where user_id = p_user_id;
  end if;

  return true;
end;
$$;

create or replace function public.get_referral_summary(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_summary jsonb;
begin
  perform public.assert_service_role_caller();
  perform * from public.ensure_referral_code(p_user_id);

  select jsonb_build_object(
    'code', rc.code,
    'referralCount', rc.referral_count,
    'premiumMonthsEarned', rc.premium_months_earned,
    'pendingReferrals', (
      select count(*) from public.referral_signups rs
      where rs.referrer_user_id = p_user_id and rs.payment_status = 'pending'
    ),
    'paidReferrals', (
      select count(*) from public.referral_signups rs
      where rs.referrer_user_id = p_user_id and rs.payment_status = 'completed'
    ),
    'maxPremiumMonths', 6,
    'remainingPremiumMonths', greatest(0, 6 - rc.premium_months_earned),
    'bonusExpiresAt', p.referral_bonus_expires_at,
    'bonusTier', p.referral_bonus_tier
  )
  into v_summary
  from public.referral_codes rc
  left join public.profiles p on p.user_id = rc.user_id
  where rc.user_id = p_user_id;

  return coalesce(v_summary, '{}'::jsonb);
end;
$$;

-- Preserve an active referral entitlement when Stripe changes the underlying
-- billing subscription to free/cancelled. Billing records remain untouched;
-- only the effective profile entitlement is overlaid until the bonus expires.
create or replace function public.sync_stripe_subscription(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_tier text,
  p_photo_limit integer,
  p_visibility_level integer,
  p_current_period_end timestamptz,
  p_subscription_status text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := coalesce(nullif(p_subscription_status, ''), 'active');
  v_tier text := case when p_tier in ('free', 'standard', 'pro', 'elite') then p_tier else 'free' end;
  v_bonus_end timestamptz;
  v_bonus_tier text;
  v_effective_tier text;
  v_effective_status text;
  v_effective_end timestamptz;
  v_effective_photo_limit integer;
  v_effective_visibility integer;
begin
  perform public.assert_service_role_caller();

  if p_user_id is null or p_stripe_subscription_id is null then
    raise exception 'user and Stripe subscription are required' using errcode = '22023';
  end if;

  select referral_bonus_expires_at, referral_bonus_tier
    into v_bonus_end, v_bonus_tier
  from public.profiles
  where id = p_user_id or user_id = p_user_id
  limit 1
  for update;

  if not found then
    raise exception 'profile not found for subscription user' using errcode = '23503';
  end if;

  if v_bonus_end is not null and v_bonus_end > now() then
    v_effective_tier := case
      when v_tier = 'free' then coalesce(v_bonus_tier, 'standard')
      else v_tier
    end;
    v_effective_status := case
      when v_tier = 'free' or v_status in ('cancelled', 'canceled', 'paused', 'unpaid', 'incomplete_expired')
        then 'referral_bonus'
      else v_status
    end;
    v_effective_end := greatest(coalesce(p_current_period_end, v_bonus_end), v_bonus_end);
  else
    v_effective_tier := v_tier;
    v_effective_status := v_status;
    v_effective_end := p_current_period_end;
  end if;

  v_effective_photo_limit := greatest(
    coalesce(p_photo_limit, 2),
    case v_effective_tier when 'elite' then 20 when 'pro' then 12 when 'standard' then 6 else 2 end
  );
  v_effective_visibility := greatest(
    coalesce(p_visibility_level, 1),
    case v_effective_tier when 'elite' then 4 when 'pro' then 3 when 'standard' then 2 else 1 end
  );

  update public.profiles
     set stripe_customer_id = p_stripe_customer_id,
         stripe_subscription_id = p_stripe_subscription_id,
         subscription_tier = v_effective_tier,
         _tier = v_effective_tier,
         subscription_status = v_effective_status,
         current_period_end = v_effective_end,
         photo_limit = v_effective_photo_limit,
         visibility_level = v_effective_visibility,
         updated_at = now()
   where id = p_user_id or user_id = p_user_id;

  update public.subscriptions
     set tier = v_tier,
         status = v_status,
         stripe_customer_id = p_stripe_customer_id,
         stripe_subscription_id = p_stripe_subscription_id,
         current_period_end = p_current_period_end,
         updated_at = now()
   where user_id = p_user_id;

  if not found then
    insert into public.subscriptions (
      user_id,
      tier,
      status,
      stripe_customer_id,
      stripe_subscription_id,
      current_period_end
    ) values (
      p_user_id,
      v_tier,
      v_status,
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_current_period_end
    );
  end if;
end;
$$;

revoke execute on function public.make_referral_code() from public, anon, authenticated;
revoke execute on function public.ensure_referral_code(uuid) from public, anon, authenticated;
revoke execute on function public.claim_referral_signup(uuid, text) from public, anon, authenticated;
revoke execute on function public.process_paid_referral(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.expire_referral_bonus_for_user(uuid) from public, anon, authenticated;
revoke execute on function public.get_referral_summary(uuid) from public, anon, authenticated;
revoke execute on function public.sync_stripe_subscription(uuid, text, text, text, integer, integer, timestamptz, text) from public, anon, authenticated;

grant execute on function public.make_referral_code() to service_role;
grant execute on function public.ensure_referral_code(uuid) to service_role;
grant execute on function public.claim_referral_signup(uuid, text) to service_role;
grant execute on function public.process_paid_referral(uuid, text, text) to service_role;
grant execute on function public.expire_referral_bonus_for_user(uuid) to service_role;
grant execute on function public.get_referral_summary(uuid) to service_role;
grant execute on function public.sync_stripe_subscription(uuid, text, text, text, integer, integer, timestamptz, text) to service_role;
