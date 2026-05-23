import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

type ProfileSnippet = { id: string; full_name: string | null; avatar_url: string | null }

export async function GET(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversation_id')

  if (!conversationId) {
    const { data: convs, error } = await supabase
      .from('conversations')
      .select('id, participant_a_id, participant_b_id, updated_at')
      .or(`participant_a_id.eq.${session.userId},participant_b_id.eq.${session.userId}`)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fetch profiles for all participants (FKs point to auth.users, profiles.id = auth user UUID)
    const participantIds = [...new Set(
      (convs ?? []).flatMap(c => [c.participant_a_id as string, c.participant_b_id as string]).filter(Boolean)
    )]
    const profilesById: Record<string, ProfileSnippet> = {}
    if (participantIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', participantIds)
      profiles?.forEach(p => { profilesById[p.id] = p as ProfileSnippet })
    }

    const conversations = (convs ?? []).map(c => ({
      ...c,
      participant_a: c.participant_a_id ? (profilesById[c.participant_a_id as string] ?? null) : null,
      participant_b: c.participant_b_id ? (profilesById[c.participant_b_id as string] ?? null) : null,
    }))

    return NextResponse.json({ conversations })
  }

  const { data: msgs, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', session.userId)
    .is('read_at', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const senderIds = [...new Set((msgs ?? []).map(m => m.sender_id as string).filter(Boolean))]
  const profilesById: Record<string, ProfileSnippet> = {}
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', senderIds)
    profiles?.forEach(p => { profilesById[p.id] = p as ProfileSnippet })
  }

  const messages = (msgs ?? []).map(m => ({
    ...m,
    sender: m.sender_id ? (profilesById[m.sender_id as string] ?? null) : null,
  }))

  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const body = await request.json()
  const { recipient_id, content, conversation_id } = body

  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  let convId = conversation_id

  if (!convId) {
    if (!recipient_id) return NextResponse.json({ error: 'recipient_id or conversation_id required' }, { status: 400 })

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_a_id.eq.${session.userId},participant_b_id.eq.${recipient_id}),and(participant_a_id.eq.${recipient_id},participant_b_id.eq.${session.userId})`
      )
      .maybeSingle()

    if (existing) {
      convId = existing.id
    } else {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ participant_a_id: session.userId, participant_b_id: recipient_id })
        .select()
        .single()
      if (convError) return NextResponse.json({ error: convError.message }, { status: 500 })
      convId = newConv.id
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: convId, sender_id: session.userId, content: content.trim() })
    .select()
    .single()

  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data, conversation_id: convId }, { status: 201 })
}
