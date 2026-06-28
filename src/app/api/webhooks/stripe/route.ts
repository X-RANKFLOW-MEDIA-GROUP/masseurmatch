import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseWebhookClient } from '@/app/api/_lib/supabase-server'
import type { Json } from '@/integrations/supabase/types'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2025-08-27.basil' })
}

function planKeyToTier(planKey: string | undefined | null): string {
  if (planKey === 'standard') return 'standard'
  if (planKey === 'pro') return 'pro'
  if (planKey === 'elite') return 'elite'
  return 'free'
}

const PHOTO_LIMITS: Record<string, number> = {
  free: 2,
  standard: 6,
  pro: 12,
  elite: 20,
}

const VISIBILITY_LEVELS: Record<string, number> = {
  free: 1,
  standard: 2,
  pro: 3,
  elite: 4,
}

function getCurrentPeriodEnd(sub: Stripe.Subscription): string | null {
  const periodEnd = sub.items?.data?.[0]?.current_period_end
  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000).toISOString() : null
}

function buildSyncArgs(tier: string, sub: Stripe.Subscription, subscriptionStatus?: string | null) {
  const customerId =
    typeof sub.customer === 'string'
      ? sub.customer
      : (sub.customer as Stripe.Customer | null)?.id ?? null

  return {
    p_user_id:                sub.metadata?.user_id ?? null,
    p_stripe_customer_id:     customerId,
    p_stripe_subscription_id: sub.id,
    p_tier:                   tier,
    p_photo_limit:            PHOTO_LIMITS[tier] ?? 2,
    p_visibility_level:       VISIBILITY_LEVELS[tier] ?? 1,
    p_current_period_end:     getCurrentPeriodEnd(sub),
    p_subscription_status:    subscriptionStatus ?? null,
  }
}

async function recordStripeEvent(
  supabase: ReturnType<typeof createSupabaseWebhookClient>,
  event: Stripe.Event,
): Promise<boolean> {
  const { data: existingEvent, error: lookupError } = await supabase
    .from('stripe_events')
    .select('stripe_event_id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingEvent) return false

  const { error: insertError } = await supabase.from('stripe_events').insert({
    stripe_event_id: event.id,
    event_type:      event.type,
    payload:         event as unknown as Json,
    processed_at:    new Date().toISOString(),
  })

  if (insertError) {
    if (insertError.code === '23505') return false
    throw insertError
  }

  return true
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

  const supabase = createSupabaseWebhookClient()

  const shouldProcess = await recordStripeEvent(supabase, event)
  if (!shouldProcess) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { error } = await supabase.rpc('process_stripe_payment_intent_succeeded', {
          p_provider_transaction_id: pi.id,
          p_appointment_id:          pi.metadata.appointment_id ?? null,
        })
        if (error) throw error
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { error } = await supabase.rpc('process_stripe_payment_intent_failed', {
          p_provider_transaction_id: pi.id,
        })
        if (error) throw error
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        const userId = session.metadata?.user_id
        const planKey = session.metadata?.plan_key

        if (!subscriptionId || !userId) break

        const tier = planKeyToTier(planKey)
        const sub = await stripe.subscriptions.retrieve(subscriptionId)

        const { error } = await supabase.rpc('sync_stripe_subscription', {
          ...buildSyncArgs(tier, sub),
          p_user_id:             userId,
          p_subscription_status: null,
        })
        if (error) throw error
        break
      }

      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const tier = planKeyToTier(sub.metadata?.plan_key ?? sub.metadata?.masseurmatch_plan)
        const { error } = await supabase.rpc('sync_stripe_subscription', buildSyncArgs(tier, sub))
        if (error) throw error
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const tier = planKeyToTier(sub.metadata?.plan_key ?? sub.metadata?.masseurmatch_plan)
        const { error } = await supabase.rpc('sync_stripe_subscription', buildSyncArgs(tier, sub, sub.status))
        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { error } = await supabase.rpc('sync_stripe_subscription', buildSyncArgs('free', sub, 'cancelled'))
        if (error) throw error
        break
      }

      case 'identity.verification_session.verified': {
        const vs = event.data.object as Stripe.Identity.VerificationSession
        const userId = vs.metadata?.userId
        if (!userId) break
        const { error } = await supabase.rpc('process_stripe_identity_verified', {
          p_stripe_session_id: vs.id,
          p_user_id:           userId,
        })
        if (error) throw error
        break
      }

      case 'identity.verification_session.requires_input': {
        const vs = event.data.object as Stripe.Identity.VerificationSession
        const { error } = await supabase.rpc('process_stripe_identity_requires_input', {
          p_stripe_session_id: vs.id,
          p_last_error_reason: vs.last_error?.reason ?? null,
        })
        if (error) throw error
        break
      }

      default:
        break
    }
  } catch (error) {
    // Hoisted out of the .update({}) literal: a ternary colon inside the
    // object value confuses validate:db-contract into reading a phantom
    // `message` column on stripe_events.
    const processingError = error instanceof Error ? error.message : 'Unknown Stripe webhook processing error'
    await supabase
      .from('stripe_events')
      .update({
        processing_error: processingError,
        failed_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', event.id)

    throw error
  }

  return NextResponse.json({ received: true })
}
