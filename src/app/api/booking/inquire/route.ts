import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createInquiryAndRespond, continueConversation, runBackgroundIntelligence } from '@/lib/booking/ai-responder'
import type { NewInquiryInput } from '@/lib/booking/types'

// POST /api/booking/inquire — submit a new inquiry or reply to an existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as NewInquiryInput & {
      inquiry_id?: string
      client_message?: string
    }

    // Existing conversation: client replied
    if (body.inquiry_id && body.client_message) {
      const reply = await continueConversation(body.inquiry_id, body.client_message)
      return NextResponse.json({ ok: true, aiMessage: reply })
    }

    // New inquiry
    const input: NewInquiryInput = {
      client_name: body.client_name,
      client_phone: body.client_phone,
      client_email: body.client_email,
      client_hotel: body.client_hotel,
      service_type: body.service_type,
      preferred_date: body.preferred_date,
      preferred_time: body.preferred_time,
      duration_minutes: body.duration_minutes,
      message: body.message,
      source: body.source ?? 'website',
      therapist_id: body.therapist_id,
    }

    const result = await createInquiryAndRespond(input)

    // If we sent a hold message, kick off background intelligence (fire and forget)
    if (!result.immediate) {
      // Use waitUntil equivalent: trigger async without blocking response
      Promise.resolve().then(() => runBackgroundIntelligence(result.inquiry.id)).catch(() => undefined)
    }

    return NextResponse.json({
      ok: true,
      inquiry_id: result.inquiry.id,
      aiMessage: result.aiMessage,
      immediate: result.immediate,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// GET /api/booking/inquire — list inquiries (admin or provider)
export async function GET(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const therapistId = searchParams.get('therapist_id')

  let query = supabase
    .from('booking_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  if (therapistId) query = query.eq('therapist_id', therapistId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, inquiries: data ?? [] })
}
