import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

export const runtime = 'nodejs'

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(6000),
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

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Email service is not configured' },
      { status: 503 },
    )
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'MasseurMatch Concierge <concierge@masseurmatch.com>'

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: parsed.data.email,
      subject: 'Your MasseurMatch support information',
      text: [
        parsed.data.message,
        '',
        '— Knotty, MasseurMatch AI Concierge',
        'https://masseurmatch.com',
      ].join('\n'),
    })

    if (error) {
      console.error('[knotty/send-email] Resend rejected request:', error.message)
      return NextResponse.json(
        { ok: false, error: 'Failed to send email' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      channel: 'email',
      id: data?.id ?? null,
      conversation_id: parsed.data.conversation_id ?? null,
    })
  } catch (error) {
    console.error(
      '[knotty/send-email] Unexpected error:',
      error instanceof Error ? error.message : 'Unknown error',
    )

    return NextResponse.json(
      { ok: false, error: 'Failed to send email' },
      { status: 502 },
    )
  }
}
