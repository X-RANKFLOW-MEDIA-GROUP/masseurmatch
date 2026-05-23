import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      therapist:therapist_id(id, full_name, avatar_url, slug, phone),
      client:client_id(id, full_name, avatar_url, phone)
    `)
    .eq('id', id)
    .or(`client_id.eq.${session.userId},therapist_id.eq.${session.userId}`)
    .single()

  if (error) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  return NextResponse.json({ appointment: data })
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
