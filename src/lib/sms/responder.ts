/**
 * Generates AI SMS responses based on intent + therapist profile.
 * Keeps responses under 160 chars where possible (one SMS segment).
 */

import type { SmsIntent, SmsProfile } from './types'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

function buildSystemPrompt(profile: SmsProfile): string {
  const lines = [
    `You are Dre, a booking coordinator for a premium male massage therapist.`,
    `Respond via SMS — keep it SHORT (under 160 chars ideally, 2 sentences max).`,
    `Use casual, warm language with light slang (for sure, lmk, tbh, ngl). Never sound robotic.`,
  ]

  // Availability context
  if (profile.availability_mode === 'traveling') {
    lines.push(`Therapist is currently traveling and not available for local sessions.`)
  } else if (profile.availability_mode === 'arrival_window') {
    const arrival = profile.arrival_date ?? 'soon'
    lines.push(`Therapist is arriving ${arrival} — only take bookings for after that date.`)
  } else if (profile.availability_mode === 'unavailable') {
    lines.push(`Therapist is temporarily unavailable. Be polite, ask them to check back in a few days.`)
  }

  // Pricing
  if (profile.pricing_60 || profile.pricing_90 || profile.pricing_couples) {
    const parts: string[] = []
    if (profile.pricing_60) parts.push(`60min: ${profile.pricing_60}`)
    if (profile.pricing_90) parts.push(`90min: ${profile.pricing_90}`)
    if (profile.pricing_couples) parts.push(`couples: ${profile.pricing_couples}`)
    lines.push(`Pricing: ${parts.join(', ')}.`)
  } else {
    lines.push(`Pricing is not set — say "rates depend on what you're looking for, lmk what you need".`)
  }

  // Services
  if (!profile.outcall_available) {
    lines.push(`Incall ONLY — no outcall. If asked, politely say incall only.`)
  } else {
    lines.push(`Outcall available${profile.outcall_area ? ` in: ${profile.outcall_area}` : ''}.`)
  }

  if (!profile.couples_available) {
    lines.push(`No couples sessions currently. If asked, apologize and redirect to individual bookings.`)
  }

  // Custom
  if (profile.custom_instructions) {
    lines.push(`Additional instructions: ${profile.custom_instructions}`)
  }

  return lines.join('\n')
}

// Situations where we escalate to human instead of auto-replying
const ESCALATE_INTENTS: SmsIntent[] = ['asap', 'outcall', 'couples']

export function shouldEscalate(intent: SmsIntent, profile: SmsProfile): boolean {
  if (intent === 'asap') return true
  if (intent === 'outcall' && !profile.outcall_available) return false // just say no
  if (intent === 'couples' && !profile.couples_available) return false // just say no
  return false
}

export async function generateSmsReply(
  inboundBody: string,
  intent: SmsIntent,
  profile: SmsProfile,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return buildFallback(intent, profile)

  const systemPrompt = buildSystemPrompt(profile)

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory.slice(-6), // last 3 exchanges
    { role: 'user' as const, content: inboundBody },
  ]

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 1.1,
        max_tokens: 120,
        messages,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return buildFallback(intent, profile)
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content?.trim() ?? buildFallback(intent, profile)
  } catch {
    return buildFallback(intent, profile)
  }
}

// Deterministic fallbacks so a reply always goes out even if AI is down
function buildFallback(intent: SmsIntent, profile: SmsProfile): string {
  switch (intent) {
    case 'pricing': {
      if (profile.pricing_60) return `Rates: 60min ${profile.pricing_60}${profile.pricing_90 ? `, 90min ${profile.pricing_90}` : ''}. Want to book? lmk 🙌`
      return `Hey! Shoot me what you're looking for and I'll get you a rate 💪`
    }
    case 'availability':
      return profile.availability_mode === 'unavailable'
        ? `Not taking bookings rn but check back in a couple days! 🙏`
        : `Hey! What date/time works for you? lmk and I'll check the schedule`
    case 'session_length':
      return `Do 60min and 90min sessions${profile.pricing_60 ? ` — 60min at ${profile.pricing_60}` : ''}. What works for you?`
    case 'outcall':
      return profile.outcall_available
        ? `Yeah I can come to you${profile.outcall_area ? ` (${profile.outcall_area})` : ''}! What's your hotel/address?`
        : `Incall only rn, sorry! I'm in ${profile.profiles?.city ?? 'the area'} if you wanna come through`
    case 'couples':
      return profile.couples_available
        ? `For sure do couples! That's ${profile.pricing_couples ?? 'a bit more, lmk and I\'ll get you a rate'}. When works?`
        : `Not doing couples rn but available for individual sessions! Want to set that up?`
    case 'asap':
      return `Let me check rq and get back to you in a min 🙏`
    case 'booking_intent':
      return `For sure! What date/time works for you? Also 60 or 90min? lmk 💪`
    default:
      return `Hey! Got your message — what can I help you with? 🙌`
  }
}
