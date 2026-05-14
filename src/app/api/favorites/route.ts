import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('favorites')
    .select('therapist_id')
    .eq('user_id', user.id)

  return NextResponse.json({ favorites: data?.map(f => f.therapist_id) ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { therapist_id } = await request.json()
  if (!therapist_id) return NextResponse.json({ error: 'therapist_id required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('therapist_id', therapist_id)
    .maybeSingle()

  if (existing) {
    // Toggle off
    await supabase.from('favorites').delete().eq('id', existing.id)
    return NextResponse.json({ favorited: false })
  }

  await supabase.from('favorites').insert({ user_id: user.id, therapist_id })
  return NextResponse.json({ favorited: true }, { status: 201 })
}
