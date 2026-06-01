"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  Star,
  Heart,
  TrendingUp,
  Search,
  Zap,
  Shield,
  Users,
} from "lucide-react";

import type { PublicTherapist as Profile } from "@/app/_lib/directory";

interface EditorialHomepageProps {
  featuredTherapists: Profile[];
  totalTherapists: number;
  cityCount: number;
}

// ─── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  serif:  "'Georgia', 'Times New Roman', serif" as const,
  sans:   "system-ui, -apple-system, sans-serif" as const,
  dark:   "#0B1F3A",
  cream:  "#FCFBF8",
  orange: "#FF8A1F",
  blue:   "#1E4B8F",
  muted:  "#6B7280",
  white:  "#ffffff",
};

// ─── Animation presets ───────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 0, 0.1, 1];

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE },
  }),
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// ─── Static data ─────────────────────────────────────────────────────────────
const popularCities = [
  { name: "New York",      state: "NY" },
  { name: "Los Angeles",   state: "CA" },
  { name: "Miami",         state: "FL" },
  { name: "Chicago",       state: "IL" },
  { name: "San Francisco", state: "CA" },
  { name: "Houston",       state: "TX" },
  { name: "Atlanta",       state: "GA" },
  { name: "Las Vegas",     state: "NV" },
  { name: "Seattle",       state: "WA" },
  { name: "Washington DC", state: "DC" },
];

const marqueeKeywords = [
  "Deep Tissue Massage", "Swedish Massage", "Sports Recovery",
  "LGBTQ+ Affirming", "Outcall Massage", "Incall Massage",
  "Mobile Massage", "Hotel Massage", "Independent Therapists",
  "Direct Contact", "Privacy First", "Zero Platform Fees",
  "New York", "Los Angeles", "Miami", "Chicago", "San Francisco", "Atlanta",
];

const massageStyles = [
  "Deep tissue massage", "Swedish massage",
  "Sports massage",      "Relaxation massage",
  "Therapeutic massage", "Mobile massage",
  "Incall massage",      "Outcall massage",
];

const faqs = [
  ["What is MasseurMatch?", "MasseurMatch is a premium directory where independent massage therapists can publish profiles and clients can browse by city, service style, and profile details."],
  ["Does MasseurMatch book appointments?", "No. MasseurMatch does not manage bookings, appointments, calendars, payments, or sessions. Visitors contact therapists directly outside the platform."],
  ["How do I find a massage therapist near me?", "Start by choosing a city, compare profile details, review specialties and contact options, then contact the therapist directly."],
  ["Can therapists create a profile?", "Yes. Independent therapists can create a profile to improve visibility in city-based directory pages and search results."],
];

const conciergeHints = [
  "I have neck tension and need relief...",
  "Looking for an outcall massage in Miami...",
  "Need a deep tissue session today...",
  "LGBTQ+ affirming therapist in NYC...",
  "Sports massage after my workout...",
  "Male therapist, available this evening...",
];

