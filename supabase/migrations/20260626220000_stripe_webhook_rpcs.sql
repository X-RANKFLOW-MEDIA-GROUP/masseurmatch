-- Atomic RPCs for Stripe webhook processing.
-- Each function wraps all DB mutations for one event type in a single transaction,
-- eliminating the partial-failure window that existed with sequential JS-side updates.

create or replace function process_stripe_payment_intent_succeeded(
  p_provider_transaction_id text,
  p_appointment_id          text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  update payment_transactions
     set status = 'succeeded'
   where provider_transaction_id = p_provider_transaction_id;

  if p_appointment_id is not null then
    update appointments
       set status = 'confirmed', updated_at = now()
     where id = p_appointment_id::uuid;
  end if;
end;
$$;

create or replace function process_stripe_payment_intent_failed(
  p_provider_transaction_id text
) returns void language plpgsql security definer set search_path = public as $$
begin
  update payment_transactions
     set status = 'failed'
   where provider_transaction_id = p_provider_transaction_id;
end;
$$;

-- Used by subscription.created / .updated / .deleted and checkout.session.completed.
-- p_subscription_status: pass sub.status to also sync the legacy subscriptions table;
--   pass NULL to skip the legacy table (e.g. on the initial checkout event).
create or replace function sync_stripe_subscription(
  p_user_id                text,
  p_stripe_customer_id     text,
  p_stripe_subscription_id text,
  p_tier                   text,
  p_photo_limit            int,
  p_visibility_level       int,
  p_current_period_end     timestamptz,
  p_subscription_status    text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_now timestamptz := now();
begin
  if p_user_id is not null then
    update profiles
       set subscription_tier      = p_tier,
           _tier                  = p_tier,
           photo_limit            = p_photo_limit,
           visibility_level       = p_visibility_level,
           stripe_customer_id     = p_stripe_customer_id,
           stripe_subscription_id = p_stripe_subscription_id,
           current_period_end     = p_current_period_end,
           updated_at             = v_now
     where user_id = p_user_id::uuid;
  elsif p_stripe_customer_id is not null then
    update profiles
       set subscription_tier      = p_tier,
           _tier                  = p_tier,
           photo_limit            = p_photo_limit,
           visibility_level       = p_visibility_level,
           stripe_customer_id     = p_stripe_customer_id,
           stripe_subscription_id = p_stripe_subscription_id,
           current_period_end     = p_current_period_end,
           updated_at             = v_now
     where stripe_customer_id = p_stripe_customer_id;
  end if;

  if p_subscription_status is not null then
    update subscriptions
       set status     = p_subscription_status,
           updated_at = v_now
     where stripe_subscription_id = p_stripe_subscription_id;
  end if;
end;
$$;

-- Atomically marks identity verification as verified and auto-approves the profile
-- (only if it is still in a pending/review state — never demotes an approved profile).
create or replace function process_stripe_identity_verified(
  p_stripe_session_id text,
  p_user_id           text
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_now timestamptz := now();
begin
  update identity_verifications
     set status     = 'verified',
         updated_at = v_now
   where stripe_session_id = p_stripe_session_id;

  update profiles
     set is_verified_identity = true,
         verification_status  = 'verified',
         status               = 'approved',
         approved_at          = v_now,
         updated_at           = v_now
   where user_id = p_user_id::uuid
     and status in ('pending_approval', 'under_review', 'changes_requested');
end;
$$;

create or replace function process_stripe_identity_requires_input(
  p_stripe_session_id text,
  p_last_error_reason text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  update identity_verifications
     set status     = 'requires_input',
         last_error = p_last_error_reason,
         updated_at = now()
   where stripe_session_id = p_stripe_session_id;
end;
$$;
