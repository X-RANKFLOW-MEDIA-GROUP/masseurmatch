import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, requireAdminSession } from '@/app/api/_lib/supabase-server'
import { chatWithDeepSeek } from '@/lib/booking/deepseek'
import { updateInquiryRow } from '@/lib/booking/sheets'
import type { BookingInquiry, ConversationMessage } from '@/lib/booking/types'

// POST /api/booking/approve — admin approves or denies a booking inquiry
// Body: { inquiry_id, action: 'approve' | 'deny', admin_notes? }
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession(request)
    const body = await request.json() as {
      inquiry_id: string
      action: 'approve' | 'deny'
      admin_notes?: string
    }

    if (!body.inquiry_id || !['approve', 'deny'].includes(body.action)) {
      return NextResponse.json({ error: 'inquiry_id and action (approve|deny) required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { data: inquiry } = await supabase
      .from('booking_inquiries')
      .select('*')
      .eq('id', body.inquiry_id)
      .single()

    if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    const typed = inquiry as unknown as BookingInquiry
    const history = (typed.ai_conversation ?? []) as ConversationMessage[]

    // Generate AI notification message for the client
    let aiMessage: string

    if (body.action === 'approve') {
      const approvalPrompt = `Great news — the booking has been CONFIRMED for ${typed.confirmed_date} at ${typed.confirmed_time}.
      Send a short, excited confirmation message to the client. Keep it warm, casual, real.`

      aiMessage = await chatWithDeepSeek([
        ...history,
        { role: 'user', content: approvalPrompt },
      ]) ?? `yo it's confirmed! 🎉 you're all set for ${typed.confirmed_date} at ${typed.confirmed_time}. see you then fr`
    } else {
      const denyPrompt = `Unfortunately the booking for ${typed.confirmed_date} at ${typed.confirmed_time} can't be confirmed.
      Let the client down easy, apologize, and offer to find them another time. Keep it natural and warm, not robotic.`

      aiMessage = await chatWithDeepSeek([
        ...history,
        { role: 'user', content: denyPrompt },
      ]) ?? `hey, so sorry but that slot won't work out 😔 let's find you something else — what other dates/times work for you?`
    }

    const newStatus: BookingInquiry['status'] = body.action === 'approve' ? 'approved' : 'denied'

    const finalHistory: ConversationMessage[] = [
      ...history,
      { role: 'assistant', content: aiMessage, ts: new Date().toISOString() },
    ]

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      admin_notes: body.admin_notes ?? typed.admin_notes,
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
      ai_conversation: finalHistory,
    }

    // On approval, create an appointment record if confirmed_date/time are set
    if (body.action === 'approve' && typed.confirmed_date && typed.confirmed_time && typed.therapist_id) {
      const startTime = new Date(`${typed.confirmed_date}T${typed.confirmed_time}:00`)
      const endTime = new Date(startTime.getTime() + (typed.duration_minutes ?? 60) * 60 * 1000)

      const { data: appt } = await supabase
        .from('appointments')
        .insert({
          user_id: session.userId, // placeholder — in full impl would be client's auth id
          therapist_id: typed.therapist_id,
          starts_at: startTime.toISOString(),
          ends_at: endTime.toISOString(),
          notes: `Hotel: ${typed.client_hotel ?? 'N/A'} | Inquiry: ${typed.id}`,
          status: 'confirmed',
        })
        .select('id')
        .single()

      if (appt) {
        updatePayload.appointment_id = appt.id
      }
    }

    const { data: updated, error } = await supabase
      .from('booking_inquiries')
      .update(updatePayload as never)
      .eq('id', body.inquiry_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Sync to Sheets
    const fullInquiry = updated as unknown as BookingInquiry
    if (fullInquiry.sheets_row_id) {
      await updateInquiryRow(fullInquiry.sheets_row_id, fullInquiry)
    }

    return NextResponse.json({ ok: true, status: newStatus, aiMessage })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// GET /api/booking/approve — get a single inquiry (admin)
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('booking_inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, inquiry: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
