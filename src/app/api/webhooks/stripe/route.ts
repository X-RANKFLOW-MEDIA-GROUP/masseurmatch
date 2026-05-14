import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

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
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createClient()

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
    default:
      break
  }

  return NextResponse.json({ received: true })
}
