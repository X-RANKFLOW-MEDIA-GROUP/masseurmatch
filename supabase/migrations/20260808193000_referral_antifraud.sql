-- Harden referral rewards against self-referral, multi-account abuse, refunds, and disputes.
-- Paid referrals enter a 14-day qualification hold before one Standard month is awarded.

alter table public.referral_signups
  add column if not exists payment_fingerprint text,
  add column if not exists stripe_charge_id text,
  add column if not exists risk_score integer not null default 0,
  add column if not exists risk_reasons text[] not null default '{}'::text[],
  add column if not exists qualified_at timestamptz,
  add column if not exists rewarded_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists revocation_reason text;

alter table public.referral_signups
  drop constraint if exists referral_signups_payment_status_check;
alter table public.referral_signups
  add constraint referral_signups_payment_status_check
  check (payment_status in ('pending', 'qualifying', 'review', 'completed', 'rejected', 'revoked'));

alter table public.referral_signups
  drop constraint if exists referral_signups_risk_score_check;
alter table public.referral_signups
  add constraint referral_signups_risk_score_check
  check (risk_score between 0 and 1000);

create unique index if not exists referral_signups_stripe_charge_uidx
  on public.referral_signups (stripe_charge_id)
  where stripe_charge_id is not null;

create index if not exists referral_signups_fingerprint_idx
  on public.referral_signups (payment_fingerprint)
  where payment_fingerprint is not null;

create index if not exists referral_signups_qualification_idx
  on public.referral_signups (payment_status, qualified_at)
  where payment_status = 'qualifying';

