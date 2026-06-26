import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, requireAdminSession } from '@/app/api/_lib/supabase-server'
import { RouteError } from '@/app/api/_lib/http'

function errResponse(err: unknown) {
  if (err instanceof RouteError) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status })
  }
  const message = err instanceof Error ? err.message : 'Unknown error'
  return NextResponse.json({ ok: false, error: message }, { status: 500 })
}

// GET /api/sms/alerts — follow-up alerts (90+ min no-reply)
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request)
  } catch (err) { return errResponse(err) }

  try {
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('sms_follow_up_alerts')
      .select('*, sms_profiles(twilio_number, profiles(display_name))')
      .is('resolved_at', null)
      .order('last_outbound_at', { ascending: true })

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    const now = Date.now()
    const alerts = (data ?? [])
      .map(a => ({
        ...a,
        minutes_waiting: Math.floor((now - new Date(a.last_outbound_at).getTime()) / 60000),
      }))
      .filter(a => a.minutes_waiting >= 90)

    return NextResponse.json({ ok: true, alerts, total: alerts.length })
  } catch (err) { return errResponse(err) }
}

// POST /api/sms/alerts — resolve an alert
export async function POST(request: NextRequest) {
  let session: Awaited<ReturnType<typeof requireAdminSession>>
  try {
    session = await requireAdminSession(request)
  } catch (err) { return errResponse(err) }

  try {
    const body = await request.json() as { alert_id: string }
    if (!body.alert_id) return NextResponse.json({ ok: false, error: 'alert_id required' }, { status: 400 })

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from('sms_follow_up_alerts')
      .update({ resolved_at: new Date().toISOString(), resolved_by: session.userId })
      .eq('id', body.alert_id)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) { return errResponse(err) }
}
