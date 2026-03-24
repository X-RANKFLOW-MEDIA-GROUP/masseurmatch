"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PublicTherapist } from "@/app/_lib/directory";
import { ScrambleText } from "@/components/animations/ScrambleText";
import { TextReveal } from "@/components/animations/TextReveal";
import "./world-class.css";

/* ─── Types ─── */
type Specialty = {
  name: string;
  count: string;
  icon: React.ReactNode;
};

type Neighborhood = {
  city: string;
  name: string;
  count: string;
  tags: string[];
  href: string;
};

type Testimonial = {
  body: string;
  stars: number;
  name: string;
  initials: string;
  meta: string;
  color: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type TickerItem = {
  text: string;
  highlight?: boolean;
};

export type WorldClassHomepageProps = {
  featuredTherapists: PublicTherapist[];
  totalTherapists: number;
  cityCount: number;
};

/* ─── Data ─── */
const TICKER_ITEMS: TickerItem[] = [
  { text: "Gay Massage Dallas", highlight: true },
  { text: "Deep Tissue Therapy" },
  { text: "LGBTQ+ Affirming Therapist", highlight: true },
  { text: "Male Massage Therapist" },
  { text: "Queer Wellness", highlight: true },
  { text: "Gay-Friendly Bodywork" },
  { text: "Swedish Massage Austin" },
  { text: "Gay Massage Houston Montrose", highlight: true },
  { text: "Sports Recovery" },
  { text: "LGBTQ+ Spa Oak Lawn", highlight: true },
  { text: "Myofascial Release" },
  { text: "Affirming Touch Therapy", highlight: true },
  { text: "Deep Tissue Houston" },
  { text: "Queer Bodywork Austin", highlight: true },
  { text: "CBD Body Work" },
  { text: "Gay Massage Near Me", highlight: true },
  { text: "Hot Stone Therapy" },
  { text: "Lymphatic Drainage" },
  { text: "LGBTQ+ Massage Directory", highlight: true },
  { text: "Couples Massage Dallas" },
  { text: "Verified Gay Therapist", highlight: true },
];

const SPECIALTIES: Specialty[] = [
  {
    name: "Deep Tissue",
    count: "348 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 12c1.5 2 4.5 2 6 0" />
        <path d="M8 8c0-2 2-3 4-3s4 1 4 3" />
        <path d="M5 20c0-3 3-5 7-5s7 2 7 5" />
      </svg>
    ),
  },
  {
    name: "Swedish Massage",
    count: "512 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="5" />
        <path d="M5.8 16.5c.4-2.5 3-4.5 6.2-4.5s5.8 2 6.2 4.5" />
        <path d="M2 20h20" />
      </svg>
    ),
  },
  {
    name: "Sports Recovery",
    count: "189 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    name: "Hot Stone Therapy",
    count: "156 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M7.05 7.05L5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41" />
      </svg>
    ),
  },
  {
    name: "Myofascial Release",
    count: "97 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: "Lymphatic Drainage",
    count: "78 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 009.5 7h5A2.5 2.5 0 0017 4.5v0A2.5 2.5 0 0014.5 2h-5z" />
        <path d="M7 7v4m10-4v4M3 17c0-3 2-6 5-6m8 0c3 0 5 3 5 6" />
      </svg>
    ),
  },
  {
    name: "Couples Massage",
    count: "203 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    name: "CBD Body Work",
    count: "114 therapists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
];

