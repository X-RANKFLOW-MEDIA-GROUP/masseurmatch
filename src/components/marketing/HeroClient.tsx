"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { HeroMediaBanner } from "@/components/marketing/HeroMediaBanner";
import type { PublicTherapist } from "@/app/_lib/directory";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const quickPrompts = [
  "Deep tissue in Dallas",
  "Sports massage near me",
  "Available tonight",
];

const trustItems = [
  { label: "Verified Providers", icon: ShieldCheck },
  { label: "Real Reviews", icon: Star },
  { label: "LGBTQ+ Affirming", icon: Users },
];

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

function getProfileHref(profile: PublicTherapist) {
  return profile.slug ? `/therapists/${profile.slug}` : `/therapists/${profile.id}`;
}

function getLocation(profile: PublicTherapist) {
  return [profile.neighborhood ?? profile.city, profile.state].filter(Boolean).join(", ") || "United States";
}

function getPrice(profile: PublicTherapist) {
  const price = profile.starting_price ?? profile.incall_price ?? profile.outcall_price;
  return price ? `$${price}` : "Contact";
}

function TherapistCard({ profile, index, router }: { profile: PublicTherapist; index: number; router: ReturnType<typeof useRouter> }) {
  const name = profile.display_name ?? profile.full_name ?? "Therapist";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const specialty = profile.specialties?.[0] ?? profile.massage_techniques?.[0] ?? "Massage Therapist";
  const photoSrc = profile.avatar_url ?? profile.profile_photo ?? null;
  const cardPosition = index === 1 ? "z-10 scale-[1.03]" : "opacity-90";

  return (
    <motion.article
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: customEase, delay: 0.15 + index * 0.08 }}
      className={`relative flex min-w-[250px] flex-1 flex-col rounded-[1.75rem] border border-black/5 bg-white/95 p-4 pt-36 shadow-[0_28px_70px_rgba(15,23,42,0.13)] backdrop-blur ${cardPosition}`}
    >
      <button
        type="button"
        aria-label={`Save ${name}`}
        className="absolute right-5 top-5 z-20 rounded-full bg-white/80 p-2 text-slate-400 shadow-sm transition hover:text-[#CC2424]"
      >
        <Heart size={17} strokeWidth={2.25} />
      </button>

      <div className="absolute inset-x-3 -top-20 flex h-56 items-end justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-slate-50 via-white to-white">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={`${name} profile photo`}
            loading={index === 1 ? "eager" : "lazy"}
            className="h-full w-full object-cover object-top mix-blend-multiply"
          />
        ) : (
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#CC2424] to-[#8B0A1E] text-2xl font-black text-white shadow-xl">
            {initials}
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#CC2424] to-[#8B0A1E] text-xs font-black text-white shadow-md">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-black text-[#151515]">{name}</h3>
          <p className="line-clamp-1 text-sm text-[#5F6673]">{specialty}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-[#7B8190]">
          <MapPin size={15} strokeWidth={2.3} className="text-[#9AA0AA]" />
          <span className="line-clamp-1">{getLocation(profile)}</span>
        </div>
        {profile.verification_status === "verified" && (
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} strokeWidth={2.25} className="text-[#CC2424]" />
            <span className="font-bold text-[#151515]">Verified</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-[#5F6673]">
          <span className="flex items-center gap-1.5">
            <Clock size={15} strokeWidth={2.25} className="text-[#9AA0AA]" />
            60 min
          </span>
          <span className="font-black text-[#151515]">{getPrice(profile)}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(profile.is_verified_photos || profile.verification_status === "verified") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700">
            <BadgeCheck size={13} className="text-[#CC2424]" />
            Verified Photo
          </span>
        )}
        {profile.available_now && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available Now
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push(getProfileHref(profile))}
        className="mt-5 w-full rounded-xl bg-[#CC2424] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-[#CC2424]/20 transition hover:bg-[#A81D1D]"
      >
        View Profile
      </button>
    </motion.article>
  );
}

export default function HeroClient({ therapists = [] }: { therapists?: PublicTherapist[] }) {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [assistantInput, setAssistantInput] = useState("");

  const realProfiles = useMemo(
    () => therapists.filter(isRealProfile).slice(0, 3),
    [therapists],
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
          <div className="pointer-events-none absolute -left-10 top-12 h-72 w-72 rounded-full bg-[#CC2424]/8 blur-3xl" />

          {realProfiles.length > 0 ? (
            <div className="relative flex snap-x gap-4 overflow-x-auto pb-6 pt-24 lg:overflow-visible lg:pb-0 lg:pt-28">
              {realProfiles.map((profile, index) => (
                <TherapistCard key={profile.id} profile={profile} index={index} router={router} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur, ease: customEase }}
              className="rounded-[2rem] border border-dashed border-[#CC2424]/30 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.09)]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CC2424]/10 text-[#CC2424]">
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
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.34em] text-[#CC2424] sm:text-xs"
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
            <span className="block"><span className="text-[#CC2424]">Masseur</span> Near You.</span>
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CC2424]/10 text-[#CC2424]">
                  <MessageCircle size={23} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="font-display text-base font-black text-[#151515]">AI Match Assistant</p>
                  <p className="text-xs font-semibold text-[#7B8190]">Ask Knotty AI</p>
                </div>
              </div>
              <Sparkles size={20} className="text-[#CC2424]" />
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-md bg-slate-100 px-4 py-3 text-sm font-medium leading-6 text-[#2B3038]">
                I need a deep tissue masseur in Dallas tonight.
                <span className="mt-1 block text-right text-[11px] text-[#98A2B3]">10:24 AM</span>
              </div>
              <div className="flex max-w-[86%] items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CC2424]/10 text-[#CC2424]">
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
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-[#151515] transition hover:border-[#CC2424] hover:text-[#CC2424]"
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
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#CC2424] text-white shadow-lg shadow-[#CC2424]/25 transition hover:bg-[#A81D1D]"
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
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-2xl bg-[#CC2424] px-6 py-4 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-[#CC2424]/20 transition hover:bg-[#A81D1D]"
          >
            Find a Masseur
            <ArrowRight size={18} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        whileInView={{ clipPath: "inset(0% 0 0 0)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reducedMotion ? 0 : 1.0, ease: customEase }}
        className="relative z-10 w-full overflow-hidden"
      >
        <HeroMediaBanner reducedMotion={!!reducedMotion} therapists={therapists} />
      </motion.div>
    </section>
  );
}
