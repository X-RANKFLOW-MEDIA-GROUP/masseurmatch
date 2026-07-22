import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

// GET /api/availability?therapist_id=xxx&date=2026-05-14
export async function GET(request: NextRequest) {
  const supabase = createSupabaseAdminClient()
  const { searchParams } = new URL(request.url)
  const therapistId = searchParams.get('therapist_id')
  const date = searchParams.get('date')

  if (!therapistId) return NextResponse.json({ error: 'therapist_id required' }, { status: 400 })

  const { data: availability } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .eq('is_available', true)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('therapist_id', therapistId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', date ? `${date}T00:00:00Z` : new Date().toISOString())

  return NextResponse.json({ availability: availability ?? [], booked_slots: appointments ?? [] })
}

// POST /api/availability — therapist sets schedule
export async function POST(request: NextRequest) {
  const session = await getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { slots } = await request.json()

  await supabase.from('therapist_availability').delete().eq('therapist_id', session.userId)

  if (slots?.length) {
    const rows = slots.map((slot: Record<string, unknown>) => ({ ...slot, therapist_id: session.userId }))
    const { error } = await supabase.from('therapist_availability').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
