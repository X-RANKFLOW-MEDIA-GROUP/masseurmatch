"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  MessageCircle,
  Send,
  ArrowRight,
  Check,
  Lock,
  Shield,
} from "lucide-react";
import { HeroMediaBanner } from "@/components/marketing/HeroMediaBanner";
import type { PublicTherapist } from "@/app/_lib/directory";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const quickPrompts = [
  "Deep tissue in my area",
  "Available today",
  "Outcall services",
  "New therapists",
];

const trustItems = [
  { label: "Verified profiles", icon: Check },
  { label: "Secure & private", icon: Lock },
  { label: "Trusted reviews", icon: Shield },
];

function TherapistCard({ profile, index }: { profile: PublicTherapist; index: number }) {
  const router = useRouter();
  const displayName = profile.display_name || profile.full_name || "Therapist";

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: customEase, delay: 0.15 + index * 0.08 }}
      className="relative flex min-w-[250px] flex-1 flex-col rounded-[1.75rem] border border-black/5 bg-white/95 p-4 pt-36 shadow-[0_28px_70px_rgba(15,23,42,0.13)] backdrop-blur"
      onClick={() => router.push(`/therapists/${profile.slug || profile.id}`)}
    >
      {profile.profile_photo && (
        <div className="absolute inset-x-3 -top-20 flex h-56 items-end justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-slate-50 via-white to-white">
          <img
            src={profile.profile_photo}
            alt={`${displayName} profile photo`}
            loading={index === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover object-top mix-blend-multiply"
          />
        </div>
      )}
      <div className="mt-3">
        <h3 className="font-display text-lg font-black text-[#151515]">{displayName}</h3>
        <p className="text-sm text-[#5F6673]">{profile.city || "Location"}</p>
      </div>
      <button
        type="button"
        onClick={() => router.push(`/therapists/${profile.slug || profile.id}`)}
        className="mt-5 w-full rounded-xl bg-[#FF8A1F] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-[#FF8A1F]/20 transition hover:bg-[#E67600]"
      >
        View Profile
      </button>
    </motion.div>
  );
}

function isRealProfile(profile: PublicTherapist) {
  const id = profile.id?.toLowerCase() ?? "";
  const name = (profile.display_name ?? profile.full_name ?? "").toLowerCase();
  const phone = profile.phone ?? "";

  return (
    !profile.is_demo &&
    !id.startsWith("fallback-") &&
    !name.includes("demo") &&
    !name.includes("test") &&
    !name.includes("debug") &&
    !phone.includes("555")
  );
}

interface HeroClientProps {
  featuredTherapists?: PublicTherapist[];
}

