import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, requireAdminSession } from '@/app/api/_lib/supabase-server'
import { errorResponse } from '@/app/api/_lib/http'

// GET /api/sms/alerts — follow-up alerts (90+ min no-reply)
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request)
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('sms_follow_up_alerts')
      .select('*, sms_profiles(twilio_number, profiles(display_name))')
      .is('resolved_at', null)
      .order('last_outbound_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Calculate minutes since last outbound and filter to 90+
    const now = Date.now()
    const alerts = (data ?? [])
      .map(a => ({
        ...a,
        minutes_waiting: Math.floor((now - new Date(a.last_outbound_at).getTime()) / 60000),
      }))
      .filter(a => a.minutes_waiting >= 90)

    return NextResponse.json({ ok: true, alerts, total: alerts.length })
  } catch (err) {
    return errorResponse(err)
  }
}

// POST /api/sms/alerts — resolve an alert
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession(request as unknown as Request)
    const body = await request.json() as { alert_id: string }

    if (!body.alert_id) return NextResponse.json({ error: 'alert_id required' }, { status: 400 })

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from('sms_follow_up_alerts')
      .update({ resolved_at: new Date().toISOString(), resolved_by: session.userId })
      .eq('id', body.alert_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