const intentPills = [
  { label: "Available today",     q: "available today" },
  { label: "Outcall massage",     q: "outcall massage" },
  { label: "Deep tissue",         q: "deep tissue" },
  { label: "LGBTQ+ affirming",    q: "LGBTQ+ affirming" },
  { label: "Male therapist",      q: "male therapist" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function profileName(p: Profile) {
  return p.display_name || p.full_name || "Massage Therapist";
}
function cityHref(name: string) {
  return `/${name.toLowerCase().replace(/\s+/g, "-")}`;
}
function styleHref(s: string) {
  return `/massage-styles/${s.toLowerCase().replace(/\s+/g, "-")}`;
}

// ─── SectionReveal ────────────────────────────────────────────────────────────
function SectionReveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      variants={fadeUp}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── ConciergeSearch ─────────────────────────────────────────────────────────
function ConciergeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHintIndex((i) => (i + 1) % conciergeHints.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  function pickPill(q: string) {
    setQuery(q);
    router.push(`/explore?q=${encodeURIComponent(q)}`);
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 16,
        padding: "28px 28px 22px",
        maxWidth: 640,
        margin: "0 auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <Sparkles
          style={{ width: 16, height: 16, color: C.orange, flexShrink: 0 }}
        />
        <p
          style={{
            fontFamily: C.sans,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(252,251,248,0.50)",
          }}
        >
          Smart search — tell us what you need
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 10,
              padding: "16px 52px 16px 18px",
              fontFamily: C.sans,
              fontSize: 15,
              color: C.cream,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,138,31,0.6)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
            }}
          />
          {/* Animated placeholder overlay */}
          {!query && (
            <div
              style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                overflow: "hidden",
                height: 24,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={hintIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    fontFamily: C.sans,
                    fontSize: 15,
                    color: "rgba(252,251,248,0.32)",
                    display: "block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conciergeHints[hintIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          {/* Submit button */}
          <button
            type="submit"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: C.orange,
              border: "none",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Search style={{ width: 15, height: 15, color: C.dark }} />
          </button>
        </div>
      </form>

      {/* Intent pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {intentPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => pickPill(pill.q)}
            style={{
              fontFamily: C.sans,
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(252,251,248,0.65)",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,138,31,0.18)";
              e.currentTarget.style.borderColor = "rgba(255,138,31,0.40)";
              e.currentTarget.style.color = C.cream;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "rgba(252,251,248,0.65)";
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TherapistCard ────────────────────────────────────────────────────────────
function TherapistCard({ therapist }: { therapist: Profile }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(11,31,58,0.16)" }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      style={{ background: C.white, overflow: "hidden", borderRadius: 0 }}
    >
      <Link
        href={`/therapists/${therapist.slug || therapist.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        {/* Image with gradient overlay */}
        <div
          style={{
            position: "relative",
            paddingBottom: "118%",
            background: "rgba(11,31,58,0.08)",
            overflow: "hidden",
          }}
        >
          <Image
            src={
              therapist.avatar_url ||
              therapist.profile_photo ||
              "/images/placeholder-therapist.jpg"
            }
            alt={profileName(therapist)}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(11,31,58,0.90) 0%, rgba(11,31,58,0.25) 45%, transparent 100%)",
            }}
          />
          {/* Tier badge */}
          {therapist._tier && therapist._tier !== "basic" && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: C.orange,
                fontFamily: C.sans,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.dark,
                padding: "4px 10px",
                borderRadius: 3,
              }}
            >
              {therapist._tier === "elite" ? "Elite" : "Pro"}
            </div>
          )}
          {/* Name + city on image */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              color: "#fff",
            }}
          >
            <p
              style={{
                fontFamily: C.serif,
                fontSize: 20,
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              {profileName(therapist)}
            </p>
            <p
              style={{
                fontFamily: C.sans,
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <MapPin style={{ width: 11, height: 11 }} />
              {therapist.city || "United States"}
            </p>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {therapist.verification_status === "verified" && (
              <span
                style={{
                  fontFamily: C.sans,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "rgba(11,31,58,0.07)",
                  color: C.dark,
                  padding: "4px 10px",
                  borderRadius: 3,
                }}
              >
                Active
              </span>
            )}
            {therapist.lgbtq_affirming && (
              <span
                style={{
                  fontFamily: C.sans,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "rgba(255,138,31,0.10)",
                  color: "#9A4A00",
                  padding: "4px 10px",
                  borderRadius: 3,
                }}
              >
                LGBTQ+
              </span>
            )}
            {therapist.available_now && (
              <span
                style={{
                  fontFamily: C.sans,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "rgba(16,185,129,0.10)",
                  color: "#065f46",
                  padding: "4px 10px",
                  borderRadius: 3,
                }}
              >
                Available
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: C.sans,
              fontSize: 13,
              lineHeight: 1.7,
              color: C.muted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {therapist.headline ||
              therapist.bio ||
              "Review profile details, services, pricing, and contact options directly."}
          </p>
          {(therapist.incall_price || therapist.outcall_price) && (
            <p
              style={{
                fontFamily: C.sans,
                fontSize: 12,
                fontWeight: 600,
                color: C.dark,
                marginTop: 12,
              }}
            >
              {therapist.incall_price
                ? `From $${therapist.incall_price}/hr`
                : `From $${therapist.outcall_price}/hr`}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── FaqItem ─────────────────────────────────────────────────────────────────
function FaqItem({
  question,
  answer,
  isFirst,
}: {
  question: string;
  answer: string;
  isFirst: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(11,31,58,0.08)",
        borderTop: isFirst ? "1px solid rgba(11,31,58,0.08)" : "none",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "26px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          gap: 16,
          textAlign: "left",
        }}
      >
        <h3
          style={{
            fontFamily: C.serif,
            fontSize: 17,
            fontWeight: 400,
            color: C.dark,
            lineHeight: 1.4,
          }}
        >
          {question}
        </h3>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            fontFamily: C.sans,
            fontSize: 22,
            fontWeight: 300,
            color: C.orange,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: C.sans,
                fontSize: 14,
                lineHeight: 1.85,
                color: C.muted,
                paddingBottom: 26,
              }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function EditorialHomepage({
  featuredTherapists,
  totalTherapists,
  cityCount,
}: EditorialHomepageProps) {
  const visibleProfiles = featuredTherapists.slice(0, 6);
  const marqueeItems = [...marqueeKeywords, ...marqueeKeywords];

  return (
    <MotionConfig reducedMotion="user">
      <main style={{ background: C.cream, color: C.dark }}>

        {/* ═══ HERO ════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: C.dark,
            color: C.cream,
            padding: "clamp(96px, 14vw, 148px) 20px clamp(80px, 12vw, 128px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated atmospheric orbs */}
          <motion.div
            animate={{ y: [-18, 18, -18], scale: [1, 1.04, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              right: "-160px",
              top: "-160px",
              width: 640,
              height: 640,
              borderRadius: "50%",
              background: "rgba(255,138,31,0.08)",
              filter: "blur(110px)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            animate={{ y: [14, -14, 14], scale: [1, 1.06, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            style={{
              position: "absolute",
              left: "-120px",
              bottom: 0,
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "rgba(30,75,143,0.45)",
              filter: "blur(90px)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            animate={{ x: [-8, 8, -8], y: [6, -6, 6] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            style={{
              position: "absolute",
              left: "40%",
              top: "10%",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(255,138,31,0.04)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />
          {/* Subtle grid overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.025,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", maxWidth: 860, margin: "0 auto" }}>
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                fontFamily: C.sans,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.orange,
                marginBottom: 28,
              }}
            >
              LGBTQ+ affirming directory · United States
            </motion.p>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              style={{
                fontFamily: C.serif,
                fontSize: "clamp(44px, 8vw, 82px)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                margin: "0 auto 30px",
                color: C.cream,
              }}
            >
              Independent massage therapists{" "}
              <br className="hidden sm:block" />
              <em style={{ color: C.orange, fontStyle: "italic" }}>
                across the United States.
              </em>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
              style={{
                fontFamily: C.sans,
                fontSize: "clamp(15px, 2.4vw, 18px)",
                lineHeight: 1.8,
                maxWidth: 560,
                margin: "0 auto 44px",
                opacity: 0.60,
                fontWeight: 300,
              }}
            >
              Discover independent LGBTQ+ affirming massage therapists by city,
              specialty, and availability. Direct contact — no bookings, no
              platform fees.
            </motion.p>

            {/* Concierge search */}
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
              style={{ marginBottom: 60 }}
            >
              <ConciergeSearch />
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.52 }}
              style={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                flexWrap: "wrap",
                maxWidth: 540,
                margin: "0 auto",
              }}
            >
              {(
                [
                  [String(totalTherapists > 0 ? totalTherapists : 500) + "+", "Active Profiles"],
                  [String(cityCount > 0 ? cityCount : 50) + "+", "Cities"],
                  ["$0", "Platform Fees"],
                ] as [string, string][]
              ).map(([value, label]) => (
                <div
                  key={label}
                  style={{
                    flex: "1 1 160px",
                    textAlign: "center",
                    padding: "24px 12px",
                    background: "rgba(255,255,255,0.04)",
                    borderTop: "1px solid rgba(252,251,248,0.08)",
                    borderBottom: "1px solid rgba(252,251,248,0.08)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: C.serif,
                      fontSize: "clamp(32px, 4.5vw, 50px)",
                      fontWeight: 400,
                      color: C.cream,
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </p>
                  <p
                    style={{
                      fontFamily: C.sans,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(252,251,248,0.38)",
                      marginTop: 10,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>

            <p
              style={{
                marginTop: 40,
                fontFamily: C.sans,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(252,251,248,0.22)",
              }}
            >
              No bookings · No payments · No platform fees
            </p>
          </div>
        </section>

        {/* ═══ KEYWORD TICKER ══════════════════════════════════════════════ */}
        <div style={{ background: C.orange, overflow: "hidden", padding: "14px 0" }}>
          <div className="mm-marquee-track">
            {marqueeItems.map((kw, i) => (
              <span
                key={i}
                style={{
                  fontFamily: C.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.dark,
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 22px",
                  gap: 22,
                }}
              >
                {kw}
                <span
                  style={{ color: "rgba(11,31,58,0.28)", fontSize: 8, lineHeight: 1 }}
                >
                  ✦
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ═══ TRUST PILLARS ═══════════════════════════════════════════════ */}
        <section
          style={{
            background: C.white,
            borderBottom: "1px solid rgba(11,31,58,0.08)",
            padding: "clamp(32px, 5vw, 48px) 20px",
          }}
        >
          <motion.div
            className="mx-auto max-w-[1060px] grid gap-0.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={stagger}
          >
            {(
              [
                [Shield,       "LGBTQ+ affirming"],
                [CheckCircle2, "Direct therapist contact"],
                [MapPin,       "City-based discovery"],
                [Users,        "Transparent profiles"],
                [Heart,        "Privacy-first browsing"],
              ] as [React.ComponentType<React.SVGProps<SVGSVGElement>>, string][]
            ).map(([Icon, label]) => (
              <motion.div
                key={label}
                variants={fadeUp}
                style={{ background: C.cream, padding: "22px 18px" }}
              >
                <Icon
                  style={{ width: 18, height: 18, color: C.orange, marginBottom: 12 }}
                />
                <p
                  style={{
                    fontFamily: C.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.dark,
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══ CITIES ══════════════════════════════════════════════════════ */}
        <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <SectionReveal>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 52,
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: C.sans,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: C.orange,
                      marginBottom: 16,
                    }}
                  >
                    Explore by city
                  </p>
                  <h2
                    style={{
                      fontFamily: C.serif,
                      fontSize: "clamp(28px, 4.5vw, 44px)",
                      fontWeight: 400,
                      lineHeight: 1.12,
                      color: C.dark,
                    }}
                  >
                    Massage therapists by city.
                  </h2>
                  <p
                    style={{
                      fontFamily: C.sans,
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: C.muted,
                      marginTop: 14,
                      maxWidth: 440,
                    }}
                  >
                    Browse independent therapists in major U.S. cities by location,
                    specialty, and direct contact options.
                  </p>
                </div>
                <Link
                  href="/explore"
                  style={{
                    fontFamily: C.sans,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: C.dark,
                    textDecoration: "none",
                    borderBottom: "1px solid " + C.dark,
                    paddingBottom: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  All Cities <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
            </SectionReveal>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
              style={{ gap: 2 }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              variants={stagger}
            >
              {popularCities.map((city) => (
                <motion.div key={city.name} variants={fadeUp}>
                  <Link
                    href={cityHref(city.name)}
                    className="mm-city-card"
                    style={{ padding: "28px 22px" }}
                  >
                    <p
                      style={{
                        fontFamily: C.sans,
                        fontSize: 10,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: C.orange,
                        marginBottom: 10,
                      }}
                    >
                      {city.state}
                    </p>
                    <h3
                      style={{
                        fontFamily: C.serif,
                        fontSize: "clamp(18px, 2.5vw, 22px)",
                        fontWeight: 400,
                        color: C.dark,
                        lineHeight: 1.2,
                        marginBottom: 16,
                      }}
                    >
                      {city.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: C.sans,
                        fontSize: 11,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(11,31,58,0.38)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      View therapists
                      <ArrowRight style={{ width: 10, height: 10 }} />
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
        <section
          style={{
            background: C.dark,
            color: C.cream,
            padding: "clamp(64px, 10vw, 100px) 20px",
          }}
        >
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <SectionReveal>
              <p
                style={{
                  fontFamily: C.sans,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 20,
                }}
              >
                How MasseurMatch works
              </p>
              <h2
                style={{
                  fontFamily: C.serif,
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 400,
                  maxWidth: 540,
                  lineHeight: 1.25,
                  marginBottom: 56,
                }}
              >
                Simple discovery. Clear profiles. Direct contact.
              </h2>
            </SectionReveal>

            <motion.div
              className="grid gap-[2px] sm:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={stagger}
            >
              {(
                [
                  [Sparkles, "01", "Search by city",   "Find massage therapists by location, profile details, and service information."],
                  [Star,     "02", "Compare profiles", "Review photos, descriptions, specialties, incall or outcall options, and contact preferences."],
                  [Heart,    "03", "Contact directly", "Reach the therapist using their listed contact method — no middleman, no booking fees."],
                ] as [typeof Sparkles, string, string, string][]
              ).map(([Icon, step, title, text]) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    padding: "36px 32px",
                    borderTop: "1px solid rgba(252,251,248,0.07)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <p
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 24,
                      fontFamily: C.serif,
                      fontSize: 80,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.04)",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {step}
                  </p>
                  <Icon style={{ width: 24, height: 24, color: C.orange }} />
                  <h3
                    style={{
                      fontFamily: C.serif,
                      fontSize: 20,
                      fontWeight: 400,
                      color: C.cream,
                      marginTop: 24,
                      marginBottom: 14,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: C.sans,
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: "rgba(252,251,248,0.60)",
                    }}
                  >
                    {text}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <div style={{ marginTop: 36 }}>
              <Link
                href="/how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "15px 36px",
                  fontFamily: C.sans,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  background: C.orange,
                  color: C.dark,
                  textDecoration: "none",
                }}
              >
                See how it works <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FEATURED PROFILES ═══════════════════════════════════════════ */}
        {visibleProfiles.length > 0 && (
          <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <SectionReveal>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 48,
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: C.sans,
                        fontSize: 11,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: C.orange,
                        marginBottom: 16,
                      }}
                    >
                      Featured profiles
                    </p>
                    <h2
                      style={{
                        fontFamily: C.serif,
                        fontSize: "clamp(28px, 4.5vw, 42px)",
                        fontWeight: 400,
                        lineHeight: 1.15,
                        color: C.dark,
                      }}
                    >
                      Featured massage therapist profiles.
                    </h2>
                    <p
                      style={{
                        fontFamily: C.sans,
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: C.muted,
                        marginTop: 12,
                        maxWidth: 480,
                      }}
                    >
                      Selected independent therapists with profile details, location,
                      service style, and direct contact options.
                    </p>
                  </div>
                  <Link
                    href="/explore"
                    style={{
                      fontFamily: C.sans,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: C.dark,
                      textDecoration: "none",
                      borderBottom: "1px solid " + C.dark,
                      paddingBottom: 3,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    All Profiles <ArrowRight style={{ width: 12, height: 12 }} />
                  </Link>
                </div>
              </SectionReveal>

              <motion.div
                className="grid gap-[2px] md:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-6%" }}
                variants={stagger}
              >
                {visibleProfiles.map((therapist) => (
                  <motion.div key={therapist.id} variants={fadeUp}>
                    <TherapistCard therapist={therapist} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══ SMART SEARCH SHOWCASE ═══════════════════════════════════════ */}
        <section
          style={{
            background: C.blue,
            padding: "clamp(64px, 10vw, 100px) 20px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-80px",
              top: "-80px",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(255,138,31,0.10)",
              filter: "blur(80px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
            <SectionReveal>
              <p
                style={{
                  fontFamily: C.sans,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(252,251,248,0.55)",
                  marginBottom: 16,
                }}
              >
                Smart matching
              </p>
              <h2
                style={{
                  fontFamily: C.serif,
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 400,
                  color: C.cream,
                  maxWidth: 520,
                  lineHeight: 1.25,
                  marginBottom: 48,
                }}
              >
                Describe what you need. Find who can help.
              </h2>
            </SectionReveal>

            <motion.div
              className="grid gap-[2px] sm:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={stagger}
            >
              {[
                { q: "Deep tissue, available this evening", tag: "Same-day" },
                { q: "Outcall massage, hotel-friendly therapist in Miami", tag: "Outcall" },
                { q: "LGBTQ+ affirming male therapist in New York", tag: "Affirming" },
              ].map(({ q, tag }) => (
                <motion.div key={q} variants={fadeUp}>
                  <Link
                    href={`/explore?q=${encodeURIComponent(q)}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        backdropFilter: "blur(16px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "28px 26px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: C.sans,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: C.orange,
                          display: "block",
                          marginBottom: 14,
                        }}
                      >
                        {tag}
                      </span>
                      <p
                        style={{
                          fontFamily: C.serif,
                          fontSize: 17,
                          fontWeight: 400,
                          color: C.cream,
                          lineHeight: 1.5,
                          fontStyle: "italic",
                          marginBottom: 20,
                        }}
                      >
                        &ldquo;{q}&rdquo;
                      </p>
                      <span
                        style={{
                          fontFamily: C.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "rgba(252,251,248,0.50)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        Search <ArrowRight style={{ width: 11, height: 11 }} />
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ SERVICE STYLES ══════════════════════════════════════════════ */}
        <section
          style={{
            borderTop: "1px solid rgba(11,31,58,0.08)",
            background: C.white,
            padding: "clamp(64px, 10vw, 100px) 20px",
          }}
        >
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <SectionReveal>
                <p
                  style={{
                    fontFamily: C.sans,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.orange,
                    marginBottom: 16,
                  }}
                >
                  Browse by service
                </p>
                <h2
                  style={{
                    fontFamily: C.serif,
                    fontSize: "clamp(28px, 4.5vw, 42px)",
                    fontWeight: 400,
                    lineHeight: 1.15,
                    color: C.dark,
                  }}
                >
                  Discover by massage style.
                </h2>
                <p
                  style={{
                    fontFamily: C.sans,
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: C.muted,
                    marginTop: 16,
                    maxWidth: 340,
                  }}
                >
                  Service category pages help visitors discover profiles by search
                  intent — deep tissue, Swedish, sports, mobile, and more.
                </p>
              </SectionReveal>
              <div className="grid gap-[2px] sm:grid-cols-2">
                {massageStyles.map((style) => (
                  <Link
                    key={style}
                    href={styleHref(style)}
                    className="mm-service-link"
                  >
                    <span
                      style={{
                        fontFamily: C.sans,
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.dark,
                      }}
                    >
                      {style}
                    </span>
                    <ArrowRight
                      className="mm-arrow"
                      style={{ width: 14, height: 14, color: C.orange }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOR THERAPISTS ══════════════════════════════════════════════ */}
        <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <SectionReveal>
              <div
                style={{
                  background: C.dark,
                  padding: "clamp(48px, 7vw, 76px) clamp(28px, 5vw, 64px)",
                  display: "grid",
                  gap: 48,
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-60px",
                    bottom: "-60px",
                    width: 340,
                    height: 340,
                    borderRadius: "50%",
                    background: "rgba(30,75,143,0.45)",
                    filter: "blur(80px)",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <Zap
                    style={{ width: 28, height: 28, color: C.orange, marginBottom: 24 }}
                  />
                  <h2
                    style={{
                      fontFamily: C.serif,
                      fontSize: "clamp(26px, 4vw, 38px)",
                      fontWeight: 400,
                      color: C.cream,
                      lineHeight: 1.2,
                      marginBottom: 18,
                    }}
                  >
                    Are you a massage therapist?
                  </h2>
                  <p
                    style={{
                      fontFamily: C.sans,
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: "rgba(252,251,248,0.60)",
                      marginBottom: 32,
                    }}
                  >
                    Create a free profile and grow your visibility across city-based
                    directory pages and search results.
                  </p>
                  <Link
                    href="/for-therapists"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "15px 36px",
                      fontFamily: C.sans,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      background: C.orange,
                      color: C.dark,
                      textDecoration: "none",
                    }}
                  >
                    Create Your Profile{" "}
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    position: "relative",
                  }}
                >
                  {[
                    "City-specific profile pages for local SEO",
                    "Direct client contact — no intermediary",
                    "Member badge for trust signals",
                    "LGBTQ+ affirming directory inclusion",
                    "No booking fees or platform commissions",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        fontFamily: C.sans,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "rgba(252,251,248,0.70)",
                      }}
                    >
                      <CheckCircle2
                        style={{
                          width: 16,
                          height: 16,
                          color: C.orange,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* ═══ EDITORIAL / ABOUT BLOCK ═════════════════════════════════════ */}
        <section
          style={{
            borderTop: "1px solid rgba(11,31,58,0.08)",
            padding: "clamp(64px, 10vw, 100px) 20px",
          }}
        >
          <div
            className="grid gap-[2px] lg:grid-cols-[1.1fr_0.9fr]"
            style={{ maxWidth: 1060, margin: "0 auto" }}
          >
            <SectionReveal
              style={{
                background: C.white,
                padding: "clamp(36px, 5vw, 56px)",
              }}
            >
              <p
                style={{
                  fontFamily: C.sans,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 16,
                }}
              >
                About MasseurMatch
              </p>
              <h2
                style={{
                  fontFamily: C.serif,
                  fontSize: "clamp(26px, 4vw, 38px)",
                  fontWeight: 400,
                  lineHeight: 1.25,
                  color: C.dark,
                  marginBottom: 24,
                }}
              >
                Find massage therapists in your city.
              </h2>
              <p
                style={{
                  fontFamily: C.sans,
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: C.muted,
                  marginBottom: 16,
                }}
              >
                MasseurMatch helps clients discover independent massage therapists
                through city-based directory pages and detailed therapist profiles.
                Whether visitors are looking for deep tissue, Swedish, sports,
                mobile, incall, or outcall options, the directory makes it easier
                to compare profiles and contact therapists directly.
              </p>
              <p
                style={{
                  fontFamily: C.sans,
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: C.muted,
                }}
              >
                Unlike booking platforms, MasseurMatch does not manage appointments,
                payments, calendars, or therapist schedules. Each profile provides
                information submitted by the provider, helping clients make informed
                direct contact outside the platform.
              </p>
            </SectionReveal>
            <SectionReveal
              delay={0.12}
              style={{
                background: C.dark,
                padding: "clamp(36px, 5vw, 56px)",
                color: C.cream,
              }}
            >
              <TrendingUp
                style={{ width: 28, height: 28, color: C.orange }}
              />
              <h3
                style={{
                  fontFamily: C.serif,
                  fontSize: 24,
                  fontWeight: 400,
                  color: C.cream,
                  marginTop: 24,
                  marginBottom: 24,
                }}
              >
                Built for organic growth.
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {[
                  "City-based internal links",
                  "Service category clusters",
                  "Featured profile pathways",
                  "FAQ content for long-tail search",
                  "Direct, indexable directory copy",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      fontFamily: C.sans,
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(252,251,248,0.65)",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: C.orange,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>
        </section>

        {/* ═══ FAQ ═════════════════════════════════════════════════════════ */}
        <section
          style={{
            borderTop: "1px solid rgba(11,31,58,0.08)",
            background: C.white,
            padding: "clamp(64px, 10vw, 100px) 20px",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <SectionReveal>
              <p
                style={{
                  fontFamily: C.sans,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.orange,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                FAQ
              </p>
              <h2
                style={{
                  fontFamily: C.serif,
                  fontSize: "clamp(26px, 4vw, 38px)",
                  fontWeight: 400,
                  textAlign: "center",
                  marginBottom: 44,
                  color: C.dark,
                }}
              >
                Frequently asked questions.
              </h2>
            </SectionReveal>
            {faqs.map(([question, answer], i) => (
              <FaqItem
                key={String(question)}
                question={String(question)}
                answer={String(answer)}
                isFirst={i === 0}
              />
            ))}
          </div>
        </section>

        {/* ═══ FINAL CTA ═══════════════════════════════════════════════════ */}
        <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <SectionReveal>
              <div
                style={{
                  background: C.dark,
                  padding: "clamp(56px, 8vw, 88px) clamp(28px, 5vw, 56px)",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ y: [-12, 12, -12] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    right: "-100px",
                    top: "-100px",
                    width: 380,
                    height: 380,
                    borderRadius: "50%",
                    background: "rgba(255,138,31,0.08)",
                    filter: "blur(60px)",
                    pointerEvents: "none",
                  }}
                />
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  style={{
                    position: "absolute",
                    left: "-80px",
                    bottom: "-80px",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "rgba(30,75,143,0.40)",
                    filter: "blur(60px)",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <h2
                    style={{
                      fontFamily: C.serif,
                      fontSize: "clamp(28px, 5vw, 50px)",
                      fontWeight: 400,
                      color: C.cream,
                      marginBottom: 18,
                      lineHeight: 1.15,
                    }}
                  >
                    Start exploring independent massage therapists.
                  </h2>
                  <p
                    style={{
                      fontFamily: C.sans,
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "rgba(252,251,248,0.55)",
                      maxWidth: 520,
                      margin: "0 auto 48px",
                    }}
                  >
                    Browse city pages, compare profiles, or create a therapist
                    profile to grow visibility in a premium directory experience.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href="/explore"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "16px 40px",
                        fontFamily: C.sans,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        background: C.orange,
                        color: C.dark,
                        textDecoration: "none",
                      }}
                    >
                      Browse Therapists{" "}
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </Link>
                    <Link
                      href="/for-therapists"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "16px 32px",
                        fontFamily: C.sans,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        background: "transparent",
                        color: C.cream,
                        textDecoration: "none",
                        border: "1px solid rgba(252,251,248,0.22)",
                      }}
                    >
                      List Your Profile
                    </Link>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

      </main>
    </MotionConfig>
  );
}
