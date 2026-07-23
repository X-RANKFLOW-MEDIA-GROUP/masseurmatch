import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/app/api/_lib/supabase-server';

export const dynamic = 'force-dynamic';

const RollbackSchema = z.object({
  audit_log_id: z.string().uuid(),
  profile_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await request.json();
    const { audit_log_id, profile_id } = RollbackSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    );

    const { data: auditEntry, error: auditError } = await supabase
      .from('profile_audit_log')
      .select('*')
      .eq('id', audit_log_id)
      .eq('profile_id', profile_id)
      .single();

    if (auditError || !auditEntry) {
      return Response.json({ error: 'Audit log entry not found' }, { status: 404 });
    }

    const updateObj: Record<string, any> = {
      [(auditEntry as any).field_name]: (auditEntry as any).old_value,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateObj)
      .eq('id', profile_id);

    if (updateError) {
      return Response.json({ error: 'Failed to rollback' }, { status: 500 });
    }

    await supabase.from('profile_audit_log').insert({
      profile_id,
      edited_by: admin.userId,
      field_name: `ROLLBACK: ${(auditEntry as any).field_name}`,
      old_value: (auditEntry as any).new_value,
      new_value: (auditEntry as any).old_value,
      reason: `Rollback from audit entry ${audit_log_id}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    return Response.json({
      ok: true,
      profile_id,
      field_name: (auditEntry as any).field_name,
      rolled_back_value: (auditEntry as any).old_value,
    });
  } catch (error) {
    console.error('Rollback error:', error);
    return Response.json({ error: 'Rollback failed' }, { status: 500 });
  }
}
