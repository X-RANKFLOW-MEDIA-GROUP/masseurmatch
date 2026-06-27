import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

const STRIPE_EVENTS_TABLE = ['stripe', 'events'].join('_')

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2025-08-27.basil' })
}

// Map plan keys (from subscription metadata) to profile tier values.
function planKeyToTier(planKey: string | undefined | null): string {
  if (planKey === 'standard') return 'standard'
  if (planKey === 'pro') return 'pro'
  if (planKey === 'elite') return 'elite'
  return 'free'
}

// Photo limits per subscription tier.
const PHOTO_LIMITS: Record<string, number> = {
  free: 2,
  standard: 6,
  pro: 12,
  elite: 20,
}

// Visibility levels per subscription tier.
const VISIBILITY_LEVELS: Record<string, number> = {
  free: 1,
  standard: 2,
  pro: 3,
  elite: 4,
}

// Resolve the current billing period end. Under the Stripe "Basil" API version
// this lives on the subscription items, not on the subscription itself.
function getCurrentPeriodEnd(sub: Stripe.Subscription): string | null {
  const periodEnd = sub.items?.data?.[0]?.current_period_end
  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000).toISOString() : null
}

// Build the profile update payload for a subscription sync.
function buildTierUpdate(tier: string, sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : (sub.customer as Stripe.Customer | null)?.id ?? null

  return {
    subscription_tier: tier,
    _tier: tier,
    photo_limit: PHOTO_LIMITS[tier] ?? 2,
    visibility_level: VISIBILITY_LEVELS[tier] ?? 1,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    current_period_end: getCurrentPeriodEnd(sub),
    updated_at: new Date().toISOString(),
  }
}

async function recordStripeEvent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  event: Stripe.Event,
): Promise<boolean> {
  const db = supabase as any
  const { data: existingEvent, error: lookupError } = await db
    .from('stripe_events')
    .select('event_id')
    .eq('event_id', event.id)
    .maybeSingle()

  if (lookupError) {
    throw lookupError
  }

  if (existingEvent) {
    return false
  }

  const { error: insertError } = await db.from('stripe_events').insert({
    event_id: event.id,
    type: event.type,
    payload: event,
    processed_at: new Date().toISOString(),
  })

  if (insertError) {
    // If a retry races with another invocation, treat the unique violation as
    // already processed and return success to Stripe.
    if (insertError.code === '23505') {
      return false
    }
    throw insertError
  }

  return true
}

// Update the profiles row that belongs to a Stripe customer/subscription.
// Resolves user_id from subscription metadata, falling back to stripe_customer_id lookup.
async function syncSubscriptionToProfile(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  sub: Stripe.Subscription,
  tier: string,
) {
  const userId = sub.metadata?.user_id
  const update = buildTierUpdate(tier, sub)

  if (userId) {
    await supabase.from('profiles').update(update).eq('user_id', userId)
    return
  }

  // Fall back to matching by stripe_customer_id.
  if (update.stripe_customer_id) {
    await supabase.from('profiles').update(update).eq('stripe_customer_id', update.stripe_customer_id)
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const shouldProcess = await recordStripeEvent(supabase, event)
  if (!shouldProcess) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      // Payment intent
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        await supabase
          .from('payment_transactions')
          .update({ status: 'succeeded' })
          .eq('provider_transaction_id', pi.id)

        if (pi.metadata.appointment_id) {
          await supabase
            .from('appointments')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', pi.metadata.appointment_id)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        await supabase
          .from('payment_transactions')
          .update({ status: 'failed' })
          .eq('provider_transaction_id', pi.id)
        break
      }

      // Checkout completed — sync tier on initial purchase
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        const userId = session.metadata?.user_id
        const planKey = session.metadata?.plan_key

        if (!subscriptionId || !userId) break

        const tier = planKeyToTier(planKey)
        // Retrieve the subscription so we capture the billing period end alongside
        // the tier on the initial purchase.
        const sub = await stripe.subscriptions.retrieve(subscriptionId)

        await supabase.from('profiles').update(buildTierUpdate(tier, sub)).eq('user_id', userId)

        break
      }

      // Subscription created — sync tier when a new subscription is created
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const planKey = sub.metadata?.plan_key ?? sub.metadata?.masseurmatch_plan
        const tier = planKeyToTier(planKey)
        await syncSubscriptionToProfile(supabase, sub, tier)
        break
      }

      // Subscription updated — re-sync tier on plan changes
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const planKey = sub.metadata?.plan_key ?? sub.metadata?.masseurmatch_plan
        const tier = planKeyToTier(planKey)
        await syncSubscriptionToProfile(supabase, sub, tier)

        // Also update the legacy subscriptions table for backwards compatibility.
        await supabase
          .from('subscriptions')
          .update({ status: sub.status, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // Subscription deleted — downgrade to free
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await syncSubscriptionToProfile(supabase, sub, 'free')

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // Identity verification
      case 'identity.verification_session.verified': {
        const vs = event.data.object as Stripe.Identity.VerificationSession
        const userId = vs.metadata?.userId
        if (!userId) break

        const now = new Date().toISOString()

        // Mark the verification row as verified.
        await supabase
          .from('identity_verifications')
          .update({ status: 'verified', updated_at: now })
          .eq('stripe_session_id', vs.id)

        // Auto-approve the profile when identity passes, but only if it is
        // pending review — never demote an already-approved profile.
        await supabase
          .from('profiles')
          .update({
            is_verified_identity: true,
            verification_status: 'verified',
            status: 'approved',
            approved_at: now,
            updated_at: now,
          })
          .eq('user_id', userId)
          .in('status', ['pending_approval', 'under_review', 'changes_requested'])

        break
      }

      case 'identity.verification_session.requires_input': {
        const vs = event.data.object as Stripe.Identity.VerificationSession
        await supabase
          .from('identity_verifications')
          .update({
            status: 'requires_input',
            last_error: vs.last_error?.reason ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', vs.id)
        break
      }

      default:
        break
    }
  } catch (error) {
    const db = supabase as any
    const processingError =
      error instanceof Error ? error.message : 'Unknown Stripe webhook processing error'
    await db
      .from('stripe_events')
      .update({
        processing_error: processingError,
        failed_at: new Date().toISOString(),
      })
      .eq('event_id', event.id)

    throw error
  }

  return NextResponse.json({ received: true })
}
