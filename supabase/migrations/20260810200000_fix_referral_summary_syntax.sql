-- Fix syntax error in get_referral_summary function.
-- The 'perform * from' syntax is invalid in PostgreSQL.
-- Should be just 'perform public.ensure_referral_code(p_user_id);'

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
  perform public.ensure_referral_code(p_user_id);

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
