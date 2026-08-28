export const dynamic = 'force-dynamic';

import { z } from 'zod';

import { assertRateLimit } from '@/app/_lib/security';
import { errorResponse, json, parseJsonBody } from '@/app/api/_lib/http';
import { requireAdminSession } from '@/app/api/_lib/supabase-server';
import { emailTemplates } from '@/emails/registry';
import { completeText, hasAnyLlmKey } from '@/lib/ai/llm';

const postSchema = z.object({
  action: z.literal('ai_test'),
});

function providerState() {
  return {
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
  };
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, 'admin-email-system-read', { limit: 60, windowMs: 60_000 });

    const templates = Object.entries(emailTemplates).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      subject: template.subject,
      category: template.category,
      previewUrl: `/api/admin/emails/system/preview?template=${encodeURIComponent(key)}`,
    }));

    return json({
      ok: true,
      templates,
      ai: {
        configured: hasAnyLlmKey(),
        providers: providerState(),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, 'admin-email-system-ai-test', { limit: 10, windowMs: 60_000 });
    await parseJsonBody(request, postSchema);

    if (!hasAnyLlmKey()) {
      return json({
        ok: true,
        working: false,
        reason: 'No AI provider key is configured on this deployment.',
        providers: providerState(),
      });
    }

    const result = await completeText({
      system: 'You are a connectivity test. Reply with exactly: MasseurMatch AI connected',
      user: 'Test the configured AI provider.',
      temperature: 0,
      maxTokens: 30,
      timeoutMs: 10_000,
    });

    if (!result) {
      return json({
        ok: true,
        working: false,
        reason: 'AI keys are present, but every configured provider failed or timed out.',
        providers: providerState(),
      });
    }

    return json({
      ok: true,
      working: true,
      provider: result.provider,
      model: result.model,
      providers: providerState(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
