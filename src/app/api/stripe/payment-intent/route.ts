import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2025-08-27.basil' })
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const body = await request.json()
  const { appointment_id, amount_cents } = body

  if (!appointment_id || !amount_cents) {
    return NextResponse.json({ error: 'appointment_id and amount_cents are required' }, { status: 400 })
  }

  const { data: appointment, error: apptError } = await supabase
    .from('appointments')
    .select('id, therapist_id, status')
    .eq('id', appointment_id)
    .eq('user_id', session.userId)
    .single()

  if (apptError || !appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  const stripe = getStripe()

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', session.userId)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? session.email,
      name: profile?.full_name ?? undefined,
      metadata: { user_id: session.userId },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', session.userId)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount_cents,
    currency: 'usd',
    customer: customerId,
    metadata: { appointment_id, user_id: session.userId },
    automatic_payment_methods: { enabled: true },
  })

  await supabase.from('payment_transactions').insert({
    user_id: session.userId,
    appointment_id,
    provider: 'stripe',
    provider_transaction_id: paymentIntent.id,
    amount_cents,
    currency: 'usd',
    status: 'pending',
  })

  return NextResponse.json({ client_secret: paymentIntent.client_secret })
}