const NEIGHBORHOODS: Neighborhood[] = [
  { city: "Dallas, TX", name: "Oak Lawn", count: "84 gay-affirming therapists", tags: ["Deep Tissue", "LGBTQ+", "Sports"], href: "/dallas/oak-lawn" },
  { city: "Dallas, TX", name: "Uptown", count: "62 verified therapists", tags: ["Swedish", "Hot Stone", "Couples"], href: "/dallas/uptown" },
  { city: "Dallas, TX", name: "Deep Ellum", count: "38 verified therapists", tags: ["CBD Body Work", "Myofascial"], href: "/dallas/deep-ellum" },
  { city: "Houston, TX", name: "Montrose", count: "106 gay-affirming therapists", tags: ["Deep Tissue", "Queer", "Swedish"], href: "/houston/montrose" },
  { city: "Houston, TX", name: "The Heights", count: "57 verified therapists", tags: ["Sports", "Lymphatic"], href: "/houston/the-heights" },
  { city: "Houston, TX", name: "Midtown", count: "73 verified therapists", tags: ["Couples", "Hot Stone", "LGBTQ+"], href: "/houston/midtown" },
  { city: "Austin, TX", name: "South Congress", count: "71 gay-affirming therapists", tags: ["Deep Tissue", "CBD Work", "Queer"], href: "/austin/south-congress" },
  { city: "Austin, TX", name: "East Austin", count: "44 verified therapists", tags: ["Swedish", "Myofascial", "LGBTQ+"], href: "/austin/east-austin" },
  { city: "San Antonio, TX", name: "King William", count: "31 verified therapists", tags: ["Hot Stone", "Swedish"], href: "/san-antonio/king-william" },
];

const TESTIMONIALS: Testimonial[] = [
  {
    body: "Finally a directory where I can filter for therapists who are actually affirming. Found Marcus in Oak Lawn on my first search — couldn't be happier.",
    stars: 5,
    name: "Alex Kim",
    initials: "AK",
    meta: "Oak Lawn, Dallas TX \u00b7 Deep Tissue client",
    color: "var(--n4)",
  },
  {
    body: "The identity verification and detailed profiles gave me confidence before I even made contact. This is exactly what the queer wellness space has been missing for years.",
    stars: 5,
    name: "Jordan Rivera",
    initials: "JR",
    meta: "Montrose, Houston TX \u00b7 Swedish client",
    color: "var(--a0)",
  },
  {
    body: "As a gay LMT, MasseurMatch brought me exactly the clients I wanted to serve. The platform genuinely understands the LGBTQ+ community.",
    stars: 5,
    name: "Sam O., LMT",
    initials: "SO",
    meta: "South Congress, Austin TX \u00b7 Verified Therapist",
    color: "rgba(11,31,58,.09)",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is MasseurMatch specifically for LGBTQ+ clients?",
    answer:
      "MasseurMatch was built with LGBTQ+ inclusivity at its foundation. Every therapist is vetted, and those who explicitly identify as gay-affirming or queer-welcoming are highlighted with verified badges. Every body and identity is welcome here.",
  },
  {
    question: "How do I find a gay-affirming massage therapist near me?",
    answer:
      'Use our search to enter your city or neighborhood — including specific areas like Oak Lawn in Dallas or Montrose in Houston — and filter by "LGBTQ+ Affirming". Results show verified, reviewed therapists closest to you with their certifications and client reviews.',
  },
  {
    question: "Are all therapists on MasseurMatch verified?",
    answer:
      "Every therapist completes identity verification via Stripe Identity and a profile review before being published. We do NOT verify professional licenses or credentials against state boards. MasseurMatch is a discovery directory — clients should confirm licensing independently. LGBTQ+-affirming status is self-reported by therapists.",
  },
  {
    question: "Is there a free trial for therapists listing on MasseurMatch?",
    answer:
      "Yes. Therapists get 30 days completely free — full profile listing, inquiry reception, and platform visibility — before choosing a paid plan. No credit card required to start your free trial.",
  },
  {
    question: "What cities and neighborhoods are covered?",
    answer:
      "We cover 104+ US cities with hyperlocal neighborhood search — including Oak Lawn and Uptown in Dallas, Montrose and The Heights in Houston, South Congress and East Austin in Austin, and more. New cities are added monthly based on therapist and community demand.",
  },
];

const HERO_TAGS = [
  "Deep Tissue",
  "Gay-Affirming",
  "Swedish Massage",
  "Sports Recovery",
  "LGBTQ+ Friendly",
  "Hot Stone",
  "Queer Wellness",
  "CBD Body Work",
];

/* ─── Helpers ─── */
const GRADIENTS = ["wc-tc-bg-a", "wc-tc-bg-b", "wc-tc-bg-c"] as const;

