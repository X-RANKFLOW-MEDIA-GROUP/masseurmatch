import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { transaction_id, reason } = await request.json()

  const { data: tx, error: txError } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('id', transaction_id)
    .eq('user_id', user.id)
    .single()

  if (txError || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  if (tx.status !== 'succeeded') return NextResponse.json({ error: 'Only completed payments can be refunded' }, { status: 400 })

  const refund = await stripe.refunds.create({
    payment_intent: tx.stripe_payment_intent_id,
    reason: reason ?? 'requested_by_customer',
  })

  await supabase
    .from('payment_transactions')
    .update({ status: 'refunded', stripe_refund_id: refund.id, updated_at: new Date().toISOString() })
    .eq('id', transaction_id)

  return NextResponse.json({ refund_id: refund.id, status: refund.status })
}
