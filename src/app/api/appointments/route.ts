import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const role = searchParams.get('role') ?? 'client'

  let query = supabase
    .from('appointments')
    .select(`
      *,
      therapist:therapist_id(id, full_name, avatar_url, slug),
      client:client_id(id, full_name, avatar_url)
    `)
    .order('start_time', { ascending: true })

  if (role === 'therapist') {
    query = query.eq('therapist_id', session.userId)
  } else {
    query = query.eq('client_id', session.userId)
  }

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointments: data })
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const body = await request.json()
  const { therapist_id, start_time, end_time, service_type, notes, location_type } = body

  if (!therapist_id || !start_time || !end_time) {
    return NextResponse.json({ error: 'therapist_id, start_time, end_time are required' }, { status: 400 })
  }

  // Check for double-booking
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('therapist_id', therapist_id)
    .eq('status', 'confirmed')
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .maybeSingle()

  if (conflict) {
    return NextResponse.json({ error: 'Time slot is not available' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      client_id: session.userId,
      therapist_id,
      start_time,
      end_time,
      service_type: service_type ?? 'massage',
      notes: notes ?? null,
      location_type: location_type ?? 'client_location',
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointment: data }, { status: 201 })
}
