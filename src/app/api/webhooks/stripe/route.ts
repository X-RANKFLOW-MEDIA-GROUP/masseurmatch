import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2025-08-27.basil' })
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

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('payment_transactions')
        .update({ status: 'succeeded', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', pi.id)

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
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', pi.id)
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const status = event.type === 'customer.subscription.deleted' ? 'cancelled' : sub.status
      await supabase
        .from('subscriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    // ── Identity verification ────────────────────────────────────────────────
    case 'identity.verification_session.verified': {
      const vs = event.data.object as Stripe.Identity.VerificationSession
      const userId = vs.metadata?.userId
      if (!userId) break

      const now = new Date().toISOString()

      // Mark the verification row as verified
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
        .in('status', ['pending_approval', 'under_review', 'submitted', 'changes_requested'])

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

  return NextResponse.json({ received: true })
}
