import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";
import { ShieldCheck, AlertTriangle, UserCheck, Phone } from "lucide-react";

const Safety = () => {
  const scrollRef = useScrollReveal();

  const tips = [
    {
      icon: UserCheck,
      title: "Do Your Own Research",
      desc: "MasseurMatch does not verify providers. Always research a provider independently — check reviews, ask for references, and verify credentials on your own.",
    },
    {
      icon: Phone,
      title: "Communicate Before Meeting",
      desc: "Have a phone or video call before your first appointment. Discuss expectations, services, and pricing upfront. Trust your instincts.",
    },
    {
      icon: ShieldCheck,
      title: "Meet in Professional Settings",
      desc: "Choose providers who operate from professional studios or established locations. For outcall services, let someone know where you'll be.",
    },
    {
      icon: AlertTriangle,
      title: "Report Concerns Immediately",
      desc: "If a provider behaves inappropriately, violates policies, or makes you uncomfortable, contact us immediately through our Contact page.",
    },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              Your Safety Matters
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text="Safety Guidelines" delay={0.1} />
            </h1>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Important Notice */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="glass-card p-8 mb-12"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                Important Notice
              </h2>
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>MasseurMatch is an <strong className="text-foreground">advertising directory only</strong>. We connect users with providers who pay to advertise their services on our platform.</p>
                <p>We do <strong className="text-foreground">not verify</strong> any provider's licenses, credentials, identity, or qualifications. We do <strong className="text-foreground">not guarantee</strong> any services, outcomes, or provider conduct.</p>
                <p>We do <strong className="text-foreground">not process bookings or payments</strong>. All arrangements are made directly between users and providers.</p>
                <p>Users must be <strong className="text-foreground">18 years or older</strong>. Adult or sexual content is <strong className="text-foreground">strictly prohibited</strong>.</p>
              </div>
            </motion.div>

            {/* Safety Tips */}
            <h2 className="text-2xl font-bold mb-8">Safety Tips for Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-lg overflow-hidden mb-12">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-background p-8"
                >
                  <tip.icon className="w-6 h-6 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Report */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center glass-card p-8"
            >
              <h3 className="text-xl font-bold mb-3">Need to Report Something?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                If you encounter any issues, inappropriate behavior, or policy violations, please let us know.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold underline-sweep hover:text-foreground transition-colors"
              >
                Contact Us →
              </Link>
            </motion.div>

            <div className="mt-12 text-center text-sm text-muted-foreground space-x-4">
              <Link to="/faq" className="underline-sweep hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/terms" className="underline-sweep hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="underline-sweep hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Safety;
