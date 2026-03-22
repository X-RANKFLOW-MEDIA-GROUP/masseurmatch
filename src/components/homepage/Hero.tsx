import { Search, MapPin, ArrowRight, Zap, Clock, Navigation } from "lucide-react";
import { useRef, useState, useCallback } from "react";
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
  const inputRef = searchInputRef ?? localRef as React.RefObject<HTMLInputElement>;
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    <section className="relative isolate overflow-hidden bg-brand-primary text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-brand-soft-accent-rgb)/0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgb(var(--color-brand-secondary-rgb)/0.22),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_88%)]" />
      <div className="page-shell relative py-14 sm:py-16 lg:py-20">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-12">
          {/* Left column: headline + smart search */}
          <div className="flex-1 lg:max-w-[58%]">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl font-light leading-[0.92] text-white sm:text-6xl lg:text-[5.5rem]"
            >
              Find your perfect
              <br />
              <em className="px-2 font-light italic text-brand-soft">massage</em> therapist
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg text-white/70"
            >
              {locationLine}
            </motion.p>

            {/* Smart Search Bar */}
            <motion.form
              action="/search"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative mt-8"
            >
              <div className="flex flex-col gap-3 rounded-[30px] border border-white/12 bg-white/[0.06] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:flex-row sm:items-center">
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[24px] px-3 py-2">
                  <Search className="h-5 w-5 shrink-0 text-white/45" />
                  <input
                    ref={inputRef}
                    name="keyword"
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Deep tissue, sports recovery, therapist name…"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38"
                    autoComplete="off"
                  />
                </label>
                <div className="hidden h-8 w-px bg-white/10 sm:block" />
                <label className="flex shrink-0 items-center gap-3 rounded-[24px] px-3 py-2">
                  <MapPin className="h-5 w-5 shrink-0 text-white/45" />
                  <input
                    name="city"
                    type="text"
                    defaultValue={city ?? ""}
                    placeholder="City"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38 sm:w-28"
                  />
                </label>
                <Button
                  type="submit"
                  variant="premium"
                  size="lg"
                  className="h-14 rounded-full px-8 text-sm font-semibold"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-3 right-3 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-brand-primary/95 shadow-2xl backdrop-blur-2xl"
                  >
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={() => handleSuggestionClick(s)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <Search className="h-3.5 w-3.5 text-white/30" />
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>

            {/* Smart Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              {SMART_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={`/search?keyword=${encodeURIComponent(chip.query)}${city ? `&city=${encodeURIComponent(city)}` : ""}`}
                  className={`group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                    chip.highlight
                      ? "border-green-400/30 bg-green-500/10 text-green-300 hover:border-green-400/50 hover:bg-green-500/20 hover:text-green-200"
                      : "border-white/10 bg-white/[0.045] text-white/64 hover:border-brand-accent/35 hover:bg-brand-accent/10 hover:text-brand-soft"
                  }`}
                >
                  {chip.highlight && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                    </span>
                  )}
                  {"gps" in chip && chip.gps && <Navigation className="h-3 w-3" />}
                  {"icon" in chip && chip.icon && <span>{chip.icon}</span>}
                  {chip.label}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Right column: Knotty Glass AI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden w-full max-w-sm self-center lg:block"
          >
            <KnottyGlassAI city={city} />
          </motion.div>
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

