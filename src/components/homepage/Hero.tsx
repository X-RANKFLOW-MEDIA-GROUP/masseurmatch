import { Search, MapPin, ArrowRight, Zap, Clock, Navigation } from "lucide-react";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { KnottyGlassAI } from "@/components/homepage/KnottyGlassAI";

type SmartChip = {
  label: string;
  icon: string | null;
  query: string;
  highlight?: boolean;
  gps?: boolean;
};

const SMART_CHIPS: SmartChip[] = [
  { label: "Deep Tissue", icon: "💆", query: "Deep Tissue" },
  { label: "Outcall", icon: "🚗", query: "Outcall" },
  { label: "Available Now", icon: null, query: "Available Now", highlight: true },
  { label: "Near Me", icon: null, query: "Near Me", gps: true },
  { label: "Swedish", icon: "🧘", query: "Swedish" },
  { label: "Sports Recovery", icon: "🏃", query: "Sports Recovery" },
];

const AUTOCOMPLETE_SUGGESTIONS = [
  "Deep tissue massage",
  "Swedish relaxation massage",
  "Sports recovery massage",
  "Mobile outcall massage",
  "Couples massage",
  "Hot stone massage",
];

type HeroProps = {
  neighborhood: string | null;
  city: string | null;
  searchInputRef?: React.RefObject<HTMLInputElement>;
};


export function Hero({ neighborhood, city, searchInputRef }: HeroProps) {
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef ?? (localRef as React.RefObject<HTMLInputElement>);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Typing effect for headline
  const phrases = useMemo(() => ["a massage therapist", "relaxation near you", "a premium experience"], []);
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases]);

  const filteredSuggestions = inputValue.length > 0
    ? AUTOCOMPLETE_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : [];

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.form?.submit();
  }, [inputRef]);

  const locationLine =
    neighborhood && city
      ? `Showing results near ${neighborhood}, ${city}`
      : city
        ? `Showing results near ${city}`
        : "Discover therapists near you";

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
      {/* Animated blob orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* Texto e Busca (Esquerda) */}
        <div className="flex-1 text-center lg:text-left">
          <motion.h1
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 premium-fade-up"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Find <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 min-h-[1.2em] inline-block animate-gradient-x">
              {text}<span className="animate-pulse">|</span>
            </span>
          </motion.h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
            The premium directory to connect with top-rated professionals. Discover tailored experiences based on your location and preferences.
          </p>

          {/* Search Bar Rápida - now glass effect */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0">
            <div className="relative flex-1 glass-card-light backdrop-blur-xl border border-white/40">
              <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter your city..."
                className="w-full pl-12 pr-4 py-3 rounded-full bg-transparent border-none shadow-none focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              />
            </div>
            <Button variant="premium" size="lg" className="rounded-full px-8 flex items-center gap-2">
              <Search className="w-5 h-5" /> Search
            </Button>
          </div>
        </div>

        {/* Knotty AI Interface (Direita) */}
        <div className="flex-1 w-full max-w-md relative">
          <div className="glass-card-light p-6 rounded-3xl shadow-2xl relative z-10">
            <KnottyGlassAI city={city} />
          </div>
          {/* Sombra de base para o Widget */}
          <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-gray-200 to-gray-50 rounded-3xl -z-10 transform rotate-3"></div>
        </div>
      </div>
    </section>
  );
}

/* ── Original chip tags preserved as internal links for SEO ── */
function _LegacyChipLinks({ city }: { city: string | null }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
      {["Deep Tissue", "Swedish", "Sports Recovery", "Mobile Massage", "Available Now"].map(
        (tag) => (
          <Link
            key={tag}
            href={`/search?keyword=${encodeURIComponent(tag)}${city ? `&city=${encodeURIComponent(city)}` : ""}`}
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/64 transition hover:border-brand-accent/35 hover:bg-brand-accent/10 hover:text-brand-soft"
          >
            {tag}
          </Link>
        ),
      )}
    </div>
  );
}

