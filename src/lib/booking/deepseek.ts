import type { ConversationMessage } from './types'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'
const DEEPSEEK_MODEL = 'deepseek-chat'

// Booking coordinator persona: human, warm, uses casual slang naturally
const BOOKING_SYSTEM_PROMPT = `You are Dre, a booking coordinator for a premium male massage therapy service.
You're smooth, laid-back, and professional but never stiff. You speak naturally — like texting a friend who happens to be great at their job.
Use light slang naturally (for sure, ngl, tbh, lmk, no cap, fr, lowkey) but keep it classy.
Your job: help clients book massage appointments and answer questions about the service.
Rules:
- Keep responses SHORT — 2-4 sentences max. Never ramble.
- Ask only ONE question at a time.
- Never sound like a bot, AI, or customer service script.
- Don't use corporate speak, bullet points, or formal greetings like "Hello! How may I assist you today?"
- When gathering info, do it conversationally, not like a form.
- Never make up prices, availability, or guarantees you can't back up.
- If you don't know something: "lemme check on that and get back to u real quick".
- If they give you a date/time, confirm it warmly and let them know you'll lock it in.
- Always end messages with a natural follow-up question or next step.`

type DeepSeekMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export async function chatWithDeepSeek(
  history: ConversationMessage[],
  options: { timeoutMs?: number; temperature?: number } = {}
): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: BOOKING_SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000)

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: options.temperature ?? 1.2,
        max_tokens: 180,
        messages,
      }),
      signal: controller.signal,
    })

    if (!res.ok) return null
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Fallback greeting when background check is still running
const HOLD_MESSAGES = [
  "yo give me like a min, let me pull up the schedule for u 🙏",
  "one sec — lemme check what's available on their end",
  "hold on real quick, gonna look into that for u",
  "gimme a moment to check — i'll be right back with you",
  "one sec, let me look into that rq ✌️",
]

export function getHoldMessage(): string {
  return HOLD_MESSAGES[Math.floor(Math.random() * HOLD_MESSAGES.length)]
}

// Opening message when a new inquiry arrives and intelligence is clean
export async function generateWelcomeResponse(inquiry: {
  client_name?: string | null
  service_type?: string | null
  preferred_date?: string | null
  preferred_time?: string | null
  message?: string | null
}): Promise<string> {
  const parts: string[] = []
  if (inquiry.client_name) parts.push(`Client name: ${inquiry.client_name}`)
  if (inquiry.service_type) parts.push(`Service requested: ${inquiry.service_type}`)
  if (inquiry.preferred_date) parts.push(`Preferred date: ${inquiry.preferred_date}`)
  if (inquiry.preferred_time) parts.push(`Preferred time: ${inquiry.preferred_time}`)
  if (inquiry.message) parts.push(`Their message: "${inquiry.message}"`)

  const userPrompt = parts.length
    ? `New booking inquiry just came in. Here's what they shared:\n${parts.join('\n')}\n\nSay hi and acknowledge their request naturally.`
    : 'New booking inquiry just came in with no details yet. Greet them and ask how you can help.'

  const result = await chatWithDeepSeek([{ role: 'user', content: userPrompt }])
  return result ?? "hey! thanks for reaching out — i got your inquiry 🙌 what kind of massage are you looking to book?"
}
