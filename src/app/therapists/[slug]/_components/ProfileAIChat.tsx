"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, Radio } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

interface Props {
  profile: PublicTherapist;
}

export function ProfileAIChat({ profile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const name = getPublicProfileName(profile).split(" ")[0];
  const city = profile.city || "the area";
  const neighborhood = profile.neighborhood_name || profile.primary_area || "";
  const specialties = profile.specialties?.slice(0, 3).join(", ") || "massage therapy";
  
  const INTRO_MESSAGE = `Hi! I'm Knotty AI, your assistant for ${name}'s profile. I can answer questions about their services, pricing, availability, and more. What would you like to know?`;
  
  const QUICK_QUESTIONS = [
    `What are ${name}'s rates?`,
    `Does ${name} offer outcall?`,
    `What specialties does ${name} have?`,
    `Is ${name} LGBTQ+ affirming?`,
    `Can you find similar masseurs on the website?`,
  ];

  // Generate AI response based on profile data
  const generateResponse = useCallback((question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes("rate") || q.includes("price") || q.includes("cost") || q.includes("how much")) {
      const incall = profile.incall_price;
      const outcall = profile.outcall_price;
      if (incall && outcall) {
        return `${name}'s sessions start at $${incall} for incall and $${outcall} for outcall (60 minutes). For longer sessions or specific modalities like deep tissue, rates may vary. You can contact ${name} directly for exact pricing.`;
      } else if (incall) {
        return `${name}'s incall sessions start at $${incall} for 60 minutes. Contact them directly for detailed pricing on longer sessions.`;
      } else if (outcall) {
        return `${name}'s outcall sessions start at $${outcall} for 60 minutes. Travel fees may apply depending on your location.`;
      }
      return `For current rates, please contact ${name} directly using the contact buttons above. Pricing typically varies based on session length and type.`;
    }
    
    if (q.includes("outcall") || q.includes("come to") || q.includes("mobile") || q.includes("travel to me")) {
      if (profile.outcall_price) {
        return `Yes! ${name} offers outcall (mobile) massage services in ${city}${neighborhood ? `, including ${neighborhood}` : ""}. Outcall sessions start at $${profile.outcall_price}. Travel fees may apply for locations outside the primary service area.`;
      }
      return `${name} currently focuses on incall sessions at their location. Contact them directly to inquire about outcall availability.`;
    }
    
    if (q.includes("incall") || q.includes("your place") || q.includes("location") || q.includes("studio")) {
      if (profile.incall_price) {
        return `${name} offers incall sessions at their private studio in ${neighborhood || city}. Sessions start at $${profile.incall_price}. The exact address is shared after booking confirmation.`;
      }
      return `Contact ${name} directly for information about their incall location and availability.`;
    }
    
    if (q.includes("special") || q.includes("type") || q.includes("modali") || q.includes("technique")) {
      if (profile.specialties?.length) {
        return `${name} specializes in ${profile.specialties.join(", ")}. Each session is customized based on your specific needs and preferences. ${name} can combine techniques for a tailored experience.`;
      }
      return `${name} is a skilled massage therapist offering various techniques. Contact them to discuss which modalities would work best for your needs.`;
    }
    
    if (q.includes("book") || q.includes("schedule") || q.includes("appointment") || q.includes("reserve")) {
      return `To contact ${name}, you can:\n\n1. Send a text message using the "Contact" button\n2. Call directly using the phone button\n3. Message on WhatsApp\n\nReach out to discuss availability and services directly with ${name}.`;
    }

    if (q.includes("find") || q.includes("search") || q.includes("similar") || q.includes("website")) {
      return `Yes — I can help you search masseurs inside Masseurfinder. Start with /search?city=${encodeURIComponent(city)} and filter by specialties, verified profiles, and availability. If you tell me your budget and preferred technique, I can suggest what filters to apply.`;
    }
    
    if (q.includes("experience") || q.includes("how long") || q.includes("years")) {
      const years = profile.years_experience || (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
      if (years) {
        return `${name} has ${years}+ years of professional massage experience. They provide a safe, professional environment for all clients.`;
      }
      return `${name} is an experienced massage therapist committed to providing high-quality bodywork. Check their About section for more details on their background and training.`;
    }
    
    if (q.includes("available") || q.includes("open") || q.includes("when")) {
      if (profile.available_now) {
        return `${name} is currently available! You can reach out now. Their typical hours are shown in the Availability section on this page.`;
      }
      return `Check the Availability section on this page for ${name}'s current open slots. You can also contact them directly to check real-time availability.`;
    }
    
    if (q.includes("lgbtq") || q.includes("gay") || q.includes("affirm")) {
      if (profile.lgbtq_affirming) {
        return `Yes! ${name} is an LGBTQ+ affirming therapist who provides a welcoming, judgment-free environment for all clients. Your comfort and safety are their priority.`;
      }
      return `${name} maintains a professional, respectful environment for all clients. Contact them directly if you have specific questions.`;
    }
    
    if (q.includes("cancel") || q.includes("policy") || q.includes("reschedule")) {
      return `For ${name}'s cancellation policy and other details, please ask them directly when contacting them.`;
    }
    
    // Default response
    return `Great question! For specific details about ${name}'s services, I'd recommend reaching out to them directly using the contact buttons above. They'll be happy to answer any questions about their services and availability. Is there anything else I can help with based on their profile?`;
  }, [name, profile, city, neighborhood]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI typing
    setTimeout(() => {
      const response = generateResponse(input);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: response };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, [input, generateResponse]);

  const handleQuickQuestion = (q: string) => {
    setInput(q);
    setTimeout(() => handleSend(), 100);
  };

  const open = () => {
    setIsOpen(true);
    if (!hasStarted) {
      setHasStarted(true);
      setMessages([{ id: "intro", role: "ai", text: INTRO_MESSAGE }]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="pp-ai-chat">
      {/* Floating Button */}
      {!isOpen && (
        <button onClick={open} className="pp-ai-btn" aria-label="Ask Knotty AI">
          <Sparkles />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[24px] border border-sky-200 bg-[linear-gradient(180deg,#f8fcff_0%,#eef6ff_55%,#e0f0ff_100%)] shadow-[0_24px_68px_rgba(14,116,144,0.24)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sky-100 bg-white/75 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300">
                <Sparkles className="h-5 w-5 text-sky-900" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Knotty • {name}</p>
                <p className="flex items-center gap-1.5 text-xs text-sky-700">
                  <Radio className="h-3.5 w-3.5" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ask about {name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-sky-100"
            >
              <X className="h-4 w-4 text-sky-700" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "ai"
                    ? "mr-auto border border-sky-100 bg-white/95 text-slate-800"
                    : "ml-auto bg-gradient-to-r from-sky-500 to-cyan-400 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
            
            {isTyping && (
              <div className="mr-auto max-w-[85%] rounded-[18px] border border-sky-100 bg-white/95 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-5 pb-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-sky-700/70">Quick questions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs text-sky-700 transition hover:bg-sky-50 hover:text-sky-900"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-sky-100 bg-white/70 px-4 py-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Ask about ${name}...`}
                className="flex-1 rounded-full border border-sky-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 transition hover:bg-sky-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
