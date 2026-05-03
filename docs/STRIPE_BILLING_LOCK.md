# Stripe Billing Lock

## Product boundary

Stripe in MasseurMatch is for therapist/provider subscriptions and platform monetization only.

Forbidden:

- Visitor booking payments.
- Client appointment payments.
- Internal booking checkout.

## Canonical subscription source

Canonical app state lives on `public.profiles`:

- `subscription_tier`
- `subscription_status`
- `stripe_customer_id`
- `stripe_subscription_id`
- `current_period_end`
- `photo_limit`
- `visibility_level`

Stripe is the payment processor source. The app profile is the product entitlement source.

## Webhook rules

- Signature verification is mandatory in production.
- Invalid signature returns 400.
- Missing production config returns 500.
- Persistence failure returns 5xx so Stripe can retry.
- Fake success is forbidden on critical failures.
- Local dev may parse unsigned events only when no webhook secret is configured and environment is not production.

## Idempotency target

In memory idempotency is not production grade.

Required durable target:

- `stripe_webhook_events`

Minimum columns:

- `id uuid primary key default gen_random_uuid()`
- `stripe_event_id text unique not null`
- `event_type text not null`
- `processed_at timestamptz`
- `status text not null`
- `error_message text`
- `created_at timestamptz default timezone('utc', now())`

Processing rule:

1. Insert `stripe_event_id` first.
2. If unique conflict, return success as duplicate.
3. Process event.
4. Mark processed or failed.
5. Return retryable 5xx when processing fails before durable completion.

## Tier mapping

Allowed tiers:

- `free`
- `standard`
- `pro`
- `elite`

Stripe price IDs must come from env. No hardcoded live price IDs in code.

## Required event handling

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Expected behavior:

- Checkout completed assigns the resolved tier.
- Subscription updated syncs tier/status/period.
- Subscription deleted downgrades to free and resets entitlements.

## Required tests

- Invalid signature returns 400.
- Missing production config returns 500.
- Duplicate event is idempotent.
- Checkout completed updates `subscription_tier`.
- Subscription updated updates entitlement fields.
- Subscription deleted downgrades to free.

## Forbidden patterns

- Returning 200 for invalid signature.
- Returning 200 for persistence failure.
- Updating `_tier` but not `subscription_tier`.
- Reading env price IDs inconsistently.
- Hardcoding live secrets or price IDs.
