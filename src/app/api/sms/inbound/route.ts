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
  // Parse Twilio form-encoded body
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

  // Validate Twilio signature in production. The URL must match the public
  // webhook URL configured in Twilio, including protocol and host.
  if (process.env.NODE_ENV === 'production') {
    const signature = request.headers.get('x-twilio-signature') ?? ''
    const url = getPublicWebhookUrl(request)
    if (!signature || !validateTwilioSignature(signature, url, params)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Get the SMS profile for this Twilio number
  const smsProfile = await getSmsProfileForNumber(to)

  // Log the inbound message
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
    booking_inquiry_id: null,
  })

  // Resolve any pending follow-up alert since they replied
  await upsertFollowUpAlert(smsProfile?.id ?? null, from, to, 'inbound')

  // If no profile or AI is off, just log and return empty TwiML
  if (!smsProfile || !smsProfile.ready_to_reply) {
    return twimlResponse(buildTwimlEmpty())
  }

  // Detect intent
  const { intent } = await detectIntent(body)

  // Update intent on the log (best-effort, async)
  // (don't await — we'll reply fast)

  // Check if we should escalate to human
  if (shouldEscalate(intent, smsProfile)) {
    // Send operator alert if alert_phone is configured
    if (smsProfile.alert_phone) {
      const alertMsg = `ALERT: ${from} texted "${body}" — needs manual response (${intent})`
      await sendSms(smsProfile.alert_phone, alertMsg)
    }
    // Don't auto-reply for escalated intents — human handles it
    return twimlResponse(buildTwimlEmpty())
  }

  // Get conversation history for context
  const history = await getConversationHistory(from, to)

  // Generate AI reply
  const reply = await generateSmsReply(body, intent, smsProfile, history)

  // Log outbound reply
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
    booking_inquiry_id: null,
  })

  // Track follow-up alert (we replied, waiting for their response)
  await upsertFollowUpAlert(smsProfile.id, from, to, 'outbound')

  // Reply via TwiML
  return twimlResponse(buildTwimlReply(reply))
}
