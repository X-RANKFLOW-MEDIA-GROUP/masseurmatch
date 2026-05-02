import { Search, Users, Phone } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Search by location",
    body: "Enter your city or enable GPS to see therapists near you with real-time availability.",
    icon: Search,
  },
  {
    number: "02",
    title: "Compare & choose",
    body: "Review distance, pricing, specialties, and verification signals to find the right fit.",
    icon: Users,
  },
  {
    number: "03",
    title: "Connect directly",
    body: "Reach out to your chosen therapist directly — no middleman, no hidden fees.",
    icon: Phone,
  },
] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function HowItWorks() {
  return (
    <section className="bg-[rgb(var(--color-bg-subtle-rgb)/0.72)] py-16 sm:py-20">
      <div className="page-shell">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="font-display mb-10 text-center text-3xl font-light text-brand-primary sm:text-4xl"
        >
          How it works
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-px overflow-hidden rounded-[28px] border border-border-subtle bg-border-subtle sm:grid-cols-3"
        >
          {STEPS.map(({ number, title, body, icon: Icon }) => (
            <motion.div key={number} variants={fadeUp} className="bg-white p-8">
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-5xl font-light text-brand-primary/10">
                  {number}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-primary/8">
                  <Icon className="h-5 w-5 text-brand-primary" />
                </div>
              </div>
              <h3 className="font-display mt-6 text-xl font-medium text-brand-primary">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
