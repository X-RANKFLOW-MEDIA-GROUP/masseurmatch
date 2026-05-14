import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { appointment_id, amount_cents } = body

  if (!appointment_id || !amount_cents) {
    return NextResponse.json({ error: 'appointment_id and amount_cents are required' }, { status: 400 })
  }

  // Verify appointment belongs to user
  const { data: appointment, error: apptError } = await supabase
    .from('appointments')
    .select('id, therapist_id, status')
    .eq('id', appointment_id)
    .eq('client_id', user.id)
    .single()

  if (apptError || !appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      name: profile?.full_name ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount_cents,
    currency: 'usd',
    customer: customerId,
    metadata: { appointment_id, user_id: user.id },
    automatic_payment_methods: { enabled: true },
  })

  // Save transaction record
  await supabase.from('payment_transactions').insert({
    user_id: user.id,
    appointment_id,
    stripe_payment_intent_id: paymentIntent.id,
    amount_cents,
    currency: 'usd',
    status: 'pending',
  })

  return NextResponse.json({ client_secret: paymentIntent.client_secret })
}
