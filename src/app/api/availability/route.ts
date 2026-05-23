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

  if (date) {
    const dayOfWeek = new Date(date).getDay()
    const daySlots = availability?.filter(a => a.day_of_week === dayOfWeek) ?? []

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const { data: booked } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('therapist_id', therapistId)
      .eq('status', 'confirmed')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())

    return NextResponse.json({ slots: daySlots, booked: booked ?? [] })
  }

  return NextResponse.json({ availability: availability ?? [] })
}

// PUT /api/availability - therapist sets their weekly availability
export async function PUT(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const body = await request.json()
  const { slots } = body

  if (!Array.isArray(slots)) return NextResponse.json({ error: 'slots must be an array' }, { status: 400 })

  await supabase.from('therapist_availability').delete().eq('therapist_id', session.userId)

  if (slots.length > 0) {
    const { error } = await supabase.from('therapist_availability').insert(
      slots.map((s: { day_of_week: number; start_time: string; end_time: string }) => ({
        therapist_id: session.userId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      }))
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
