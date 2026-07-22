import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('favorites')
    .select('therapist_id')
    .eq('user_id', session.userId)

  return NextResponse.json({ favorites: data?.map(f => f.therapist_id) ?? [] })
}

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { therapist_id } = await request.json()
  if (!therapist_id) return NextResponse.json({ error: 'therapist_id required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', session.userId)
    .eq('therapist_id', therapist_id)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id as string)
    return NextResponse.json({ favorited: false })
  }

  await supabase.from('favorites').insert({ user_id: session.userId, therapist_id })
  return NextResponse.json({ favorited: true }, { status: 201 })
}
