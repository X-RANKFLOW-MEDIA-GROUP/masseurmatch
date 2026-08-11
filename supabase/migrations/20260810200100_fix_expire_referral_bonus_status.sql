-- Fix invalid subscription status in expire_referral_bonus_for_user function.
-- The 'trialing' status does not exist in the subscriptions table.
-- Valid statuses are: 'active', 'past_due', 'canceled'

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
    and s.status = 'active'
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
           subscription_status = 'active',
           current_period_end = null,
           updated_at = now()
     where user_id = p_user_id;
  end if;

  return true;
end;
$$;
