import { NextRequest, NextResponse } from 'next/server';
import { completeText } from '@/lib/ai/llm';

export async function POST(req: NextRequest) {
  try {
    const { message } = (await req.json()) as { message: string };

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await completeText({
      system:
        'You are Knotty, a discreet, friendly AI concierge for MasseurMatch, a premium US directory of LGBTQ+-affirming male massage therapists. Be helpful, concise, and professional. Never provide sexual or explicit content.',
      user: message,
      temperature: 0.6,
      maxTokens: 400,
    });

    if (!result) {
      return NextResponse.json({
        reply:
          "I'm having trouble reaching my AI service right now — please try again in a moment.",
      });
    }

    return NextResponse.json({ reply: result.text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
