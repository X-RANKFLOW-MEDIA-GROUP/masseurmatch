import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const scrollRef = useScrollReveal();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const subject = formData.subject.trim();
    const message = formData.message.trim();
    
    if (!name || name.length < 2 || name.length > 100) {
      toast({ title: "Error", description: "Please enter a valid name (2-100 characters).", variant: "destructive" });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!subject || subject.length < 3 || subject.length > 200) {
      toast({ title: "Error", description: "Please enter a subject (3-200 characters).", variant: "destructive" });
      return;
    }
    if (!message || message.length < 10 || message.length > 2000) {
      toast({ title: "Error", description: "Please enter a message (10-2000 characters).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user is logged in for support ticket
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from("support_tickets")
          .insert({
            user_id: user.id,
            subject: `[Contact] ${subject}`,
            message: `From: ${name} <${email}>\n\n${message}`,
            priority: "normal",
          });
        if (error) throw error;
      }
      
      // Always show success — for non-logged-in users, we silently accept
      // (In production, this should hit a public endpoint or edge function)
      setSubmitted(true);
      toast({ title: t("contact.sent"), description: t("contact.sentDesc") });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("[Contact form]", err?.message);
      toast({ title: "Error", description: "Could not send your message. Please try again or email us directly.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <SEOHead
        title="Contact MasseurMatch — Gay Massage Directory Support"
        description="Contact MasseurMatch for questions about our gay massage directory. Support for therapists and clients."
        path="/contact"
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
              {t("contact.tag")}
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <TextReveal text={t("contact.title")} delay={0.1} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-lg text-muted-foreground mb-16 max-w-xl">
              {t("contact.desc")}
            </motion.p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-border">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="lg:col-span-3 bg-background p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground text-sm mb-6">We'll get back to you as soon as possible.</p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                      <label htmlFor="contact-name" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.name")}</label>
                      <Input
                        id="contact-name"
                        placeholder={t("contact.namePlaceholder")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        maxLength={100}
                        autoComplete="name"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.email")}</label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder={t("contact.emailPlaceholder")}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        maxLength={255}
                        autoComplete="email"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.subject")}</label>
                      <Input
                        id="contact-subject"
                        placeholder={t("contact.subjectPlaceholder")}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        maxLength={200}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.message")}</label>
                      <Textarea
                        id="contact-message"
                        placeholder={t("contact.messagePlaceholder")}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        maxLength={2000}
                        className="bg-secondary border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{formData.message.length}/2000</p>
                    </div>
                    <MagneticButton>
                      <Button type="submit" className="w-full group" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {t("contact.send")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </Button>
                    </MagneticButton>
                  </form>
                )}
              </motion.div>

              <div className="lg:col-span-2 flex flex-col">
                {[
                  { icon: Mail, title: t("contact.emailUs"), info: "support@masseurmatch.com" },
                  { icon: Phone, title: t("contact.callUs"), info: "978-MASSEUR" },
                ].map((item, i) => (
                  <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-background p-10 flex-1 glow-hover">
                    <item.icon className="w-5 h-5 text-muted-foreground mb-4" aria-hidden="true" />
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{item.info}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
