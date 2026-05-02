"use client";

import { motion } from "framer-motion";
import { Star, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function ValueCard({ icon: Icon, title, text }: { icon: typeof Shield; title: string; text: string }) {
  return (
    <div className="bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-slate-900" />
      </div>
      <h3 className="font-display text-xl font-medium text-slate-900 mb-3">{title}</h3>
      <p className="font-sans text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}

export default function AboutContent() {
  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-32">

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl mb-24">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/50 border border-slate-300">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-600">Our Manifesto</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight text-slate-900 leading-[1.05] max-w-4xl mx-auto">
            Elevating the standard of <br className="hidden md:block" />
            <span className="text-slate-400">holistic wellness.</span>
          </h1>
          <p className="font-sans text-lg md:text-xl font-light text-slate-600 max-w-2xl mx-auto leading-relaxed mt-6">
            MasseurMatch isn&apos;t just a directory. It&apos;s an exclusive network where professional excellence meets absolute trust.
          </p>
        </motion.div>
      </section>

      {/* Editorial Image (Full Width) */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} className="w-full h-[60vh] md:h-[70vh] relative mb-24">
        <Image
          src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury massage and wellness"
          fill
          className="object-cover object-center grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-slate-950/20" />
      </motion.section>

      {/* Core Pillars (Tech-Luxury Grid) */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl space-y-16">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-slate-900">Our Core Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard
            icon={Shield}
            title="Rigorous Curation"
            text="We don't accept everyone. Each therapist on our platform goes through identity and profile verification before being published."
          />
          <ValueCard
            icon={Star}
            title="Elite Standard"
            text="We focus on quality, not quantity. You will only find professionals dedicated to real results and a premium client experience."
          />
          <ValueCard
            icon={Sparkles}
            title="Absolute Privacy"
            text="Your wellness journey is personal. Our technological infrastructure guarantees encrypted communications and total discretion."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 max-w-4xl mt-32">
        <div className="bg-slate-950 text-white p-10 md:p-16 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="font-display text-4xl font-medium relative z-10">Join the Wellness Elite</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/search" className="bg-white text-slate-950 px-8 py-4 font-sans text-sm font-semibold hover:bg-slate-200 transition-colors">
              Find a Therapist
            </Link>
            <Link href="/for-therapists" className="border border-slate-700 text-slate-300 px-8 py-4 font-mono text-xs uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-colors">
              I am a Professional
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
