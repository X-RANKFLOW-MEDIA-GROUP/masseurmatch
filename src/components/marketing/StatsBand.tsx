"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Diamond, CheckCircle, UserCheck, Smile, Layers, Wallet } from "lucide-react";
import { IconMapPin, IconShield } from "@/components/icons";

const FEATURES = [
  { icon: Diamond, label: "Premium profiles" },
  { icon: CheckCircle, label: "Identity verified" },
  { icon: UserCheck, label: "LGBTQ+ affirming" },
  { icon: Smile, label: "Direct contact" },
] as const;

const STATS = [
  { icon: IconMapPin, headline: "Nationwide", label: "City pages across the US" },
  { icon: Layers, headline: "Specialized", label: "Deep tissue, Swedish, sports & more" },
  { icon: IconShield, headline: "Reviewed", label: "Every profile before it goes live" },
  { icon: Wallet, headline: "Transparent", label: "Direct contact, no booking fees" },
] as const;

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StatsBand() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-[#F7F7F7] py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Row 1: Features */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 mb-12">
          {FEATURES.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduced ? 0 : 0.55,
                ease,
                delay: reduced ? 0 : i * 0.07,
              }}
            >
              <motion.div
                className="w-12 h-12 rounded-full border border-[#E8E8E8] flex items-center justify-center mb-3"
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: reduced ? 0 : 0.5,
                  ease,
                  delay: reduced ? 0 : 0.1 + i * 0.07,
                }}
              >
                <Icon className="w-5 h-5 text-[#111111]" strokeWidth={2.25} />
              </motion.div>
              <p className="text-sm text-[#111111] font-medium">
                {label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Row 2: Honest value statements (non-numeric) */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, headline, label }, i) => (
            <motion.div
              key={headline}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduced ? 0 : 0.55,
                ease,
                delay: reduced ? 0 : 0.15 + i * 0.08,
              }}
            >
              <motion.div
                className="w-12 h-12 rounded-full border border-[#E8E8E8] flex items-center justify-center mb-3"
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: reduced ? 0 : 0.5,
                  ease,
                  delay: reduced ? 0 : 0.22 + i * 0.08,
                }}
              >
                <Icon className="w-5 h-5 text-[#111111]" strokeWidth={2.25} />
              </motion.div>
              <div className="font-display font-extrabold text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-tight text-[#111111] mb-1">
                {headline}
              </div>
              <p className="text-sm text-[#6F6F6F]">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
