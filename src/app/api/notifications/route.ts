import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '20')

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) query = query.eq('is_read', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const unreadCount = data?.filter(n => !n.is_read).length ?? 0
  return NextResponse.json({ notifications: data, unread_count: unreadCount })
}

export async function PATCH(request: NextRequest) {
  const session = await getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { notification_ids, mark_all } = await request.json()

  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.userId)
    .eq('is_read', false)

  if (!mark_all && Array.isArray(notification_ids)) {
    query = query.in('id', notification_ids)
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
