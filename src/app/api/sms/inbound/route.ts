/**
 * Twilio inbound SMS webhook.
 * Configure as: POST https://yourdomain.com/api/sms/inbound
 * in the Twilio console for your phone number.
 */
import { NextRequest, NextResponse } from 'next/server'
import { detectIntent } from '@/lib/sms/intent'
import { generateSmsReply, shouldEscalate } from '@/lib/sms/responder'
import {
  validateTwilioSignature,
  buildTwimlReply,
  buildTwimlEmpty,
  sendSms,
  logSms,
  upsertFollowUpAlert,
  getSmsProfileForNumber,
  getConversationHistory,
} from '@/lib/sms/twilio-utils'

function twimlResponse(body: string) {
  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function getPublicWebhookUrl(request: NextRequest) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.SITE_URL

  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/$/, '')}/api/sms/inbound`
  }

  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''

  return `${forwardedProto}://${forwardedHost}/api/sms/inbound`
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const params: Record<string, string> = {}
  formData.forEach((v, k) => { params[k] = String(v) })

  const from = params['From'] ?? ''
  const to = params['To'] ?? ''
  const body = params['Body'] ?? ''
  const messageSid = params['MessageSid'] ?? ''

  if (!from || !to || !body) {
    return twimlResponse(buildTwimlEmpty())
  }

  if (process.env.TWILIO_AUTH_TOKEN) {
    const signature = request.headers.get('x-twilio-signature') ?? ''
    const url = getPublicWebhookUrl(request)
    if (!signature || !validateTwilioSignature(signature, url, params)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const smsProfile = await getSmsProfileForNumber(to)

  await logSms({
    profile_id: smsProfile?.id ?? null,
    from_number: from,
    to_number: to,
    direction: 'inbound',
    body,
    twilio_sid: messageSid,
    intent: null,
    status: 'received',
    is_manual: false,
  })

  await upsertFollowUpAlert(smsProfile?.id ?? null, from, to, 'inbound')

  if (!smsProfile || !smsProfile.ready_to_reply) {
    return twimlResponse(buildTwimlEmpty())
  }

  const { intent } = await detectIntent(body)

  if (shouldEscalate(intent, smsProfile)) {
    if (smsProfile.alert_phone) {
      const alertMsg = `ALERT: ${from} texted "${body}" — needs manual response (${intent})`
      await sendSms(smsProfile.alert_phone, alertMsg)
    }
    return twimlResponse(buildTwimlEmpty())
  }

  const history = await getConversationHistory(from, to)
  const reply = await generateSmsReply(body, intent, smsProfile, history)

  await logSms({
    profile_id: smsProfile.id,
    from_number: to,
    to_number: from,
    direction: 'outbound',
    body: reply,
    twilio_sid: null,
    intent,
    status: 'sent',
    is_manual: false,
  })

  await upsertFollowUpAlert(smsProfile.id, from, to, 'outbound')

  return twimlResponse(buildTwimlReply(reply))
}
