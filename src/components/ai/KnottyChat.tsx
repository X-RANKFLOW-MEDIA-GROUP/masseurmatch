import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("knotty-chat", {
        body: {
          messages: newMessages
            .filter((m) => m.id !== 0)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });

      const reply = error
        ? "Hmm, I'm having trouble connecting. Try again! 🔄"
        : data?.reply || "Sorry, I couldn't process that. Try again!";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Something went wrong. Try again! 🤕" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ─── MORPHING AVATAR WITH BLINK ─── */
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
            {/* Attention-grabbing pulse ring */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{ border: "2px solid hsl(var(--primary) / 0.4)" }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary pulse */}
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />

            {/* Notification dot — blinks */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary z-10 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-[8px] font-bold text-primary-foreground">AI</span>
            </motion.div>

            {/* Avatar body */}
            <div className="relative w-16 h-16 rounded-full border border-border/50 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(0 0% 4%))",
                boxShadow: "0 0 30px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
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
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium text-foreground border border-border/50 bg-background/90 backdrop-blur-xl">
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
            className="w-[380px] h-[520px] flex flex-col overflow-hidden border border-border/40 rounded-2xl"
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
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
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
                  disabled={!input.trim() || isTyping}
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
