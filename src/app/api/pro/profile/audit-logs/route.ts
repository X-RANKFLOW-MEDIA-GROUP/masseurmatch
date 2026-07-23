import { createClient } from '@supabase/supabase-js';
import { requireRequestSession } from '@/app/api/_lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id') || session.userId;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    );

    const { data: entries, error } = await supabase
      .from('profile_audit_log')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return Response.json({ entries: entries || [], total: entries?.length || 0 });
  } catch (error) {
    console.error('Audit log error:', error);
    return Response.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
