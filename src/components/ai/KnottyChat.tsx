import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

// Typewriter hook — reveals text character by character
function useTypewriter(text: string, active: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

// Individual message bubble with optional typewriter
function ChatBubble({ msg, isLatestAssistant }: { msg: Message; isLatestAssistant: boolean }) {
  const shouldAnimate = msg.role === "assistant" && isLatestAssistant && msg.isStreaming;
  const { displayed, done } = useTypewriter(msg.content, !!shouldAnimate);

  const content = shouldAnimate ? displayed : msg.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed ${
          msg.role === "user"
            ? "text-primary-foreground rounded-2xl rounded-br-sm"
            : "text-foreground/90 rounded-2xl rounded-bl-sm"
        }`}
        style={
          msg.role === "user"
            ? { background: "hsl(0 0% 100%)" }
            : {
                background: "hsl(0 0% 100% / 0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
                boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.04)",
              }
        }
      >
        {msg.role === "assistant" ? (
          <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
            <ReactMarkdown>{content}</ReactMarkdown>
            {shouldAnimate && !done && (
              <motion.span
                className="inline-block w-[2px] h-[14px] bg-primary ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>
        ) : (
          msg.content
        )}
      </div>
    </motion.div>
  );
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

  const handleSend = useCallback(async () => {
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
        { id: Date.now() + 1, role: "assistant", content: reply, isStreaming: true },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Something went wrong. Try again! 🤕", isStreaming: true },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages]);

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const latestAssistantId = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].id : -1;

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
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary pulse */}
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
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
            <div
              className="relative w-16 h-16 rounded-full border border-border/50 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(0 0% 4%))",
                boxShadow: "0 0 30px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <ellipse
                  cx="22" cy="28"
                  rx={isHovered ? 3.5 : 2.5}
                  ry={isHovered ? 3.5 : 2.5}
                  fill="white"
                  style={{ transition: "rx 0.3s, ry 0.3s" }}
                />
                <ellipse
                  cx="42" cy="28"
                  rx={isHovered ? 3.5 : 2.5}
                  ry={isHovered ? 3.5 : 2.5}
                  fill="white"
                  style={{ transition: "rx 0.3s, ry 0.3s" }}
                />
                <path
                  d={isHovered ? "M 20 40 Q 32 52 44 40" : "M 24 40 Q 32 46 40 40"}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  style={{ transition: "d 0.3s" }}
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
                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
                    style={{
                      background: "hsl(0 0% 6% / 0.7)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid hsl(0 0% 100% / 0.1)",
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
            animate={{ scale: 1, opacity: 1, y: 0, borderRadius: "20px" }}
            exit={{ scale: 0.3, opacity: 0, y: 40, borderRadius: "50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-[380px] h-[520px] flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(0 0% 8% / 0.75), hsl(0 0% 4% / 0.85))",
              backdropFilter: "blur(40px) saturate(1.4)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              borderRadius: "20px",
              boxShadow: `
                0 40px 100px hsl(0 0% 0% / 0.65),
                0 0 0 1px hsl(0 0% 100% / 0.05),
                inset 0 1px 0 hsl(0 0% 100% / 0.08),
                inset 0 -1px 0 hsl(0 0% 0% / 0.3)
              `,
            }}
          >
            {/* Glass shine overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[20px]"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 40%, transparent 60%, hsl(0 0% 100% / 0.02) 100%)",
              }}
            />

            {/* Header */}
            <div
              className="relative flex items-center justify-between p-4"
              style={{
                borderBottom: "1px solid hsl(0 0% 100% / 0.06)",
                background: "hsl(0 0% 100% / 0.02)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(0 0% 100% / 0.08), hsl(0 0% 100% / 0.02))",
                    border: "1px solid hsl(0 0% 100% / 0.1)",
                    boxShadow: "0 2px 8px hsl(0 0% 0% / 0.3)",
                  }}
                >
                  <svg viewBox="0 0 64 64" className="w-5 h-5">
                    <ellipse cx="22" cy="28" rx="2.5" ry="2.5" fill="white" />
                    <ellipse cx="42" cy="28" rx="2.5" ry="2.5" fill="white" />
                    <path d="M 24 40 Q 32 46 40 40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Knotty</p>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Concierge</p>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                style={{
                  background: "hsl(0 0% 100% / 0.04)",
                  border: "1px solid hsl(0 0% 100% / 0.08)",
                }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  isLatestAssistant={msg.id === latestAssistantId}
                />
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
                    style={{
                      background: "hsl(0 0% 100% / 0.04)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid hsl(0 0% 100% / 0.08)",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="relative p-3"
              style={{ borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{
                  background: "hsl(0 0% 100% / 0.04)",
                  border: "1px solid hsl(0 0% 100% / 0.08)",
                  boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.03)",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Knotty anything..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground disabled:opacity-20 transition-all"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, hsl(0 0% 100%), hsl(0 0% 85%))"
                      : "hsl(0 0% 100% / 0.1)",
                    boxShadow: input.trim() ? "0 2px 10px hsl(0 0% 100% / 0.15)" : "none",
                  }}
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
