import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Mic, Zap, Brain, Shield, Users, ArrowRight,
  Headphones, Radio, MessageSquare, Settings, BarChart3, Globe,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const HomeTest = () => {
  const features = [
    { icon: Mic, title: "Voice AI", desc: "Natural voice interactions powered by advanced AI models" },
    { icon: Zap, title: "Automation", desc: "Streamline workflows with intelligent automation tools" },
    { icon: Brain, title: "Smart Prompts", desc: "Craft perfect prompts with AI-assisted suggestions" },
    { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and compliance standards" },
    { icon: Users, title: "Team Collaboration", desc: "Real-time collaboration across your entire team" },
    { icon: BarChart3, title: "Analytics", desc: "Deep insights into voice interaction patterns" },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "50M+", label: "Interactions" },
    { value: "150+", label: "Languages" },
    { value: "< 200ms", label: "Latency" },
  ];

  const services = [
    { icon: Headphones, title: "Voice Assistants", desc: "Deploy custom voice assistants across channels" },
    { icon: Radio, title: "IVR Systems", desc: "Modern interactive voice response solutions" },
    { icon: MessageSquare, title: "Chatbots", desc: "Conversational AI with natural language understanding" },
    { icon: Settings, title: "API Integration", desc: "Seamless integration with your existing stack" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF", color: "#1a1a2e" }}>

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.95)", borderColor: "#e0e6ef", backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1f5c, #1a3a8f)" }}>
              <Mic className="w-5 h-5" style={{ color: "#f5a623" }} />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: "#0a1f5c" }}>
              VOX<span style={{ color: "#f5a623" }}>matiON</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Solutions", "Pricing", "Docs"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#4a5568" }}>
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm" style={{ color: "#0a1f5c" }}>Sign In</Button>
            <Button className="text-sm" style={{ background: "linear-gradient(135deg, #0a1f5c, #1a3a8f)", color: "#fff" }}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(10,31,92,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(245,166,35,0.05) 0%, transparent 50%)"
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8"
              style={{ background: "rgba(10,31,92,0.06)", color: "#0a1f5c", border: "1px solid rgba(10,31,92,0.1)" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "#f5a623" }} />
              Voice, Automation & Prompts
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight mb-6"
              style={{ color: "#0a1f5c" }}>
              The Future of
              <br />
              <span style={{ background: "linear-gradient(135deg, #f5a623, #e8913a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Voice AI
              </span>
              <br />
              Starts Here
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "#6b7a90" }}>
              Build, deploy, and scale intelligent voice experiences with our cutting-edge platform. Powered by AI, designed for humans.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 gap-2 group"
                style={{ background: "linear-gradient(135deg, #0a1f5c, #1a3a8f)", color: "#fff", boxShadow: "0 4px 20px rgba(10,31,92,0.3)" }}>
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8"
                style={{ borderColor: "#c9d1de", color: "#0a1f5c" }}>
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-12 border-y" style={{ borderColor: "#e0e6ef", background: "rgba(10,31,92,0.02)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "#0a1f5c" }}>{s.value}</p>
                <p className="text-sm font-medium" style={{ color: "#8896a8" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#f5a623" }}>Features</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: "#0a1f5c" }}>
              Everything You Need
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 group cursor-default"
                style={{
                  background: "#fff",
                  border: "1px solid #e0e6ef",
                  boxShadow: "0 2px 12px rgba(10,31,92,0.04)",
                }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  style={{ background: "rgba(10,31,92,0.06)" }}>
                  <f.icon className="w-6 h-6" style={{ color: "#0a1f5c" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0a1f5c" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7a90" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="py-20 md:py-28" style={{ background: "linear-gradient(180deg, rgba(10,31,92,0.03) 0%, rgba(245,166,35,0.03) 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#f5a623" }}>Solutions</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: "#0a1f5c" }}>
              Built for Every Use Case
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((s, i) => (
              <motion.div key={s.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-xl p-8 flex gap-5 items-start transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#fff", border: "1px solid #e0e6ef", boxShadow: "0 2px 12px rgba(10,31,92,0.04)" }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #0a1f5c, #1a3a8f)" }}>
                  <s.icon className="w-7 h-7" style={{ color: "#f5a623" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#0a1f5c" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b7a90" }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center rounded-2xl p-12 md:p-16"
            style={{
              background: "linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 50%, #0a1f5c 100%)",
              boxShadow: "0 20px 60px rgba(10,31,92,0.3)",
            }}>
            <Globe className="w-12 h-12 mx-auto mb-6" style={{ color: "#f5a623" }} />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Voice Experience?</h2>
            <p className="text-base text-white/70 mb-8 max-w-lg mx-auto">
              Join thousands of companies already using VOXmatiON to build the next generation of voice-powered applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 gap-2"
                style={{ background: "#f5a623", color: "#0a1f5c", fontWeight: 700 }}>
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}>
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 border-t" style={{ borderColor: "#e0e6ef" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1f5c, #1a3a8f)" }}>
                <Mic className="w-4 h-4" style={{ color: "#f5a623" }} />
              </div>
              <span className="font-bold" style={{ color: "#0a1f5c" }}>VOX<span style={{ color: "#f5a623" }}>matiON</span></span>
            </div>
            <p className="text-sm" style={{ color: "#8896a8" }}>© 2026 VOXmatiON. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeTest;