function therapistInitial(t: PublicTherapist) {
  return (t.display_name || t.full_name || "T").charAt(0).toUpperCase();
}

function therapistName(t: PublicTherapist) {
  return t.display_name || t.full_name || "Featured Therapist";
}

function therapistLocation(t: PublicTherapist) {
  const parts = [t.neighborhood_name || t.primary_area, t.city].filter(Boolean);
  return parts.join(", ") || "Featured Area";
}

function therapistBadge(t: PublicTherapist) {
  if (t._tier === "elite") return "Top Rated";
  if (t._tier === "pro") return "Featured";
  if (t.available_now) return "Available";
  return "New";
}

function therapistPrice(t: PublicTherapist) {
  const price = t.incall_price || t.outcall_price;
  return price ? `$${price}` : "Contact";
}

/* ─── Sub-components ─── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="9" r="6" />
      <path d="M15 15l3 3" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5C12.5 3.51 10.49 1.5 8 1.5z" />
      <circle cx="8" cy="6" r="1.5" />
    </svg>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9h12M10 4l5 5-5 5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function KnottyBubble({ msg, isLast }: { msg: { role: string; text: string }; isLast: boolean }) {
  const isAi = msg.role === "assistant";
  const [displayed, setDisplayed] = useState(isAi && isLast ? "" : msg.text);
  const [done, setDone] = useState(!isAi || !isLast);

  useEffect(() => {
    if (!isAi || !isLast) {
      setDisplayed(msg.text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      setDisplayed(msg.text.slice(0, idx));
      if (idx >= msg.text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, 28);
    return () => clearInterval(iv);
  }, [msg.text, isAi, isLast]);

  return (
    <div className={`wc-kg-bubble ${isAi ? "wc-kg-ai" : "wc-kg-user"}`}>
      {displayed}
      {isAi && isLast && !done && <span className="wc-kg-cursor" />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function WorldClassHomepage({
  featuredTherapists,
  totalTherapists,
  cityCount,
}: WorldClassHomepageProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [nlSuccess, setNlSuccess] = useState(false);
  const [heroButtonScrambleKey, setHeroButtonScrambleKey] = useState(0);

  const nbhdScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* --- Knotty chat simulation --- */
  const [knottyMessages, setKnottyMessages] = useState<{ id: string; role: "assistant" | "user"; text: string }[]>([]);
  const [knottyTyping, setKnottyTyping] = useState(false);
  const [knottyReady, setKnottyReady] = useState(false);
  const [knottyInput, setKnottyInput] = useState("");
  const knottyScrollRef = useRef<HTMLDivElement>(null);

  /* --- Scroll reveal --- */
  useEffect(() => {
    const elements = document.querySelectorAll(".wc-cr,.wc-cr2");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.1 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* --- Knotty greeting auto-play --- */
  useEffect(() => {
    const lines = [
      "Looking for massage in Dallas? \uD83D\uDC86",
      "Deep tissue or relaxation?",
      "Available now? Let me check …",
    ];
    const timers: NodeJS.Timeout[] = [];
    lines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setKnottyMessages((prev) => [
            ...prev,
            { id: `greet-${i}`, role: "assistant", text: line },
          ]);
        }, i * 1800 + 800),
      );
    });
    timers.push(
      setTimeout(() => setKnottyReady(true), lines.length * 1800 + 1200),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  /* --- Auto-scroll knotty --- */
  useEffect(() => {
    knottyScrollRef.current?.scrollTo({
      top: knottyScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [knottyMessages, knottyTyping]);

  /* --- Drag scroll for neighborhoods --- */
  useEffect(() => {
    const sc = nbhdScrollRef.current;
    if (!sc) return;

    let down = false;
    let startX = 0;
    let scrollL = 0;

    const onDown = (e: MouseEvent) => {
      down = true;
      startX = e.pageX - sc.offsetLeft;
      scrollL = sc.scrollLeft;
      sc.classList.add("dragging");
    };
    const onUp = () => {
      down = false;
      sc.classList.remove("dragging");
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      e.preventDefault();
      const x = e.pageX - sc.offsetLeft;
      sc.scrollLeft = scrollL - (x - startX) * 1.5;
    };

    sc.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    sc.addEventListener("mousemove", onMove);

    return () => {
      sc.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      sc.removeEventListener("mousemove", onMove);
    };
  }, []);

  /* --- Tilt cards --- */
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".wc-tilt-card");
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> =
      [];
    cards.forEach((card) => {
      const inner = card.querySelector<HTMLElement>(".wc-tilt-inner");
      if (!inner) return;
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -18;
        inner.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
      };
      const leave = () => {
        inner.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)";
      };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      handlers.push({ el: card, move, leave });
    });
    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  /* --- Handlers --- */
  const doSearch = useCallback(() => {
    const q = searchValue.trim();
    if (q) {
      router.push(`/search?keyword=${encodeURIComponent(q)}`);
    }
  }, [searchValue, router]);

  const quickSearch = useCallback(
    (tag: string) => {
      router.push(`/search?keyword=${encodeURIComponent(tag)}`);
    },
    [router],
  );

  const toggleFaq = useCallback((idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  }, []);

  const handleNlSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNlSuccess(true);
  }, []);

  const suggestions = [
    { icon: "📍", text: "Deep tissue — Oak Lawn, Dallas" },
    { icon: "🏳️‍🌈", text: "LGBTQ+ affirming — Montrose, Houston" },
    { icon: "💆", text: "Sports recovery — South Congress, Austin" },
    { icon: "🔥", text: "Hot stone therapy — Uptown, Dallas" },
  ];

  return (
    <div className="wc-home">
      {/* ─── HERO ─── */}
      <section className="wc-hero">
        <div className="wc-hero-grid-bg" />
        <div className="wc-hero-split">
          {/* LEFT — content */}
          <div className="wc-hero-content wc-hero-left">
            <div className="wc-geo-bar">
              <span className="wc-geo-dot" />
              <span>Detect my location — find therapists nearby</span>
            </div>

            <h1 className="wc-hero-h1">
              <span className="wc-hero-line">
                <TextReveal text="Find your" delay={0.04} />
                <span className="wc-hero-accent">
                  <TextReveal text="perfect" delay={0.14} />
                </span>
              </span>
              <span className="wc-sub-line">
                <TextReveal text="gay-affirming therapist" delay={0.24} />
              </span>
            </h1>

            <p className="wc-hero-p">
              The <strong>LGBTQ+-inclusive</strong> directory built for precision:
              <strong> verified credentials</strong>, visible starting rates, and neighborhood-level coverage
              — from Oak Lawn to Montrose to South Congress.
            </p>

            <div className="wc-search-wrap">
              <div className="wc-search-outer">
                <div className="wc-si">
                  <SearchIcon />
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Deep tissue, therapist name, neighborhood…"
                  autoComplete="off"
                  aria-label="Search therapists"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowSuggestions(e.target.value.length > 1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      doSearch();
                    }
                  }}
                />
                <div className="wc-s-sep" />
                <div className="wc-s-loc">
                  <LocationPinIcon />
                  <span>Dallas, TX</span>
                </div>
                <button
                  type="button"
                  className="wc-btn-search"
                  onClick={doSearch}
                  onMouseEnter={() => setHeroButtonScrambleKey((value) => value + 1)}
                  onFocus={() => setHeroButtonScrambleKey((value) => value + 1)}
                >
                  <ScrambleText text="Search" playKey={heroButtonScrambleKey} />
                </button>

                {showSuggestions && (
                  <div className="wc-s-suggestions">
                    {suggestions.map((s) => (
                      <div
                        key={s.text}
                        className="wc-s-sug-item"
                        onClick={() => {
                          setSearchValue(s.text);
                          setShowSuggestions(false);
                          router.push(`/search?keyword=${encodeURIComponent(s.text)}`);
                        }}
                      >
                        <span className="wc-s-sug-icon">{s.icon}</span>
                        {s.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="wc-hero-tags">
              {HERO_TAGS.map((tag) => (
                <span key={tag} className="wc-htag" onClick={() => quickSearch(tag)}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="wc-hero-stats">
              <div className="wc-hstat">
                <div className="wc-hstat-n">
                  <b>{totalTherapists.toLocaleString()}</b>+
                </div>
                <div className="wc-hstat-l">Verified Therapists</div>
              </div>
              <div className="wc-hstat">
                <div className="wc-hstat-n">
                  <b>{cityCount}</b>
                </div>
                <div className="wc-hstat-l">US Cities</div>
              </div>
              <div className="wc-hstat">
                <div className="wc-hstat-n">
                  <b>100</b>%
                </div>
                <div className="wc-hstat-l">LGBTQ+ Inclusive</div>
              </div>
              <div className="wc-hstat">
                <div className="wc-hstat-n">
                  <b>4.9</b>★
                </div>
                <div className="wc-hstat-l">Avg. Rating</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Knotty Glass AI */}
          <div className="wc-hero-right">
            <div className="wc-knotty-glass">
              {/* Header */}
              <div className="wc-kg-header">
                <div className="wc-kg-avatar">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M10 2l2.5 1.5V7L10 8.5 7.5 7V3.5z" />
                    <circle cx="10" cy="13" r="4" />
                    <path d="M4 18c0-3 2.7-5 6-5s6 2 6 5" />
                  </svg>
                  <span className="wc-kg-live" />
                </div>
                <div className="wc-kg-meta">
                  <span className="wc-kg-name">Knotty AI</span>
                  <span className="wc-kg-status">Your massage concierge</span>
                </div>
              </div>

              {/* Messages */}
              <div className="wc-kg-messages" ref={knottyScrollRef}>
                {knottyMessages.map((msg, i) => (
                  <KnottyBubble key={msg.id} msg={msg} isLast={i === knottyMessages.length - 1} />
                ))}
                {knottyTyping && (
                  <div className="wc-kg-bubble wc-kg-ai">
                    <span className="wc-kg-dots">
                      <span /><span /><span />
                    </span>
                  </div>
                )}
              </div>

              {/* Quick suggestions */}
              {knottyReady && (
                <div className="wc-kg-quick">
                  {["Deep Tissue", "Available Now", "Outcall / Mobile", "Near Me"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="wc-kg-chip"
                      onClick={() => router.push(`/search?keyword=${encodeURIComponent(label)}`)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="wc-kg-input">
                <input
                  placeholder="Ask Knotty anything…"
                  value={knottyInput}
                  onChange={(e) => setKnottyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && knottyInput.trim()) {
                      const q = knottyInput.trim();
                      setKnottyMessages((prev) => [
                        ...prev,
                        { id: `u-${Date.now()}`, role: "user", text: q },
                      ]);
                      setKnottyInput("");
                      setKnottyTyping(true);
                      setTimeout(() => {
                        setKnottyTyping(false);
                        setKnottyMessages((prev) => [
                          ...prev,
                          { id: `a-${Date.now()}`, role: "assistant", text: `Let me find the best options for "${q}"...` },
                        ]);
                        setTimeout(() => {
                          router.push(`/search?keyword=${encodeURIComponent(q)}`);
                        }, 1200);
                      }, 1400);
                    }
                  }}
                />
                <button
                  type="button"
                  className="wc-kg-send"
                  aria-label="Send message"
                  onClick={() => {
                    if (!knottyInput.trim()) return;
                    const q = knottyInput.trim();
                    setKnottyMessages((prev) => [
                      ...prev,
                      { id: `u-${Date.now()}`, role: "user", text: q },
                    ]);
                    setKnottyInput("");
                    setKnottyTyping(true);
                    setTimeout(() => {
                      setKnottyTyping(false);
                      setKnottyMessages((prev) => [
                        ...prev,
                        { id: `a-${Date.now()}`, role: "assistant", text: `Let me find the best options for "${q}"...` },
                      ]);
                      setTimeout(() => {
                        router.push(`/search?keyword=${encodeURIComponent(q)}`);
                      }, 1200);
                    }, 1400);
                  }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 14l12-6L2 2v5l7 1-7 1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="wc-ticker-wrap" aria-hidden="true">
        <div className="wc-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={`${item.text}-${i}`}>
              <span className={`wc-ti${item.highlight ? " hl" : ""}`}>{item.text}</span>
              <span className="wc-ti-sep" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── SPECIALTIES ─── */}
      <section className="wc-spec-sec" id="specialties">
        <div className="wc-spec-inner">
          <div className="wc-spec-top wc-cr2">
            <div>
              <div className="wc-ey">Browse by specialty</div>
              <h2 className="wc-sh1 dark">
                Modalities for <em>every body</em>
              </h2>
            </div>
            <Link href="/search" className="wc-more-link">
              All specialties <ArrowRightIcon />
            </Link>
          </div>
          <div className="wc-spec-grid">
            {SPECIALTIES.map((spec, i) => (
              <Link
                key={spec.name}
                href={`/search?keyword=${encodeURIComponent(spec.name)}`}
                className={`wc-tilt-card wc-cr2 wc-d${(i % 4) + 1}`}
              >
                <div className="wc-tilt-inner">
                  <div className="wc-spec-bot-bar" />
                  <div className="wc-spec-icon">{spec.icon}</div>
                  <div className="wc-spec-nm">{spec.name}</div>
                  <div className="wc-spec-ct">{spec.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEIGHBORHOODS ─── */}
      <section className="wc-nbhd-sec" id="neighborhoods">
        <div className="wc-nbhd-head wc-cr2">
          <div className="wc-ey">By neighborhood</div>
          <h2 className="wc-sh1 light">
            Gay massage therapists
            <br />
            <em>in your neighborhood</em>
          </h2>
          <p className="wc-sl light" style={{ marginTop: 12 }}>
            From Oak Lawn to Montrose — hyperlocal search for the most relevant therapists near
            you.
          </p>
        </div>

        <div className="wc-nbhd-scroll" ref={nbhdScrollRef}>
          {NEIGHBORHOODS.map((n) => (
            <Link key={`${n.city}-${n.name}`} href={n.href} className="wc-nbhd-card">
              <div className="wc-nbhd-city">{n.city}</div>
              <div className="wc-nbhd-name">{n.name}</div>
              <div className="wc-nbhd-cnt">{n.count}</div>
              <div className="wc-nbhd-tags">
                {n.tags.map((t) => (
                  <span key={t} className="wc-nbhd-tag">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <div className="wc-nbhd-scroll-hint">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
          Drag to explore more neighborhoods
        </div>
      </section>

      {/* ─── FEATURED THERAPISTS ─── */}
      <section className="wc-ther-sec" id="therapists">
        <div className="wc-ther-inner">
          <div className="wc-ther-head wc-cr2">
            <div>
              <div className="wc-ey">Featured professionals</div>
              <h2 className="wc-sh1 light">
                Meet your next
                <br />
                <em>therapist</em>
              </h2>
            </div>
            <Link
              href="/therapists"
              className="wc-more-link"
              style={{ color: "rgba(255,181,112,.8)" }}
            >
              Browse all therapists <ArrowRightIcon />
            </Link>
          </div>
          <div className="wc-t-grid">
            {featuredTherapists.slice(0, 6).map((t, i) => (
              <Link
                key={t.slug || t.id}
                href={`/therapists/${t.slug || t.id}`}
                className={`wc-tc wc-cr2 wc-d${(i % 3) + 1}`}
              >
                <div className="wc-tc-img">
                  {t.avatar_url ? (
                    <Image
                      src={t.avatar_url}
                      alt={therapistName(t)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className={`wc-tc-bg ${GRADIENTS[i % 3]}`}>
                      {therapistInitial(t)}
                    </div>
                  )}
                  <div className="wc-tc-badge">{therapistBadge(t)}</div>
                  <div className="wc-tc-flag">🏳️‍🌈</div>
                </div>
                <div className="wc-tc-body">
                  <div className="wc-tc-nm">{therapistName(t)}</div>
                  <div className="wc-tc-loc">
                    <LocationPinIcon />
                    <span>{therapistLocation(t)}</span>
                  </div>
                  <div className="wc-tc-tags">
                    {(t.specialties || []).slice(0, 3).map((s) => (
                      <span key={s} className="wc-tc-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="wc-tc-foot">
                    <div className="wc-tc-rating">
                      <span className="wc-tc-stars">★★★★★</span> 4.9 ({t.review_count || 0})
                    </div>
                    <div className="wc-tc-price">
                      {therapistPrice(t)}
                      <small>/hr</small>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="wc-how-sec">
        <div className="wc-how-inner">
          <div className="wc-cr2">
            <div className="wc-ey">Simple process</div>
            <h2 className="wc-sh1 dark">
              How MasseurMatch
              <br />
              <em>works</em>
            </h2>
          </div>
          <div className="wc-how-grid">
            {[
              {
                n: "01",
                title: "Search your neighborhood",
                body: "Filter by specialty, LGBTQ+ affirming, neighborhood, and price. Every profile is verified before publishing.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16.5 16.5l3.5 3.5" />
                  </svg>
                ),
              },
              {
                n: "02",
                title: "Review credentials",
                body: "Read verified reviews, licenses, certifications, and full profiles. Know exactly who you'll be working with.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="15" y2="17" />
                  </svg>
                ),
              },
              {
                n: "03",
                title: "Connect directly",
                body: "Contact your therapist directly. No platform middleman, no booking fees — a private, direct connection.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.8a19.79 19.79 0 01-3.07-8.7A2 2 0 012.12 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                ),
              },
              {
                n: "04",
                title: "Book & relax",
                body: "Schedule at your convenience with a therapist who truly sees, welcomes, and celebrates every aspect of you.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div key={step.n} className={`wc-how-step wc-cr2 wc-d${i + 1}`}>
                <div className="wc-hs-n">{step.n}</div>
                <div className="wc-hs-icon">{step.icon}</div>
                <div className="wc-hs-title">{step.title}</div>
                <p className="wc-hs-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="wc-nl-sec" id="newsletter">
        <div className="wc-nl-inner">
          <div className="wc-cr2">
            <div className="wc-ey">Stay connected</div>
            <h2 className="wc-nl-title">
              Get the <em>best therapists</em>
              <br />
              delivered to you
            </h2>
            <p className="wc-nl-body">
              New verified therapists in your area, LGBTQ+ wellness guides, and exclusive early
              access — straight to your inbox. No spam, ever.
            </p>
            <ul className="wc-nl-perks">
              <li className="wc-nl-perk">
                <span className="wc-nl-perk-dot" /> New gay-affirming therapists in your city every
                week
              </li>
              <li className="wc-nl-perk">
                <span className="wc-nl-perk-dot" /> Queer wellness tips &amp; self-care guides
              </li>
              <li className="wc-nl-perk">
                <span className="wc-nl-perk-dot" /> First access to new cities &amp; specialties
              </li>
              <li className="wc-nl-perk">
                <span className="wc-nl-perk-dot" /> Therapists: 30-day free trial offer alerts
              </li>
            </ul>
          </div>
          <div className="wc-cr2 wc-d3">
            <div className="wc-nl-card">
              {!nlSuccess ? (
                <form onSubmit={handleNlSubmit}>
                  <div className="wc-nl-card-title">Join the community</div>
                  <div className="wc-nl-card-sub">Free. Unsubscribe anytime.</div>
                  <input
                    className="wc-nl-field"
                    type="text"
                    placeholder="Your name"
                    name="name"
                  />
                  <input
                    className="wc-nl-field"
                    type="email"
                    placeholder="Email address"
                    name="email"
                    required
                  />
                  <select className="wc-nl-select" name="city" defaultValue="">
                    <option value="" disabled>
                      Your city
                    </option>
                    <option>Dallas, TX</option>
                    <option>Houston, TX</option>
                    <option>Austin, TX</option>
                    <option>Miami, FL</option>
                    <option>Chicago, IL</option>
                    <option>Los Angeles, CA</option>
                    <option>New York, NY</option>
                    <option>Atlanta, GA</option>
                    <option>San Francisco, CA</option>
                    <option>Seattle, WA</option>
                    <option>Denver, CO</option>
                    <option>Phoenix, AZ</option>
                    <option>San Diego, CA</option>
                    <option>Fort Worth, TX</option>
                    <option>San Antonio, TX</option>
                    <option>Portland, OR</option>
                    <option>Nashville, TN</option>
                    <option>Other</option>
                  </select>
                  <button type="submit" className="wc-btn-nl">
                    Subscribe — It&apos;s Free
                    <ArrowRightIcon size={16} />
                  </button>
                </form>
              ) : (
                <div className="wc-nl-success show">
                  <div className="wc-nl-check">✓</div>
                  <div className="wc-nl-succ-t">You&apos;re in!</div>
                  <div className="wc-nl-succ-s">
                    Welcome to the MasseurMatch community. Check your inbox for a welcome message.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── INCLUSIVE ─── */}
      <section className="wc-inc-sec">
        <div className="wc-inc-inner wc-cr2">
          <div className="wc-inc-flags">🏳️‍🌈 🏳️‍⚧️ 🫶</div>
          <h2 className="wc-inc-title">
            Every body. Every identity.
            <br />
            Every need — welcomed here.
          </h2>
          <p className="wc-inc-body">
            MasseurMatch was built with LGBTQ+ inclusivity at its core. Gay-affirming therapists
            are verified and highlighted across Oak Lawn, Montrose, South Congress, and 100+ cities
            — so you always feel safe, seen, and celebrated from your very first search.
          </p>
          <Link href="/explore?keyword=LGBTQ%2B+affirming" className="wc-btn-inc">
            Find LGBTQ+ Affirming Therapists <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="wc-test-sec">
        <div className="wc-test-inner">
          <div className="wc-cr2">
            <div className="wc-ey">Community voices</div>
            <h2 className="wc-sh1 dark">
              What our community
              <br />
              <em>is saying</em>
            </h2>
          </div>
          <div className="wc-test-grid">
            {TESTIMONIALS.map((t, i) => (
              <article key={t.name} className={`wc-testc wc-cr2 wc-d${i + 1}`}>
                <div className="wc-test-stars">{"★".repeat(t.stars)}</div>
                <p className="wc-test-q">{t.body}</p>
                <div className="wc-test-auth">
                  <div className="wc-ta-av" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="wc-ta-nm">{t.name}</div>
                    <div className="wc-ta-mt">{t.meta}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="wc-faq-sec" id="faq">
        <div className="wc-faq-inner">
          <div className="wc-cr2">
            <div className="wc-ey">Common questions</div>
            <h2 className="wc-sh1 light">
              Everything you need
              <br />
              <em>to know</em>
            </h2>
          </div>
          <div className="wc-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.question} className={`wc-faq-item${openFaq === i ? " open" : ""}`}>
                <button type="button" className="wc-faq-q" onClick={() => toggleFaq(i)}>
                  <span className="wc-faq-q-text">{item.question}</span>
                  <div className="wc-faq-icon">
                    <PlusIcon />
                  </div>
                </button>
                <div className="wc-faq-a">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="wc-cta-sec">
        <div className="wc-cta-inner wc-cr2">
          <div className="wc-ey" style={{ justifyContent: "center" }}>
            Get started today
          </div>
          <h2 className="wc-cta-t">
            Your next session
            <br />
            starts <em>here</em>
          </h2>
          <p className="wc-cta-b">
            Join thousands of clients who found their perfect gay-affirming match. Browse verified
            therapists in your neighborhood — free, always.
          </p>
          <div className="wc-cta-note">
            <span className="wc-cta-note-dot" /> Therapists: 30-day free trial · No credit card
            required
          </div>
          <div className="wc-cta-btns">
            <Link href="/search" className="wc-btn-ctam">
              Find a Therapist Near Me
            </Link>
            <Link href="/signup" className="wc-btn-ctas">
              List Your Practice Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
