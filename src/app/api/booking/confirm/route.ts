import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import { chatWithDeepSeek } from '@/lib/booking/deepseek'
import type { ConversationMessage } from '@/lib/booking/types'

// POST /api/booking/confirm — client selects a slot
// Body: { inquiry_id, date, time }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      inquiry_id: string
      date: string
      time: string
    }

    if (!body.inquiry_id || !body.date || !body.time) {
      return NextResponse.json({ error: 'inquiry_id, date, and time are required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { data: inquiry } = await supabase
      .from('booking_inquiries')
      .select('*')
      .eq('id', body.inquiry_id)
      .single()

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Generate confirmation message from AI
    const history = (inquiry.ai_conversation ?? []) as ConversationMessage[]
    const confirmPrompt = `Client just selected their appointment slot: ${body.date} at ${body.time}.
    Confirm it warmly, let them know it's pending your guy's final confirmation, and give an ETA like "should hear back within the hour".`

    const updatedHistory: ConversationMessage[] = [
      ...history,
      { role: 'user', content: `I'd like to book ${body.date} at ${body.time}`, ts: new Date().toISOString() },
    ]

    const aiConfirm = await chatWithDeepSeek([
      ...updatedHistory,
      { role: 'user', content: confirmPrompt },
    ]) ?? `bet, got you down for ${body.date} at ${body.time} 🙌 just need a quick confirmation from my end — you'll hear back within the hour fr`

    const finalHistory: ConversationMessage[] = [
      ...updatedHistory,
      { role: 'assistant', content: aiConfirm, ts: new Date().toISOString() },
    ]

    const { error } = await supabase
      .from('booking_inquiries')
      .update({
        confirmed_date: body.date,
        confirmed_time: body.time,
        status: 'pending_approval',
        ai_conversation: finalHistory as unknown as never,
      })
      .eq('id', body.inquiry_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, aiMessage: aiConfirm })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
