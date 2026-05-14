import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      therapist:therapist_id(id, full_name, avatar_url, slug, phone),
      client:client_id(id, full_name, avatar_url, phone)
    `)
    .eq('id', id)
    .or(`client_id.eq.${user.id},therapist_id.eq.${user.id}`)
    .single()

  if (error) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  return NextResponse.json({ appointment: data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    .or(`client_id.eq.${user.id},therapist_id.eq.${user.id}`)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointment: data })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .or(`client_id.eq.${user.id},therapist_id.eq.${user.id}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