export default function HeroClient({ featuredTherapists = [] }: HeroClientProps) {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [assistantInput, setAssistantInput] = useState("");

  const realProfiles = useMemo(
    () => featuredTherapists.filter(isRealProfile).slice(0, 3),
    [featuredTherapists],
  );

  const dur = reducedMotion ? 0 : 0.7;
  const noDelay = reducedMotion ? 0 : undefined;

  const submitAssistantPrompt = (prompt = assistantInput) => {
    const q = prompt.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_24%_18%,rgba(204,36,36,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfaf8_100%)] text-[#151515]">
      <div className="mx-auto grid min-h-[680px] max-w-[1500px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:px-10 lg:py-16">
        <div className="relative order-2 lg:order-1">
          <div className="pointer-events-none absolute -left-10 top-12 h-72 w-72 rounded-full bg-[#FF8A1F]/8 blur-3xl" />

          {realProfiles.length > 0 ? (
            <div className="relative flex snap-x gap-4 overflow-x-auto pb-6 pt-24 lg:overflow-visible lg:pb-0 lg:pt-28">
              {realProfiles.map((profile, index) => (
                <TherapistCard key={profile.id} profile={profile} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur, ease: customEase }}
              className="rounded-[2rem] border border-dashed border-[#FF8A1F]/30 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.09)]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8A1F]/10 text-[#FF8A1F]">
                <Sparkles size={24} />
              </div>
              <h2 className="font-display text-2xl font-black text-[#151515]">Live profile cards are ready.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#667085]">
                The hero only shows approved public profiles from Supabase. No demo names are rendered in this first fold.
              </p>
            </motion.div>
          )}
        </div>

        <div className="order-1 flex flex-col justify-center lg:order-2">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.12 }}
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.34em] text-[#FF8A1F] sm:text-xs"
          >
            PREMIUM.&nbsp;&nbsp;PROFESSIONAL.&nbsp;&nbsp;PERSONAL.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.2 }}
            className="mb-5 max-w-3xl font-display font-black leading-[0.96] tracking-tight"
            style={{ fontSize: "clamp(3rem, 6vw, 6.5rem)" }}
          >
            <span className="block text-[#151515]">Find the Right</span>
            <span className="block"><span className="text-[#FF8A1F]">Masseur</span> Near You.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.28 }}
            className="mb-7 max-w-2xl text-base leading-8 text-[#667085] lg:text-lg"
          >
            Browse professional massage providers by city, technique, availability, and style — with help from our AI assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.36 }}
            className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.10)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF8A1F]/10 text-[#FF8A1F]">
                  <MessageCircle size={23} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="font-display text-base font-black text-[#151515]">AI Match Assistant</p>
                  <p className="text-xs font-semibold text-[#7B8190]">Ask Knotty AI</p>
                </div>
              </div>
              <Sparkles size={20} className="text-[#FF8A1F]" />
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-md bg-slate-100 px-4 py-3 text-sm font-medium leading-6 text-[#2B3038]">
                I need a deep tissue masseur in Dallas tonight.
                <span className="mt-1 block text-right text-[11px] text-[#98A2B3]">10:24 AM</span>
              </div>
              <div className="flex max-w-[86%] items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF8A1F]/10 text-[#FF8A1F]">
                  <Sparkles size={16} />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-[#F7F7F8] px-4 py-3 text-sm font-medium leading-6 text-[#2B3038]">
                  I can help with that. Do you prefer in-call or outcall, and what area of Dallas works best for you?
                  <span className="mt-1 block text-[11px] text-[#98A2B3]">10:24 AM</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitAssistantPrompt(prompt)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-[#151515] transition hover:border-[#FF8A1F] hover:text-[#FF8A1F]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2">
                <input
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitAssistantPrompt();
                  }}
                  placeholder="Describe what you need..."
                  aria-label="Ask Knotty AI what massage provider you need"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#151515] outline-none placeholder:text-[#98A2B3]"
                />
                <button
                  type="button"
                  onClick={() => submitAssistantPrompt()}
                  aria-label="Send AI match request"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF8A1F] text-white shadow-lg shadow-[#FF8A1F]/25 transition hover:bg-[#E67600]"
                >
                  <Send size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.46 }}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-[#667085]"
          >
            {trustItems.map(({ label, icon: Icon }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon size={17} strokeWidth={2.25} className="text-[#151515]" />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.button
            type="button"
            onClick={() => router.push("/search")}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease: customEase, delay: noDelay ?? 0.52 }}
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-2xl bg-[#FF8A1F] px-6 py-4 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-[#FF8A1F]/20 transition hover:bg-[#E67600]"
          >
            Find a Masseur
            <ArrowRight size={18} strokeWidth={2.5} />
          </motion.button>
        </div>
                >
                  VIEW PROFILE
                </button>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {spotlights.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSpotlight(idx)}
                  aria-label={`Go to spotlight ${idx + 1}`}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === activeSpotlight
                      ? "bg-[#CC2424]"
                      : "bg-[#CC2424]/25"
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveSpotlight((prev) =>
                    prev === 0 ? spotlights.length - 1 : prev - 1
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[#666666] transition-colors hover:border-[#CC2424] hover:text-[#CC2424]"
                aria-label="Previous spotlight"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSpotlight((prev) =>
                    prev === spotlights.length - 1 ? 0 : prev + 1
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[#666666] transition-colors hover:border-[#CC2424] hover:text-[#CC2424]"
                aria-label="Next spotlight"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
>>>>>>> 63b0014 (Fix: Add onClick handlers to hero buttons and popular searches)
      </div>

      {/* ── Cinematic cover band (video on desktop, still on mobile) ──── */}
      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        whileInView={{ clipPath: "inset(0% 0 0 0)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reducedMotion ? 0 : 1.0, ease: customEase }}
        className="relative z-10 w-full overflow-hidden"
      >
        <HeroMediaBanner reducedMotion={!!reducedMotion} therapists={featuredTherapists} />
      </motion.div>
    </section>
  );
}
