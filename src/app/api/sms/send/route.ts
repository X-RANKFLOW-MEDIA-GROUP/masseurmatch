import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/app/api/_lib/supabase-server'
import { sendSms, logSms, upsertFollowUpAlert } from '@/lib/sms/twilio-utils'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

// POST /api/sms/send — manual outbound SMS (admin or operator)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession(request as unknown as Request)

    const body = await request.json() as {
      to: string
      message: string
      profile_id?: string
      from_number?: string
    }

    if (!body.to || !body.message) {
      return NextResponse.json({ error: 'to and message are required' }, { status: 400 })
    }

    // Get the from number: from profile or env default
    let fromNumber = body.from_number ?? process.env.TWILIO_PHONE_NUMBER ?? ''

    if (body.profile_id && !body.from_number) {
      const supabase = createSupabaseAdminClient()
      const { data } = await supabase
        .from('sms_profiles')
        .select('twilio_number')
        .eq('id', body.profile_id)
        .maybeSingle()
      if (data?.twilio_number) fromNumber = data.twilio_number
    }

    const sid = await sendSms(body.to, body.message, fromNumber)
    if (!sid) return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })

    await logSms({
      profile_id: body.profile_id ?? null,
      from_number: fromNumber,
      to_number: body.to,
      direction: 'outbound',
      body: body.message,
      twilio_sid: sid,
      intent: null,
      status: 'sent',
      is_manual: true,
      booking_inquiry_id: null,
    })

    await upsertFollowUpAlert(body.profile_id ?? null, body.to, fromNumber, 'outbound')

    return NextResponse.json({ ok: true, sid })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
