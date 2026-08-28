export const dynamic = 'force-dynamic';

import { assertRateLimit } from '@/app/_lib/security';
import { errorResponse, RouteError } from '@/app/api/_lib/http';
import { requireAdminSession } from '@/app/api/_lib/supabase-server';
import { isEmailTemplateKey } from '@/emails/registry';
import { renderSystemTemplate } from '@/emails/render-system-template';

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, 'admin-email-system-preview', { limit: 90, windowMs: 60_000 });

    const url = new URL(request.url);
    const template = url.searchParams.get('template') || '';
    if (!isEmailTemplateKey(template)) {
      throw new RouteError(404, 'Unknown system email template.');
    }

    const html = renderSystemTemplate(template);
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
