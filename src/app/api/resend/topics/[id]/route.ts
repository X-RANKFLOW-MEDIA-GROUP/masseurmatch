import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/app/api/_lib/supabase-server';
import { RouteError } from '@/app/api/_lib/http';
import { createResendTopicsService, type UpdateTopicInput } from '@/lib/resend/topics';

/**
 * GET /api/resend/topics/[id]
 * Retrieve a specific topic (requires admin session)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminSession(request as unknown as Request);

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const topicsService = createResendTopicsService();
    const topic = await topicsService.getTopic(id);

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    console.error('Failed to retrieve topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve topic' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/resend/topics/[id]
 * Update a topic (requires admin session)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminSession(request as unknown as Request);

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateInput: UpdateTopicInput = {
      id,
      ...body,
    };

    const topicsService = createResendTopicsService();
    const topic = await topicsService.updateTopic(updateInput);

    return NextResponse.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    console.error('Failed to update topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resend/topics/[id]
 * Delete a topic (requires admin session)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminSession(request as unknown as Request);

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const topicsService = createResendTopicsService();
    const success = await topicsService.deleteTopic(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete topic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Topic ${id} deleted successfully`,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    console.error('Failed to delete topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
