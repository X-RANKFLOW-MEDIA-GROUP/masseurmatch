import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()

  const { data: txns, error } = await supabase
    .from('payment_transactions')
    .select('id, amount_cents, currency, status, created_at, appointment_id')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch referenced appointments separately
  const appointmentIds = [...new Set(
    (txns ?? []).map(t => t.appointment_id as string).filter(Boolean)
  )]

  const appointmentsById: Record<string, { id: string; starts_at: string | null; therapist_id: string | null }> = {}
  if (appointmentIds.length > 0) {
    const { data: appts } = await supabase
      .from('appointments')
      .select('id, starts_at, therapist_id')
      .in('id', appointmentIds)
    appts?.forEach(a => { appointmentsById[a.id as string] = a as typeof appointmentsById[string] })
  }

  // Collect therapist IDs from appointments and fetch profiles separately
  const therapistIds = [...new Set(
    Object.values(appointmentsById).map(a => a.therapist_id).filter((id): id is string => id !== null)
  )]

  const profilesById: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> = {}
  if (therapistIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', therapistIds)
    profiles?.forEach(p => { profilesById[p.id] = p })
  }

  const transactions = (txns ?? []).map(t => {
    const appt = t.appointment_id ? appointmentsById[t.appointment_id as string] ?? null : null
    return {
      id: t.id,
      amount_cents: t.amount_cents,
      currency: t.currency,
      status: t.status,
      created_at: t.created_at,
      appointment: appt
        ? {
            id: appt.id,
            starts_at: appt.starts_at,
            therapist: appt.therapist_id ? (profilesById[appt.therapist_id] ?? null) : null,
          }
        : null,
    }
  })

  return NextResponse.json({ transactions })
}
