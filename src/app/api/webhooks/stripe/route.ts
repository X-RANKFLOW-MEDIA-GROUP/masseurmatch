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

const TRIAL_PHOTO_LIMIT = 4

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

  const status = subscriptionStatus ?? sub.status ?? null
  const tierPhotoLimit = PHOTO_LIMITS[tier] ?? 2
  const photoLimit =
    status === 'trialing' && tier !== 'free' ? Math.min(tierPhotoLimit, TRIAL_PHOTO_LIMIT) : tierPhotoLimit

  return {
    p_user_id: sub.metadata?.user_id ?? sub.metadata?.userId ?? "",
    p_stripe_customer_id: customerId ?? "",
    p_stripe_subscription_id: sub.id,
    p_tier: tier,
    p_photo_limit: photoLimit,
    p_visibility_level: VISIBILITY_LEVELS[tier] ?? 1,
    p_current_period_end: getCurrentPeriodEnd(sub) ?? new Date().toISOString(),
    p_subscription_status: status ?? "",
  }
}

async function recordStripeEvent(
  supabase: ReturnType<typeof createSupabaseWebhookClient>,
  event: Stripe.Event,
): Promise<boolean> {
  const { data: existingEvent, error: lookupError } = await supabase
    .from('stripe_events')
    .select('stripe_event_id, processing_error')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingEvent && !existingEvent.processing_error) return false
  if (existingEvent) {
    const { error: retryError } = await supabase
      .from('stripe_events')
      .update({ payload: event as unknown as Json, processing_error: null, failed_at: null })
      .eq('stripe_event_id', event.id)
    if (retryError) throw retryError
    return true
  }

  const { error: insertError } = await supabase.from('stripe_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Json,
    processed_at: new Date().toISOString(),
  })

  if (insertError) {
    if (insertError.code === '23505') return false
    throw insertError
  }

  return true
}

type InvoicePaymentLite = {
  status?: string | null
  payment?: {
    type?: string | null
    payment_intent?: string | Stripe.PaymentIntent | null
  } | null
}

async function getReferralPaymentSignals(stripe: Stripe, invoiceId: string) {
  const invoicePayments = stripe.invoicePayments as unknown as {
    list(params: { invoice: string; limit?: number }): Promise<{ data: InvoicePaymentLite[] }>
  }
  const payments = await invoicePayments.list({ invoice: invoiceId, limit: 10 })
  const invoicePayment = payments.data.find(
    (item) => item.status === 'paid' && item.payment?.type === 'payment_intent' && item.payment.payment_intent,
  )

  const paymentIntentRef = invoicePayment?.payment?.payment_intent
  const paymentIntentId = typeof paymentIntentRef === 'string' ? paymentIntentRef : paymentIntentRef?.id
  if (!paymentIntentId) {
    return { chargeId: null, fingerprint: null, riskScore: 0, riskReasons: [] as string[] }
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] })
  const latestCharge = paymentIntent.latest_charge
  const charge = typeof latestCharge === 'string' ? await stripe.charges.retrieve(latestCharge) : latestCharge

  const fingerprint = charge?.payment_method_details?.card?.fingerprint ?? null
  const riskLevel = charge?.outcome?.risk_level ?? null
  let riskScore = 0
  const riskReasons: string[] = []

  if (riskLevel === 'highest') {
    riskScore += 70
    riskReasons.push('stripe_risk_highest')
  } else if (riskLevel === 'elevated') {
    riskScore += 30
    riskReasons.push('stripe_risk_elevated')
  }

  return { chargeId: charge?.id ?? null, fingerprint, riskScore, riskReasons }
}

async function processPaidReferral(
  supabase: ReturnType<typeof createSupabaseWebhookClient>,
  stripe: Stripe,
  invoice: Stripe.Invoice,
) {
  if (invoice.status !== 'paid' || invoice.amount_paid <= 0) return

  const invoiceId = invoice.id
  if (!invoiceId) return

  const subscriptionId =
    typeof invoice.parent?.subscription_details?.subscription === 'string'
      ? invoice.parent.subscription_details.subscription
      : invoice.parent?.subscription_details?.subscription?.id

  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id ?? subscription.metadata?.userId
  if (!userId) return

  const signals = await getReferralPaymentSignals(stripe, invoiceId)
  const { error } = await (supabase.rpc as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>)('qualify_paid_referral', {
    p_referred_user_id: userId,
    p_stripe_subscription_id: subscriptionId,
    p_stripe_invoice_id: invoiceId,
    p_stripe_charge_id: signals.chargeId,
    p_payment_fingerprint: signals.fingerprint,
    p_risk_score: signals.riskScore,
    p_risk_reasons: signals.riskReasons,
  })

  if (error) throw new Error(error.message)
}

async function revokeReferralForCharge(
  supabase: ReturnType<typeof createSupabaseWebhookClient>,
  chargeId: string | null | undefined,
  reason: string,
) {
  if (!chargeId) return
  const { error } = await (supabase.rpc as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>)('revoke_referral_reward', {
    p_stripe_charge_id: chargeId,
    p_reason: reason,
  })
  if (error) throw new Error(error.message)
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
  if (!shouldProcess) return NextResponse.json({ received: true, duplicate: true })

  try {
    switch (event.type) {
      case 'invoice.paid': {
        await processPaidReferral(supabase, stripe, event.data.object as Stripe.Invoice)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        if (charge.refunded) await revokeReferralForCharge(supabase, charge.id, 'stripe_full_refund')
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
        await revokeReferralForCharge(supabase, chargeId, 'stripe_dispute_created')
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        const userId = session.metadata?.user_id ?? session.metadata?.userId
        const planKey = session.metadata?.plan_key ?? session.metadata?.planKey
        if (!subscriptionId || !userId) break

        const tier = planKeyToTier(planKey)
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const { error } = await supabase.rpc('sync_stripe_subscription', { ...buildSyncArgs(tier, sub), p_user_id: userId })
        if (error) throw error
        break
      }

      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const tier = planKeyToTier(sub.metadata?.plan_key ?? sub.metadata?.planKey ?? sub.metadata?.masseurmatch_plan)
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
          p_user_id: userId,
        })
        if (error) throw error
        break
      }

      case 'identity.verification_session.requires_input': {
        const vs = event.data.object as Stripe.Identity.VerificationSession
        const { error } = await supabase.rpc('process_stripe_identity_requires_input', {
          p_stripe_session_id: vs.id,
          p_last_error_reason: vs.last_error?.reason || undefined,
        })
        if (error) throw error
        break
      }

      default:
        break
    }
  } catch (error) {
    const processingError = error instanceof Error ? error.message : 'Unknown Stripe webhook processing error'
    await supabase
      .from('stripe_events')
      .update({ processing_error: processingError, failed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)
    throw error
  }

  const { error: completionError } = await supabase
    .from('stripe_events')
    .update({ processing_error: null, failed_at: null, processed_at: new Date().toISOString() })
    .eq('stripe_event_id', event.id)
  if (completionError) throw completionError

  return NextResponse.json({ received: true })
}
