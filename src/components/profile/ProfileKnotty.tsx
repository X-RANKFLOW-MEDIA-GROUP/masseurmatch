"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

export type KnottyProfileFacts = {
  name: string;
  firstName: string;
  city: string;
  neighborhood: string;
  services: string[];
  specialties: string[];
  startingPrice: string;
  incallPrice: string;
  outcallPrice: string;
  incallAvailable: boolean;
  outcallAvailable: boolean;
  travelRadius: string;
  availabilityDays: string[];
  availabilityHours: string;
  yearsExperience: string;
  preferredContactMethod: string;
  lgbtqAffirming: boolean;
  availableNow: boolean;
};

type ChatMessage = { id: string; role: "user" | "ai"; text: string };

const HAS_RATES = (value: string) => Boolean(value) && value !== "Contact for rates";

function nextId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `k-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Inline, profile-scoped Knotty assistant. Answers are generated only from the
 * facts published on this profile — it never invents pricing, availability, or
 * trust claims. For anything not covered, it points the visitor to the contact
 * options on the page.
 */
export function ProfileKnotty({ facts }: { facts: KnottyProfileFacts }) {
  const { firstName, city, neighborhood } = facts;
  const area = neighborhood && neighborhood !== "Serving central areas" ? neighborhood : city;

  const intro = `Hi! I'm Knotty, ${firstName}'s profile assistant. Ask me about services, pricing, availability, or service area — I answer from this profile.`;
  const quickQuestions = useMemo(
    () => [
      `What are ${firstName}'s rates?`,
      facts.outcallAvailable ? `Does ${firstName} travel to me?` : `Where is ${firstName} based?`,
      `What does ${firstName} specialize in?`,
      `When is ${firstName} available?`,
    ],
    [firstName, facts.outcallAvailable],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "intro", role: "ai", text: intro }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const answer = useCallback(
    (question: string): string => {
      const q = question.toLowerCase();

      if (/(rate|price|cost|how much|fee|charge)/.test(q)) {
        if (HAS_RATES(facts.startingPrice)) {
          const bits = [`${facts.firstName}'s sessions start at ${facts.startingPrice}.`];
          if (HAS_RATES(facts.incallPrice)) bits.push(`Incall from ${facts.incallPrice}.`);
          if (HAS_RATES(facts.outcallPrice)) bits.push(`Outcall from ${facts.outcallPrice}.`);
          bits.push("Final pricing depends on session length and type — reach out to confirm.");
          return bits.join(" ");
        }
        return `${facts.firstName} shares pricing directly. Use the contact options on this page to ask about current rates.`;
      }

      if (/(outcall|travel|come to|mobile|to me|my place|my hotel)/.test(q)) {
        if (facts.outcallAvailable) {
          return `Yes — ${facts.firstName} offers outcall (mobile) sessions around ${city}${facts.travelRadius ? ` within a ${facts.travelRadius} radius` : ""}${HAS_RATES(facts.outcallPrice) ? `, starting at ${facts.outcallPrice}` : ""}. Travel fees may apply for longer distances.`;
        }
        return `${facts.firstName} currently focuses on incall sessions${neighborhood ? ` in ${area}` : ""}. Contact them to ask about outcall availability.`;
      }

      if (/(incall|studio|where|located|location|address|based)/.test(q)) {
        return `${facts.firstName} is based in ${area}${facts.incallAvailable && HAS_RATES(facts.incallPrice) ? `, with incall sessions from ${facts.incallPrice}` : ""}. The exact studio address is shared privately after you connect.`;
      }

      if (/(special|technique|modal|service|deep tissue|swedish|sports|type of massage)/.test(q)) {
        const list = Array.from(new Set([...facts.specialties, ...facts.services])).slice(0, 6);
        if (list.length) {
          return `${facts.firstName} offers ${list.join(", ").toLowerCase()}. Sessions are tailored to what you need — mention your goals when you reach out.`;
        }
        return `${facts.firstName} provides professional bodywork tailored to each client. Contact them to discuss the best approach for you.`;
      }

      if (/(experience|how long|years|qualified|trained)/.test(q)) {
        if (facts.yearsExperience && !/request/i.test(facts.yearsExperience)) {
          return `${facts.firstName} has ${facts.yearsExperience} of professional massage experience.`;
        }
        return `You'll find ${facts.firstName}'s background in the About section above. Reach out for any specifics on training.`;
      }

      if (/(available|open|when|hours|schedule|today|book|appointment)/.test(q)) {
        const base = facts.availabilityDays.length
          ? `${facts.firstName} is generally available on ${facts.availabilityDays.join(", ")}. ${facts.availabilityHours}.`
          : `Check the availability section above, or contact ${facts.firstName} for current openings.`;
        return facts.availableNow ? `${facts.firstName} is marked available now. ${base}` : base;
      }

      if (/(lgbtq|gay|queer|affirm|safe|welcom)/.test(q)) {
        return facts.lgbtqAffirming
          ? `Yes — ${facts.firstName} is LGBTQ+ affirming and provides a welcoming, judgment-free space for every client.`
          : `${facts.firstName} maintains a professional, respectful space for all clients. Reach out with any specific questions.`;
      }

      if (/(contact|reach|message|call|text|whatsapp|email)/.test(q)) {
        return `${facts.firstName} prefers ${facts.preferredContactMethod.toLowerCase()}. Use the contact options on this page to connect directly — MasseurMatch doesn't book on a provider's behalf.`;
      }

      return `Great question! For specifics beyond this profile, reach out to ${facts.firstName} using the contact options on the page. Anything else I can check from the profile — rates, area, specialties, or availability?`;
    },
    [facts, city, neighborhood, area],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
      setInput("");
      setIsTyping(true);
      const reply = answer(text);
      window.setTimeout(() => {
        setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: reply }]);
        setIsTyping(false);
      }, 500 + Math.random() * 400);
    },
    [answer],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  return (
    <section
      id="ask-knotty"
      className="overflow-hidden rounded-[24px] border border-white/5 bg-[#101C2B]/90 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 border-b border-white/5 bg-gradient-to-r from-[#FF8A1F]/10 to-transparent px-7 py-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8A1F] to-[#ff6b00] text-[#0B1F3A]">
          <Sparkles className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="font-display text-[22px] font-bold tracking-[-0.03em] text-[#F8FAFC]">
            Ask Knotty about {firstName}
          </h2>
          <p className="flex items-center gap-1.5 font-sans text-xs text-[#94A3B8]">
            <span className="h-2 w-2 rounded-full bg-[#2ECC8A] motion-safe:animate-pulse" />
            Answers from this profile
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[360px] space-y-3 overflow-y-auto px-7 py-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[88%] whitespace-pre-line rounded-[18px] px-4 py-3 text-sm leading-relaxed ${
              msg.role === "ai"
                ? "mr-auto border border-white/5 bg-white/[0.05] text-[#E2E8F0]"
                : "ml-auto bg-gradient-to-r from-[#FF8A1F] to-[#ff6b00] text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="mr-auto flex max-w-[88%] gap-1.5 rounded-[18px] border border-white/5 bg-white/[0.05] px-4 py-4">
            <span className="h-2 w-2 rounded-full bg-white/40 motion-safe:animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 rounded-full bg-white/40 motion-safe:animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-white/40 motion-safe:animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-7 pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Quick questions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#94A3B8] transition hover:bg-white/[0.08] hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send(input)}
            placeholder={`Ask about ${firstName}…`}
            aria-label={`Ask Knotty a question about ${facts.name}`}
            className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#FF8A1F]/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim()}
            aria-label="Send question"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF8A1F] text-[#0B1F3A] transition hover:bg-[#ff9d3f] disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
