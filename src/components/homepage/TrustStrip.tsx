import { ShieldCheck, Clock, Phone, UserCheck, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: "Active Profiles",
    stat: "500+",
    desc: "Profile reviewed",
    color: "text-blue-500",
    bg: "bg-blue-500/8",
    border: "border-blue-500/15",
    glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
  },
  {
    icon: Clock,
    label: "Real Availability",
    stat: "Live",
    desc: "Updated in real-time",
    color: "text-green-500",
    bg: "bg-green-500/8",
    border: "border-green-500/15",
    glow: "group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]",
  },
  {
    icon: Phone,
    label: "Direct Contact",
    stat: "$0",
    desc: "No middleman, no hidden fees",
    color: "text-brand-accent",
    bg: "bg-brand-accent/8",
    border: "border-brand-accent/15",
    glow: "group-hover:shadow-[0_0_20px_rgba(255,138,31,0.1)]",
  },
  {
    icon: UserCheck,
    label: "Trusted Reviews",
    stat: "4.9★",
    desc: "From confirmed clients",
    color: "text-purple-500",
    bg: "bg-purple-500/8",
    border: "border-purple-500/15",
    glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]",
  },
] as const;

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function TrustStrip() {
  return (
    <section className="border-y border-border-subtle bg-[rgb(var(--color-bg-subtle-rgb)/0.78)] py-6 sm:py-8">
      <div className="page-shell">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          {TRUST_ITEMS.map(({ icon: Icon, label, stat, desc, color, bg, border, glow }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className={`group relative overflow-hidden rounded-2xl border ${border} bg-white/80 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${glow}`}
            >
              {/* Subtle gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />

              <div className="relative flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className={`font-display text-xl font-bold ${color}`}>
                  {stat}
                </span>
              </div>

              <div className="relative mt-3">
                <p className="text-sm font-semibold text-brand-primary">{label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-text-secondary">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
