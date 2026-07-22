import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/app/api/_lib/session';
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server';

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', session.userId)
      .limit(1);

    if (error) {
      console.error('Own profile query failed:', error);
      return NextResponse.json({ ok: false, error: 'Profile unavailable' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, profiles: data || [] });
  } catch (error) {
    console.error('Own profile query unavailable:', error);
    return NextResponse.json({ ok: false, error: 'Profile unavailable' }, { status: 500 });
  }
}
