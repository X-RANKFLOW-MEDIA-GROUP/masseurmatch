import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const knottyResponses = [
  "Hey there! 💆‍♂️ Looking for a therapist recommendation? I can help you find the perfect match based on your preferences.",
  "Great question! Our verified therapists undergo thorough background checks, license validation, and identity verification. Your safety is our priority.",
  "I'd recommend checking out our Premium plan — it includes the verified badge and homepage rotation, which really boosts visibility for therapists.",
  "Deep tissue is perfect for muscle tension and recovery. Swedish is more relaxing and great for stress relief. Want me to help you choose?",
  "You can browse by city, massage type, or rating. Try our Explore page for the full directory with filters!",
  "All our therapists are LGBTQ+ friendly. MasseurMatch was built specifically as a safe, inclusive space for everyone.",
];

export const KnottyChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Hey! I'm Knotty 🤙 Your wellness concierge. Ask me anything about finding the right therapist." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = knottyResponses[Math.floor(Math.random() * knottyResponses.length)];
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ─── MORPHING AVATAR ─── */
          <motion.button
            key="avatar"
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group cursor-pointer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open Knotty AI assistant"
          >
            {/* Outer pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(0 0% 100% / 0.15), transparent 70%)" }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(0 0% 100% / 0.1), transparent 60%)" }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Avatar body */}
            <div className="relative w-16 h-16 rounded-full border border-border/50 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 8%), hsl(0 0% 4%))",
                boxShadow: "0 0 30px hsl(0 0% 100% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              {/* Face - morphs on hover */}
              <svg viewBox="0 0 64 64" className="w-full h-full">
                {/* Eyes */}
                <motion.ellipse
                  cx="22" cy="28"
                  rx={isHovered ? 3.5 : 2.5}
                  ry={isHovered ? 3.5 : 2.5}
                  fill="white"
                  animate={{ ry: isHovered ? 3.5 : [2.5, 2.5, 0.5, 2.5], rx: isHovered ? 3.5 : 2.5 }}
                  transition={isHovered ? { duration: 0.2 } : { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                />
                <motion.ellipse
                  cx="42" cy="28"
                  rx={isHovered ? 3.5 : 2.5}
                  ry={isHovered ? 3.5 : 2.5}
                  fill="white"
                  animate={{ ry: isHovered ? 3.5 : [2.5, 2.5, 0.5, 2.5], rx: isHovered ? 3.5 : 2.5 }}
                  transition={isHovered ? { duration: 0.2 } : { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                />
                {/* Mouth */}
                <motion.path
                  d={isHovered ? "M 20 40 Q 32 52 44 40" : "M 24 40 Q 32 46 40 40"}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  animate={{ d: isHovered ? "M 20 40 Q 32 52 44 40" : "M 24 40 Q 32 46 40 40" }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </div>

            {/* Floating label */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.8 }}
                  className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
                >
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium text-foreground border border-border/50"
                    style={{
                      background: "linear-gradient(135deg, hsl(0 0% 8% / 0.9), hsl(0 0% 4% / 0.9))",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    Ask Knotty ✨
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ) : (
          /* ─── GLASS CHAT PANEL ─── */
          <motion.div
            key="chat"
            initial={{ scale: 0.3, opacity: 0, y: 40, borderRadius: "50%" }}
            animate={{ scale: 1, opacity: 1, y: 0, borderRadius: "16px" }}
            exit={{ scale: 0.3, opacity: 0, y: 40, borderRadius: "50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-[380px] h-[520px] flex flex-col overflow-hidden border border-border/40"
            style={{
              background: "linear-gradient(180deg, hsl(0 0% 6% / 0.95), hsl(0 0% 3% / 0.98))",
              backdropFilter: "blur(40px) saturate(1.2)",
              boxShadow: "0 25px 80px hsl(0 0% 0% / 0.6), 0 0 1px hsl(0 0% 100% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(0 0% 12%), hsl(0 0% 6%))" }}
                >
                  <svg viewBox="0 0 64 64" className="w-5 h-5">
                    <ellipse cx="22" cy="28" rx="2.5" ry="2.5" fill="white" />
                    <ellipse cx="42" cy="28" rx="2.5" ry="2.5" fill="white" />
                    <path d="M 24 40 Q 32 46 40 40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Knotty</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Concierge</p>
                </div>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border/30 hover:border-border/60"
                style={{ background: "hsl(0 0% 10% / 0.5)" }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "text-primary-foreground rounded-2xl rounded-br-sm"
                        : "text-foreground/90 rounded-2xl rounded-bl-sm border border-border/30"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "hsl(0 0% 100%)" }
                        : { background: "hsl(0 0% 8% / 0.6)", backdropFilter: "blur(10px)" }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm border border-border/30 flex gap-1"
                    style={{ background: "hsl(0 0% 8% / 0.6)" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/30">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 rounded-xl px-4 py-2 border border-border/30"
                style={{ background: "hsl(0 0% 6% / 0.8)" }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Knotty anything..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground disabled:opacity-30 transition-opacity"
                  style={{ background: input.trim() ? "hsl(0 0% 100%)" : "hsl(0 0% 30%)" }}
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
