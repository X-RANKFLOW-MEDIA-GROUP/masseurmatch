import { NextRequest, NextResponse } from 'next/server'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export async function GET(request: NextRequest) {
  const session = getRequestSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('payment_transactions')
    .select(`
      *,
      appointment:appointment_id(
        id, start_time, service_type,
        therapist:therapist_id(full_name, avatar_url)
      )
    `)
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ transactions: data })
}