create or replace function public.qualify_paid_referral(
  p_referred_user_id uuid,
  p_stripe_subscription_id text,
  p_stripe_invoice_id text,
  p_stripe_charge_id text,
  p_payment_fingerprint text default null,
  p_risk_score integer default 0,
  p_risk_reasons text[] default '{}'::text[]
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_signup_id uuid;
  v_score integer := greatest(0, coalesce(p_risk_score, 0));
  v_reasons text[] := coalesce(p_risk_reasons, '{}'::text[]);
  v_status text;
begin
  perform public.assert_service_role_caller();

  if p_referred_user_id is null
     or nullif(trim(coalesce(p_stripe_subscription_id, '')), '') is null
     or nullif(trim(coalesce(p_stripe_invoice_id, '')), '') is null then
    return 'ignored';
  end if;

  if exists (
    select 1 from public.referral_signups
    where stripe_invoice_id = p_stripe_invoice_id
       or (p_stripe_charge_id is not null and stripe_charge_id = p_stripe_charge_id)
  ) then
    return 'duplicate';
  end if;

  select id into v_signup_id
  from public.referral_signups
  where referred_user_id = p_referred_user_id
    and payment_status = 'pending'
  for update;

  if not found then
    return 'ignored';
  end if;

  -- A fingerprint already tied to a different referred account is a strong multi-account signal.
  if p_payment_fingerprint is not null and exists (
    select 1
    from public.referral_signups
    where payment_fingerprint = p_payment_fingerprint
      and referred_user_id <> p_referred_user_id
      and payment_status in ('qualifying', 'review', 'completed')
  ) then
    v_score := v_score + 100;
    v_reasons := array_append(v_reasons, 'payment_fingerprint_reused');
  end if;

  v_score := least(v_score, 1000);
  v_status := case
    when v_score >= 70 then 'rejected'
    when v_score >= 30 then 'review'
    else 'qualifying'
  end;

  update public.referral_signups
     set payment_status = v_status,
         stripe_subscription_id = p_stripe_subscription_id,
         stripe_invoice_id = p_stripe_invoice_id,
         stripe_charge_id = p_stripe_charge_id,
         payment_fingerprint = p_payment_fingerprint,
         risk_score = v_score,
         risk_reasons = v_reasons,
         reward_months = 0,
         paid_at = now(),
         qualified_at = case when v_status = 'qualifying' then now() + interval '14 days' else null end,
         updated_at = now()
   where id = v_signup_id;

  return v_status;
end;
$$;

create or replace function public.award_qualified_referral(p_signup_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referrer_user_id uuid;
  v_months_earned integer;
  v_profile_tier text;
  v_profile_status text;
  v_profile_period_end timestamptz;
  v_existing_bonus_end timestamptz;
  v_existing_bonus_months integer;
  v_bonus_expiry timestamptz;
  v_has_active_paid_entitlement boolean := false;
begin
  select rs.referrer_user_id, rc.premium_months_earned
    into v_referrer_user_id, v_months_earned
  from public.referral_signups rs
  join public.referral_codes rc on rc.id = rs.referral_code_id
  where rs.id = p_signup_id
    and rs.payment_status = 'qualifying'
    and rs.qualified_at <= now()
    and rs.risk_score < 30
  for update of rs, rc;

  if not found then
    return false;
  end if;

  update public.referral_signups
     set payment_status = 'completed',
         reward_months = case when v_months_earned < 6 then 1 else 0 end,
         reward_tier = case when v_months_earned < 6 then 'standard' else null end,
         rewarded_at = now(),
         updated_at = now()
   where id = p_signup_id
     and payment_status = 'qualifying';

  if not found then
    return false;
  end if;

  update public.referral_codes
     set referral_count = referral_count + 1,
         premium_months_earned = least(6, premium_months_earned + case when v_months_earned < 6 then 1 else 0 end),
         updated_at = now()
   where user_id = v_referrer_user_id;

  if v_months_earned >= 6 then
    return true;
  end if;

  select p.subscription_tier, p.subscription_status, p.current_period_end,
         p.referral_bonus_expires_at, p.referral_bonus_months
    into v_profile_tier, v_profile_status, v_profile_period_end,
         v_existing_bonus_end, v_existing_bonus_months
  from public.profiles p
  where p.user_id = v_referrer_user_id
  for update;

  if not found then
    return true;
  end if;

  v_has_active_paid_entitlement :=
    v_profile_tier in ('standard', 'pro', 'elite')
    and coalesce(v_profile_status, '') in ('active', 'trialing')
    and (v_profile_period_end is null or v_profile_period_end > now());

  v_bonus_expiry := greatest(
    now(),
    coalesce(v_existing_bonus_end, now()),
    case when v_has_active_paid_entitlement then coalesce(v_profile_period_end, now()) else now() end
  ) + interval '1 month';

  if v_has_active_paid_entitlement then
    update public.profiles
       set referral_bonus_months = least(6, coalesce(v_existing_bonus_months, 0) + 1),
           referral_bonus_expires_at = v_bonus_expiry,
           referral_bonus_tier = 'standard',
           updated_at = now()
     where user_id = v_referrer_user_id;
  else
    update public.profiles
       set referral_bonus_months = least(6, coalesce(v_existing_bonus_months, 0) + 1),
           referral_bonus_expires_at = v_bonus_expiry,
           referral_bonus_tier = 'standard',
           subscription_tier = 'standard',
           _tier = 'standard',
           subscription_status = 'referral_bonus',
           current_period_end = v_bonus_expiry,
           photo_limit = greatest(coalesce(photo_limit, 2), 6),
           visibility_level = greatest(coalesce(visibility_level, 1), 2),
           updated_at = now()
     where user_id = v_referrer_user_id;
  end if;

  return true;
end;
$$;

create or replace function public.finalize_qualified_referrals()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_count integer := 0;
begin
  for v_row in
    select id
    from public.referral_signups
    where payment_status = 'qualifying'
      and qualified_at <= now()
      and risk_score < 30
    order by qualified_at
    for update skip locked
  loop
    if public.award_qualified_referral(v_row.id) then
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$$;

create or replace function public.revoke_referral_reward(
  p_stripe_charge_id text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_signup public.referral_signups%rowtype;
  v_new_months integer;
  v_new_expiry timestamptz;
begin
  perform public.assert_service_role_caller();

  if nullif(trim(coalesce(p_stripe_charge_id, '')), '') is null then
    return false;
  end if;

  select * into v_signup
  from public.referral_signups
  where stripe_charge_id = p_stripe_charge_id
    and payment_status in ('qualifying', 'review', 'completed')
  for update;

  if not found then
    return false;
  end if;

  update public.referral_signups
     set payment_status = 'revoked',
         revoked_at = now(),
         revocation_reason = left(coalesce(p_reason, 'payment_reversed'), 200),
         updated_at = now()
   where id = v_signup.id;

  if v_signup.payment_status <> 'completed' or v_signup.reward_months <> 1 then
    return true;
  end if;

  update public.referral_codes
     set premium_months_earned = greatest(0, premium_months_earned - 1),
         referral_count = greatest(0, referral_count - 1),
         updated_at = now()
   where id = v_signup.referral_code_id;

  select greatest(0, coalesce(referral_bonus_months, 0) - 1),
         greatest(now(), coalesce(referral_bonus_expires_at, now()) - interval '1 month')
    into v_new_months, v_new_expiry
  from public.profiles
  where user_id = v_signup.referrer_user_id
  for update;

  if found then
    update public.profiles
       set referral_bonus_months = v_new_months,
           referral_bonus_expires_at = case when v_new_months = 0 then null else v_new_expiry end,
           referral_bonus_tier = case when v_new_months = 0 then null else referral_bonus_tier end,
           subscription_tier = case when v_new_months = 0 and subscription_status = 'referral_bonus' then 'free' else subscription_tier end,
           _tier = case when v_new_months = 0 and subscription_status = 'referral_bonus' then 'free' else _tier end,
           subscription_status = case when v_new_months = 0 and subscription_status = 'referral_bonus' then 'free' else subscription_status end,
           current_period_end = case when v_new_months = 0 and subscription_status = 'referral_bonus' then null else current_period_end end,
           photo_limit = case when v_new_months = 0 and subscription_status = 'referral_bonus' then 2 else photo_limit end,
           visibility_level = case when v_new_months = 0 and subscription_status = 'referral_bonus' then 1 else visibility_level end,
           updated_at = now()
     where user_id = v_signup.referrer_user_id;
  end if;

  return true;
end;
$$;

revoke execute on function public.qualify_paid_referral(uuid, text, text, text, text, integer, text[]) from public, anon, authenticated;
revoke execute on function public.award_qualified_referral(uuid) from public, anon, authenticated;
revoke execute on function public.finalize_qualified_referrals() from public, anon, authenticated;
revoke execute on function public.revoke_referral_reward(text, text) from public, anon, authenticated;
grant execute on function public.qualify_paid_referral(uuid, text, text, text, text, integer, text[]) to service_role;
grant execute on function public.revoke_referral_reward(text, text) to service_role;

-- PostgreSQL cron executes this as the database owner. No HTTP or secrets are required.
create extension if not exists pg_cron with schema pg_catalog;
select cron.unschedule(jobid)
from cron.job
where jobname = 'finalize-qualified-referrals-hourly';

select cron.schedule(
  'finalize-qualified-referrals-hourly',
  '17 * * * *',
  $$select public.finalize_qualified_referrals();$$
);
