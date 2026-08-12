import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/app/api/_lib/supabase-server';
import { RouteError } from '@/app/api/_lib/http';
import { createResendTopicsService, type CreateTopicInput } from '@/lib/resend/topics';

/**
 * GET /api/resend/topics
 * List all topics (requires admin session)
 * Note: Resend SDK may not have a full list endpoint
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request);

    const topicsService = createResendTopicsService();
    const topics = await topicsService.listTopics();

    return NextResponse.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    console.error('Failed to list topics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list topics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resend/topics
 * Create a new topic (requires admin session)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request);

    const body: CreateTopicInput = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Topic name is required' },
        { status: 400 }
      );
    }

    const topicsService = createResendTopicsService();
    const topic = await topicsService.createTopic(body);

    return NextResponse.json(
      { success: true, data: topic },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    console.error('Failed to create topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
