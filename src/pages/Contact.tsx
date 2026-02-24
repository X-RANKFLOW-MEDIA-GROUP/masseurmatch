import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
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

const Contact = () => {
  const scrollRef = useScrollReveal();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t("contact.sent"), description: t("contact.sentDesc") });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.name")}</label>
                    <Input placeholder={t("contact.namePlaceholder")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.email")}</label>
                    <Input type="email" placeholder={t("contact.emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.subject")}</label>
                    <Input placeholder={t("contact.subjectPlaceholder")} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("contact.message")}</label>
                    <Textarea placeholder={t("contact.messagePlaceholder")} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={6} className="bg-secondary border-border" />
                  </div>
                  <MagneticButton>
                    <Button type="submit" className="w-full group">
                      {t("contact.send")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </MagneticButton>
                </form>
              </motion.div>

              <div className="lg:col-span-2 flex flex-col">
                {[
                  { icon: Mail, title: t("contact.emailUs"), info: "support@masseurmatch.com" },
                  { icon: Phone, title: t("contact.callUs"), info: "1-800-MASSAGE" },
                  { icon: MapPin, title: t("contact.visitUs"), info: "123 Wellness St\nSan Francisco, CA 94102" },
                ].map((item, i) => (
                  <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-background p-10 flex-1 glow-hover">
                    <item.icon className="w-5 h-5 text-muted-foreground mb-4" />
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
