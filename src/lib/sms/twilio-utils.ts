import twilio from 'twilio'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import type { SmsLog } from './types'

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) return null
  return twilio(accountSid, authToken)
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false
  return twilio.validateRequest(authToken, signature, url, params)
}

export function buildTwimlReply(message: string): string {
  // Escape XML characters
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`
}

export function buildTwimlEmpty(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`
}

export async function sendSms(to: string, body: string, from?: string): Promise<string | null> {
  const client = getTwilioClient()
  if (!client) return null

  const fromNumber = from ?? process.env.TWILIO_PHONE_NUMBER
  if (!fromNumber) return null

  try {
    const msg = await client.messages.create({ to, body, from: fromNumber })
    return msg.sid
  } catch {
    return null
  }
}

export async function logSms(
  log: Omit<SmsLog, 'id' | 'created_at'>
): Promise<void> {
  const supabase = createSupabaseAdminClient()
  await supabase.from('sms_logs').insert(log as never)
}

// Upsert follow-up alert tracking
export async function upsertFollowUpAlert(
  profileId: string | null,
  clientPhone: string,
  ourPhone: string,
  direction: 'inbound' | 'outbound'
): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const now = new Date().toISOString()

  if (direction === 'outbound') {
    // We replied — create/update alert, reset resolution
    await supabase
      .from('sms_follow_up_alerts')
      .upsert({
        profile_id: profileId,
        client_phone: clientPhone,
        our_phone: ourPhone,
        last_outbound_at: now,
        resolved_at: null,
        resolved_by: null,
      }, { onConflict: 'profile_id,client_phone,our_phone' })
  } else {
    // Client replied — update last_inbound_at and auto-resolve alert
    await supabase
      .from('sms_follow_up_alerts')
      .update({ last_inbound_at: now, resolved_at: now })
      .eq('client_phone', clientPhone)
      .eq('our_phone', ourPhone)
      .is('resolved_at', null)
  }
}

// Get the SMS profile for a given Twilio "To" number
export async function getSmsProfileForNumber(twilioNumber: string): Promise<import('./types').SmsProfile | null> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('sms_profiles')
    .select('*, profiles(display_name, city)')
    .eq('twilio_number', twilioNumber)
    .eq('ready_to_reply', true)
    .maybeSingle()
  return data as unknown as import('./types').SmsProfile | null
}

// Get recent conversation history for a phone pair
export async function getConversationHistory(
  fromPhone: string,
  toPhone: string,
  limit = 10
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('sms_logs')
    .select('direction, body')
    .or(`and(from_number.eq.${fromPhone},to_number.eq.${toPhone}),and(from_number.eq.${toPhone},to_number.eq.${fromPhone})`)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? [])
    .reverse()
    .map(m => ({
      role: m.direction === 'inbound' ? ('user' as const) : ('assistant' as const),
      content: m.body,
    }))
}
