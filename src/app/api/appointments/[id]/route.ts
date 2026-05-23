import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { data: appt, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .or(`client_id.eq.${session.userId},therapist_id.eq.${session.userId}`)
    .single()

  if (error || !appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

  // Fetch therapist and client profiles separately (FKs point to auth.users, profiles.id = auth user UUID)
  const profileIds = [...new Set([appt.therapist_id as string, appt.client_id as string].filter(Boolean))]
  const profilesById: Record<string, { id: string; full_name: string | null; avatar_url: string | null; slug: string | null; phone: string | null }> = {}
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, slug, phone')
      .in('id', profileIds)
    profiles?.forEach(p => { profilesById[p.id] = p })
  }

  return NextResponse.json({
    appointment: {
      ...appt,
      therapist: appt.therapist_id ? (profilesById[appt.therapist_id as string] ?? null) : null,
      client: appt.client_id ? (profilesById[appt.client_id as string] ?? null) : null,
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const body = await request.json()
  const { status, notes, start_time, end_time } = body

  const allowedStatuses = ['confirmed', 'cancelled', 'completed', 'no_show']
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status, notes, start_time, end_time, updated_at: new Date().toISOString() })
    .eq('id', id)
    .or(`client_id.eq.${session.userId},therapist_id.eq.${session.userId}`)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointment: data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .or(`client_id.eq.${session.userId},therapist_id.eq.${session.userId}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
