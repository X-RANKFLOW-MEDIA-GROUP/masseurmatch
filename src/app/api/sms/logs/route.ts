import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/app/api/_lib/supabase-server'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import type { Conversation } from '@/lib/sms/types'

// GET /api/sms/logs?profile_id=xxx&phone=xxx&limit=50
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request)
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')
    const phone = searchParams.get('phone')
    const limit = parseInt(searchParams.get('limit') ?? '100', 10)
    const view = searchParams.get('view') ?? 'flat' // 'flat' | 'conversations'

    const supabase = createSupabaseAdminClient()

    let query = supabase
      .from('sms_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (profileId) query = query.eq('profile_id', profileId)
    if (phone) {
      query = query.or(`from_number.eq.${phone},to_number.eq.${phone}`)
    }

    const { data: logs, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (view === 'flat') {
      return NextResponse.json({ ok: true, logs: logs ?? [] })
    }

    // Group into conversations
    const convMap = new Map<string, Conversation>()

    for (const log of (logs ?? []).reverse()) {
      const clientPhone = log.direction === 'inbound' ? log.from_number : log.to_number
      const ourPhone = log.direction === 'inbound' ? log.to_number : log.from_number
      const key = `${clientPhone}|${ourPhone}`

      if (!convMap.has(key)) {
        convMap.set(key, {
          client_phone: clientPhone,
          our_phone: ourPhone,
          profile_id: log.profile_id,
          messages: [],
          last_message_at: log.created_at,
          unresolved_alert: false,
          minutes_since_reply: null,
        })
      }
      const conv = convMap.get(key)!
      conv.messages.push(log)
      if (log.created_at > conv.last_message_at) {
        conv.last_message_at = log.created_at
      }
    }

    // Check follow-up alert status
    const { data: alerts } = await supabase
      .from('sms_follow_up_alerts')
      .select('client_phone, our_phone, last_outbound_at')
      .is('resolved_at', null)

    const alertSet = new Set((alerts ?? []).map(a => `${a.client_phone}|${a.our_phone}`))

    const conversations = Array.from(convMap.values()).map(conv => {
      const key = `${conv.client_phone}|${conv.our_phone}`
      const alert = (alerts ?? []).find(a => `${a.client_phone}|${a.our_phone}` === key)
      const minutesSince = alert
        ? Math.floor((Date.now() - new Date(alert.last_outbound_at).getTime()) / 60000)
        : null

      return {
        ...conv,
        unresolved_alert: alertSet.has(key),
        minutes_since_reply: minutesSince,
      }
    })

    // Sort: alerts first, then by recency
    conversations.sort((a, b) => {
      if (a.unresolved_alert !== b.unresolved_alert) return a.unresolved_alert ? -1 : 1
      return b.last_message_at.localeCompare(a.last_message_at)
    })

    return NextResponse.json({ ok: true, conversations })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
