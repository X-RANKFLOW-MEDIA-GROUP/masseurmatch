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
  v_tier text := case when p_tier in ('free','standard','pro','elite') then p_tier else 'free' end;
begin
  if p_user_id is null or p_stripe_subscription_id is null then
    raise exception 'user and Stripe subscription are required' using errcode='22023';
  end if;

  if not exists (select 1 from public.profiles where id=p_user_id or user_id=p_user_id) then
    raise exception 'profile not found for subscription user' using errcode='23503';
  end if;

  update public.profiles
     set stripe_customer_id = p_stripe_customer_id,
         stripe_subscription_id = p_stripe_subscription_id,
         subscription_tier = v_tier,
         subscription_status = v_status,
         current_period_end = p_current_period_end,
         photo_limit = coalesce(p_photo_limit, photo_limit),
         visibility_level = coalesce(p_visibility_level, visibility_level),
         updated_at = now()
   where id=p_user_id or user_id=p_user_id;

  update public.subscriptions
     set tier=v_tier, status=v_status, stripe_customer_id=p_stripe_customer_id,
         stripe_subscription_id=p_stripe_subscription_id,
         current_period_end=p_current_period_end, updated_at=now()
   where user_id=p_user_id;

  if not found then
    insert into public.subscriptions
      (user_id, tier, status, stripe_customer_id, stripe_subscription_id, current_period_end)
    values
      (p_user_id, v_tier, v_status, p_stripe_customer_id, p_stripe_subscription_id, p_current_period_end);
  end if;
end;
$$;

create or replace function public.process_stripe_payment_intent_succeeded(
  p_provider_transaction_id text,
  p_appointment_id uuid default null
)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.payment_transactions
     set status='succeeded', updated_at=now()
   where provider_transaction_id=p_provider_transaction_id
      or stripe_payment_intent_id=p_provider_transaction_id;
end; $$;

create or replace function public.process_stripe_payment_intent_failed(
  p_provider_transaction_id text
)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.payment_transactions
     set status='failed', updated_at=now()
   where provider_transaction_id=p_provider_transaction_id
      or stripe_payment_intent_id=p_provider_transaction_id;
end; $$;

create or replace function public.process_stripe_identity_verified(
  p_stripe_session_id text,
  p_user_id uuid
)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.identity_verifications
     set status='verified', updated_at=now()
   where user_id=p_user_id
     and (stripe_session_id=p_stripe_session_id or stripe_verification_session_id=p_stripe_session_id);

  update public.profiles set is_verified_identity=true, identity_verified_at=now(), updated_at=now()
   where id=p_user_id or user_id=p_user_id;
end; $$;

create or replace function public.process_stripe_identity_requires_input(
  p_stripe_session_id text,
  p_last_error_reason text default null
)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.identity_verifications
     set status='requires_input', last_error=p_last_error_reason, updated_at=now()
   where stripe_session_id=p_stripe_session_id or stripe_verification_session_id=p_stripe_session_id;
end; $$;

revoke execute on function public.sync_stripe_subscription(uuid,text,text,text,integer,integer,timestamptz,text) from anon, authenticated;
revoke execute on function public.process_stripe_payment_intent_succeeded(text,uuid) from anon, authenticated;
revoke execute on function public.process_stripe_payment_intent_failed(text) from anon, authenticated;
revoke execute on function public.process_stripe_identity_verified(text,uuid) from anon, authenticated;
revoke execute on function public.process_stripe_identity_requires_input(text,text) from anon, authenticated;
