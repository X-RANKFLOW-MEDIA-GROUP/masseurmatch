import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { TextReveal } from "@/components/animations/TextReveal";
import { fadeUp } from "@/components/animations/variants";

const RATE_LIMIT_KEY = "newsletter_last_submit";
const RATE_LIMIT_MS = 30_000; // 30 seconds between submissions

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Client-side rate limiting
    const lastSubmit = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || "0", 10);
    if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
      setError("Please wait a moment before subscribing again.");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));

      const { error: insertError } = await supabase
        .from("newsletter_subscribers" as any)
        .insert({ email: trimmed, source: "homepage" } as any);

      if (insertError) {
        if (insertError.message?.includes("duplicate") || insertError.code === "23505") {
          setSuccess(true);
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
        // Send welcome email (fire-and-forget)
        supabase.functions.invoke("send-notification-email", {
          body: { email: trimmed, template: "newsletter_welcome", data: {} },
        }).catch((err) => console.error("[Newsletter welcome email]", err));
      }
      setEmail("");
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      console.error("[Newsletter]", err);
    }
    setLoading(false);
  };

  return (
    <section className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
              <Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Newsletter</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              <TextReveal text="Stay in the Loop" />
            </h2>

            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Get exclusive updates, new therapist spotlights, and wellness tips delivered to your inbox. No spam, ever.
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-success py-4"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-medium">You're subscribed! Check your inbox.</span>
            </motion.div>
          ) : (
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="flex-1 h-12 bg-secondary border-border"
                required
                maxLength={255}
                aria-label="Email address for newsletter"
              />
              <Button type="submit" disabled={loading} className="h-12 px-8">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </motion.form>
          )}

          {error && (
            <p className="text-destructive text-sm mt-3" role="alert">{error}</p>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};
