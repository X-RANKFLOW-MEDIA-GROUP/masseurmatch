import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversation_id')

  if (!conversationId) {
    // Return conversations list
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_a:participant_a_id(id, full_name, avatar_url),
        participant_b:participant_b_id(id, full_name, avatar_url),
        last_message:messages(content, created_at, sender_id)
      `)
      .or(`participant_a_id.eq.${user.id},participant_b_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ conversations: data })
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(id, full_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { recipient_id, content, conversation_id } = body

  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  let convId = conversation_id

  if (!convId) {
    if (!recipient_id) return NextResponse.json({ error: 'recipient_id or conversation_id required' }, { status: 400 })

    // Find or create conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_a_id.eq.${user.id},participant_b_id.eq.${recipient_id}),and(participant_a_id.eq.${recipient_id},participant_b_id.eq.${user.id})`
      )
      .maybeSingle()

    if (existing) {
      convId = existing.id
    } else {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ participant_a_id: user.id, participant_b_id: recipient_id })
        .select()
        .single()
      if (convError) return NextResponse.json({ error: convError.message }, { status: 500 })
      convId = newConv.id
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: convId, sender_id: user.id, content: content.trim() })
    .select()
    .single()

  // Update conversation updated_at
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data, conversation_id: convId }, { status: 201 })
}
