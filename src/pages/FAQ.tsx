import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SafetyDisclaimer } from "@/components/legal/SafetyDisclaimer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { fadeUp } from "@/components/animations/variants";


const faqs = [
  {
    q: "What is MasseurMatch?",
    a: "MasseurMatch is an advertising directory that helps men find male massage therapists. We are not a marketplace — we do not arrange, provide, or guarantee any services. Providers pay to advertise their listings on our platform.",
  },
  {
    q: "Does MasseurMatch verify therapists?",
    a: "No. We do not verify licenses, credentials, certifications, or qualifications of any provider. Listings are self-reported advertisements. We encourage users to conduct their own due diligence before contacting any provider.",
  },
  {
    q: "How much does it cost for therapists to list?",
    a: "We offer several advertising tiers starting from a free basic listing up to premium featured placements. Visit our Pricing page for details on advertising plans.",
  },
  {
    q: "Can I book or pay through MasseurMatch?",
    a: "No. MasseurMatch does not process bookings or payments. All arrangements, including scheduling and payment, are made directly between you and the provider.",
  },
  {
    q: "Is MasseurMatch LGBTQ+ friendly?",
    a: "Yes. Our directory is built specifically as an inclusive space for men seeking professional male massage services. We welcome the entire LGBTQ+ community.",
  },
  {
    q: "How do I report a concern about a listing?",
    a: "If you have concerns about a listing, please visit our Contact page or email us. We take all reports seriously and will review flagged listings promptly.",
  },
  {
    q: "Is adult content allowed?",
    a: "Absolutely not. Adult, explicit, or sexual content is strictly prohibited on MasseurMatch. Listings that violate this policy will be removed immediately.",
  },
  {
    q: "Do I need an account to browse the directory?",
    a: "No. Browsing the directory and contacting providers does not require an account. Provider accounts are only needed for those who wish to create a listing.",
  },
  {
    q: "What does 'Featured' or 'Boosted' mean?",
    a: "'Featured' and 'Boosted' labels indicate that a provider has purchased enhanced advertising placement. These labels do not imply endorsement, verification, or recommendation by MasseurMatch.",
  },
];

const FAQPage = () => {
  const scrollRef = useScrollReveal();

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
              Help Center
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TextReveal text="Frequently Asked Questions" delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg"
            >
              Everything you need to know about our directory.
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-px bg-border rounded-lg overflow-hidden">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-background p-8"
              >
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center text-sm text-muted-foreground space-x-4">
            <Link to="/safety" className="underline-sweep hover:text-foreground transition-colors">Safety</Link>
            <Link to="/terms" className="underline-sweep hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="underline-sweep hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="underline-sweep hover:text-foreground transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>

      <SafetyDisclaimer />
      <Footer />
    </div>
  );
};

export default FAQPage;
