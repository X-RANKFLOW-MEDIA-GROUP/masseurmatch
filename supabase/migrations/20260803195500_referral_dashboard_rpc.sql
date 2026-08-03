-- Keep referral dashboard reads behind a service-role RPC so application code
-- does not depend on generated Supabase table types before the production schema
-- types are regenerated.

create or replace function public.get_referral_dashboard(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_summary jsonb;
  v_referrals jsonb;
begin
  perform public.assert_service_role_caller();

  v_summary := public.get_referral_summary(p_user_id);

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', recent.id,
        'payment_status', recent.payment_status,
        'reward_months', recent.reward_months,
        'paid_at', recent.paid_at,
        'created_at', recent.created_at
      ) order by recent.created_at desc
    ),
    '[]'::jsonb
  )
  into v_referrals
  from (
    select
      rs.id,
      rs.payment_status,
      rs.reward_months,
      rs.paid_at,
      rs.created_at
    from public.referral_signups rs
    where rs.referrer_user_id = p_user_id
    order by rs.created_at desc
    limit 25
  ) recent;

  return jsonb_build_object(
    'summary', coalesce(v_summary, '{}'::jsonb),
    'referrals', v_referrals
  );
end;
$$;

revoke execute on function public.get_referral_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.get_referral_dashboard(uuid) to service_role;
