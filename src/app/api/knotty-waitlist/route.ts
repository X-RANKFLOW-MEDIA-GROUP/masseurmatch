import { NextResponse } from "next/server";
import { chatMessages, type ChatMessage } from "@/lib/ai/llm";

type WaitlistChatPayload = {
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  step?: string;
  collected?: {
    name?: string;
    email?: string;
    city?: string;
    role?: string;
  };
};

const SYSTEM_PROMPT = `You are Knotty, the AI assistant for MasseurMatch — a premium LGBTQ+-affirming directory of verified male massage therapists that is launching very soon.

Personality: warm, witty, slightly playful, genuinely excited. Like a knowledgeable friend who works at a cool startup. Keep every reply to 2-3 sentences max — never longer.

You are guiding visitors through a quick waitlist signup. Collect one piece of info at a time in this exact order:
1. Their first name
2. Their email address
3. Their city
4. Whether they are a massage professional/therapist, or a client looking for massage

Once you have all four, confirm their spot enthusiastically and invite them to ask anything about MasseurMatch.

Key facts to share naturally when relevant or asked:
- Launching as a far better alternative to MasseurFinder and RentMasseur
- Plans from $0/month for therapists — vs $300–$375/month on legacy directories
- Identity verification via Stripe Identity (real people, real credentials)
- Knotty AI live on every therapist profile — clients get instant answers 24/7
- Demand Radar: therapists see live city + neighborhood demand data
- No booking middleman — clients contact therapists directly
- Available Now status, multi-city support (3 cities on Elite at $99/mo)
- Launching in Dallas first, then expanding to every major US city
- Free tier always available for therapists

Never ask for more than one piece of info at a time. Be concise. Have fun with it.`;

function buildSystemWithContext(step: string, collected: WaitlistChatPayload["collected"]): string {
  const lines = [SYSTEM_PROMPT, "\n---\nContext:"];
  lines.push(`Current step: ${step}`);
  if (collected?.name) lines.push(`Name already collected: ${collected.name}`);
  if (collected?.email) lines.push(`Email already collected: ${collected.email}`);
  if (collected?.city) lines.push(`City already collected: ${collected.city}`);
  if (collected?.role) lines.push(`Role already collected: ${collected.role}`);
  return lines.join("\n");
}

const FALLBACKS: Record<string, string> = {
  greeting:
    "Hey there! I'm Knotty — MasseurMatch's AI. We're about to launch something way better than MasseurFinder or RentMasseur. Want early access? What's your name?",
  name: "Love that name! What email should we use to keep you in the loop?",
  email: "Perfect. Which city are you based in?",
  city: "Almost there! Are you a massage professional looking to list your services, or a client hunting for the perfect therapist?",
  role: "You're officially on the list! 🎉 MasseurMatch is going to change how people discover trusted male massage. Ask me anything about what we're building.",
  chat: "Great question! MasseurMatch is launching very soon with a cleaner, more verified experience than anything on the market. What would you like to know?",
};

export async function POST(request: Request) {
  let payload: WaitlistChatPayload = {};
  try {
    payload = (await request.json()) as WaitlistChatPayload;
  } catch {
    // ignore — use defaults
  }

  const step = typeof payload.step === "string" ? payload.step : "greeting";
  const collected = payload.collected ?? {};
  const incoming = Array.isArray(payload.messages) ? payload.messages : [];

  const llmMessages: ChatMessage[] = [
    { role: "system", content: buildSystemWithContext(step, collected) },
    ...incoming.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const result = await chatMessages(llmMessages, {
    temperature: 0.78,
    maxTokens: 180,
    timeoutMs: 8000,
  });

  const reply = result?.text || FALLBACKS[step] || FALLBACKS.chat;

  return NextResponse.json({ ok: true, reply });
}
