-- Standardize referral economics.
-- One paid referral earns one month of Standard entitlement, capped at six lifetime months.
-- Active paid Pro/Elite subscriptions are never downgraded; the Standard bonus begins after
-- the current paid entitlement ends and is activated automatically by sync_stripe_subscription.

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
  v_profile_status text;
  v_profile_period_end timestamptz;
  v_existing_bonus_end timestamptz;
  v_existing_bonus_months integer;
  v_bonus_expiry timestamptz;
  v_has_active_paid_entitlement boolean := false;
begin
  perform public.assert_service_role_caller();

  if p_referred_user_id is null
     or nullif(trim(coalesce(p_stripe_subscription_id, '')), '') is null
     or nullif(trim(coalesce(p_stripe_invoice_id, '')), '') is null then
    return false;
  end if;

  -- Invoice idempotency: the same Stripe payment can never produce two rewards.
  if exists (
    select 1
    from public.referral_signups
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
      p.subscription_status,
      p.current_period_end,
      p.referral_bonus_expires_at,
      p.referral_bonus_months
    into
      v_profile_tier,
      v_profile_status,
      v_profile_period_end,
      v_existing_bonus_end,
      v_existing_bonus_months
    from public.profiles p
    where p.user_id = v_referrer_user_id
    for update;

    v_profile_found := found;

    if v_profile_found then
      v_has_active_paid_entitlement :=
        v_profile_tier in ('standard', 'pro', 'elite')
        and coalesce(v_profile_status, '') in ('active', 'trialing')
        and (v_profile_period_end is null or v_profile_period_end > now());

      -- Queue the bonus after any already-earned referral time and after a current paid period.
      v_bonus_expiry := greatest(
        now(),
        coalesce(v_existing_bonus_end, now()),
        case
          when v_has_active_paid_entitlement then coalesce(v_profile_period_end, now())
          else now()
        end
      ) + interval '1 month';

      if v_has_active_paid_entitlement then
        -- Preserve the user's paid tier today. Only queue a Standard referral entitlement.
        update public.profiles
           set referral_bonus_months = least(6, coalesce(v_existing_bonus_months, 0) + 1),
               referral_bonus_expires_at = v_bonus_expiry,
               referral_bonus_tier = 'standard',
               updated_at = now()
         where user_id = v_referrer_user_id;
      else
        -- Free/inactive users receive Standard immediately.
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
    end if;
  end if;

  return true;
end;
$$;

revoke execute on function public.process_paid_referral(uuid, text, text) from public, anon, authenticated;
grant execute on function public.process_paid_referral(uuid, text, text) to service_role;
