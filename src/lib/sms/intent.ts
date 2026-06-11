import type { SmsIntent } from './types'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

interface IntentResult {
  intent: SmsIntent
  confidence: number
  topics: string[]
}

// Fast keyword-based pre-check to avoid API call when obvious
function quickIntent(body: string): SmsIntent | null {
  const lower = body.toLowerCase()

  if (/\b(price|rate|cost|how much|charge|fee|rates)\b/.test(lower)) return 'pricing'
  if (/\b(asap|right now|today|tonight|this evening|urgent|immediately|soon as|available now)\b/.test(lower)) return 'asap'
  if (/\b(couple|two people|me and|partner|wife|husband|girlfriend|boyfriend|duo)\b/.test(lower)) return 'couples'
  if (/\b(outcall|come to|hotel|my place|travel to|mobile|come here|delivery)\b/.test(lower)) return 'outcall'
  if (/\b(60|90|120|one hour|two hour|hour and a half|session length|how long)\b/.test(lower)) return 'session_length'
  if (/\b(available|availability|when|what times|schedule|free|open|book)\b/.test(lower)) return 'availability'
  if (/\b(book|schedule|reserve|appointment|set up|lock in|confirm)\b/.test(lower)) return 'booking_intent'

  return null
}

export async function detectIntent(body: string): Promise<IntentResult> {
  // Try quick keyword match first
  const quick = quickIntent(body)
  if (quick) {
    return { intent: quick, confidence: 0.9, topics: [quick] }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { intent: 'general', confidence: 0.5, topics: [] }
  }

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0,
        max_tokens: 80,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Classify this SMS to a massage therapist. Return JSON: {"intent": one of [pricing|availability|session_length|outcall|couples|asap|booking_intent|general|unknown], "confidence": 0-1, "topics": []}`,
          },
          { role: 'user', content: body },
        ],
      }),
      signal: AbortSignal.timeout(4000),
    })

    if (!res.ok) return { intent: 'general', confidence: 0.5, topics: [] }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) return { intent: 'general', confidence: 0.5, topics: [] }

    const parsed = JSON.parse(content) as IntentResult
    return parsed
  } catch {
    return { intent: 'general', confidence: 0.5, topics: [] }
  }
}
