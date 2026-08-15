import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/app/api/_lib/supabase-server';
import { RouteError } from '@/app/api/_lib/http';
import { sendEmailWithTopic } from '@/lib/resend/send-with-topic';

interface SendEmailWithTopicRequest {
  to: string;
  subject: string;
  html: string;
  topicId?: string;
  topicNames?: string[];
  replyTo?: string;
}

/**
 * POST /api/email/send-with-topic
 * Send an email with topic-based subscription management
 */
export async function POST(request: NextRequest) {
  try {
    try {
      await requireAdminSession(request as unknown as Request);
    } catch (authError) {
      if (authError instanceof RouteError) {
        return NextResponse.json(
          { error: authError.message },
          { status: authError.status }
        );
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendEmailWithTopicRequest = await request.json();
    const { to, subject, html, topicId, topicNames, replyTo } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    if (!topicId && (!topicNames || topicNames.length === 0)) {
      return NextResponse.json(
        { error: 'Either topicId or topicNames must be provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: 'Email service not configured', id: `mock-${Date.now()}` },
        { status: 200 }
      );
    }

    const result = await sendEmailWithTopic(
      {
        to,
        subject,
        html,
        topicId,
        topicNames,
        replyTo,
      },
      apiKey
    );

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
