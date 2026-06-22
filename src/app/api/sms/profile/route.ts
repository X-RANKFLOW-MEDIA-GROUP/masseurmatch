import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, requireAdminSession } from '@/app/api/_lib/supabase-server'
import { RouteError } from '@/app/api/_lib/http'

function errResponse(err: unknown) {
  if (err instanceof RouteError) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status })
  }
  const message = err instanceof Error ? err.message : 'Unknown error'
  return NextResponse.json({ ok: false, error: message }, { status: 500 })
}

// GET /api/sms/profile?profile_id=xxx — get SMS profile config
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request)
  } catch (err) { return errResponse(err) }

  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')

    const supabase = createSupabaseAdminClient()
    let query = supabase
      .from('sms_profiles')
      .select('*, profiles(display_name, city, phone)')

    if (profileId) {
      query = query.eq('profile_id', profileId) as typeof query
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, profiles: data ?? [] })
  } catch (err) { return errResponse(err) }
}

// POST /api/sms/profile — upsert SMS profile config
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request)
  } catch (err) { return errResponse(err) }

  try {
    const body = await request.json() as Record<string, unknown>

    if (!body.profile_id) {
      return NextResponse.json({ ok: false, error: 'profile_id required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('sms_profiles')
      .upsert(body as never, { onConflict: 'profile_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, profile: data })
  } catch (err) { return errResponse(err) }
}

// PATCH /api/sms/profile?id=xxx — toggle ready_to_reply or partial update
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request)
  } catch (err) { return errResponse(err) }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 })

    const body = await request.json() as Record<string, unknown>
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('sms_profiles')
      .update(body as never)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, profile: data })
  } catch (err) { return errResponse(err) }
}
