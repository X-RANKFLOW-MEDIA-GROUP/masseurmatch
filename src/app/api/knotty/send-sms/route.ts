import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendSms } from '@/lib/sms/twilio-utils'

export const runtime = 'nodejs'

const requestSchema = z.object({
  phone_number: z.string().trim().min(7).max(32),
  message: z.string().trim().min(1).max(1600),
  conversation_id: z.string().trim().max(255).optional(),
})

function requireKnottyWebhookAuth(request: NextRequest): NextResponse | null {
  const secret = process.env.KNOTTY_WEBHOOK_SECRET?.trim()

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'Knotty webhook is not configured' },
      { status: 503 },
    )
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  return null
}

export async function POST(request: NextRequest) {
  const authError = requireKnottyWebhookAuth(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid request body',
        fields: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    )
  }

  try {
    const sid = await sendSms(parsed.data.phone_number, parsed.data.message)

    if (!sid) {
      return NextResponse.json(
        { ok: false, error: 'Failed to send SMS' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      channel: 'sms',
      sid,
      conversation_id: parsed.data.conversation_id ?? null,
    })
  } catch (error) {
    console.error(
      '[knotty/send-sms] Unexpected error:',
      error instanceof Error ? error.message : 'Unknown error',
    )

    return NextResponse.json(
      { ok: false, error: 'Failed to send SMS' },
      { status: 502 },
    )
  }
}
