"use client";

import Link from "next/link";
import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, MotionConfig, useMotionValue, useSpring } from "framer-motion";

const C = {
  serif: "'Georgia', 'Times New Roman', serif" as const,
  sans: "system-ui, -apple-system, sans-serif" as const,
  dark: "#111111",
  blue: "#8B1E2D",
  orange: "#8B1E2D",
  amber: "#FFB347",
  cream: "#FFFFFF",
  white: "#ffffff",
  muted: "#C9D2DF",
};

const LAUNCH_DATE = process.env.NEXT_PUBLIC_MASSEURMATCH_LAUNCH_DATE || "2026-09-01T14:00:00-04:00";

const trustLinks = [
  { label: "Trust & Safety", href: "/trust-and-safety" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Support", href: "mailto:support@masseurmatch.com" },
];

const launchFeatures = [
  { title: "Private discovery", text: "Browse independent therapists by city, service style, and profile details." },
  { title: "Direct contact", text: "Clients contact therapists outside the platform. No booking or payment layer." },
  { title: "Premium visibility", text: "Built for polished professional profiles and city based search demand." },
];

const knottyAnswers: Record<string, string> = {
  clients:
    "Knotty says: MasseurMatch helps clients discover independent massage therapists by location, profile details, service style, and contact preferences. You contact therapists directly outside the platform.",
  therapists:
    "Knotty says: Therapists will be able to create visibility focused profiles, join launch priority, and prepare for premium placement as the directory opens.",
  safety:
    "Knotty says: MasseurMatch is a directory, not a booking service. Boundaries, rates, availability, and session details are confirmed directly between the client and therapist.",
  launch:
    "Knotty says: The launch page is collecting early access interest now. Join the list and we will notify you when the directory opens.",
};

type CountdownValue = { days: number; hours: number; minutes: number; seconds: number };

function getCountdown(): CountdownValue {
  const launch = new Date(LAUNCH_DATE).getTime();
  const diff = Math.max(0, launch - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function useCountdown() {
  const [value, setValue] = useState<CountdownValue>(() => getCountdown());
  useEffect(() => {
    const id = window.setInterval(() => setValue(getCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return value;
}

function trackWaitlistEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const body = {
    eventName,
    campaign: "prelaunch",
    pagePath: window.location.pathname,
    referrer: document.referrer,
    metadata: {
      ...metadata,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    },
  };
  const payload = JSON.stringify(body);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/waitlist", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
}

function LuxuryIcon({ type }: { type: "diamond" | "shield" | "compass" | "knotty" | "signal" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "diamond") {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M10 18 18 8h12l8 10-14 22L10 18Z"/><path {...common} d="M18 8 24 40 30 8M10 18h28M16 18l8-10 8 10"/></svg>;
  }
  if (type === "shield") {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M24 6 39 12v12c0 10-6.4 15.8-15 19-8.6-3.2-15-9-15-19V12l15-6Z"/><path {...common} d="m17.5 24 4.2 4.2L31 18.8"/></svg>;
  }
  if (type === "compass") {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><circle {...common} cx="24" cy="24" r="17"/><path {...common} d="m30.5 14.5-4.2 11.8-11.8 4.2 4.2-11.8 11.8-4.2Z"/><circle {...common} cx="24" cy="24" r="2"/></svg>;
  }
  if (type === "signal") {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M10 32c8-8 20-8 28 0M16 25c4.6-4.4 11.4-4.4 16 0M22 18c1.2-1 2.8-1 4 0"/><circle cx="24" cy="38" r="2.5" fill="currentColor"/></svg>;
  }
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M14 18c0-6 4-10 10-10s10 4 10 10v12c0 6-4 10-10 10s-10-4-10-10V18Z"/><path {...common} d="M18 21c4 3 8 3 12 0M18 29c4-3 8-3 12 0"/><path {...common} d="M8 24h6M34 24h6"/></svg>;
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = Array.from({ length: reduced ? 22 : 64 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.35, vx: (Math.random() - 0.5) * 0.0002, vy: (Math.random() - 0.5) * 0.0002, a: Math.random() * 0.42 + 0.1 }));
    let frame = 0;
    let raf = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const render = () => {
      frame += 1;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const x = p.x * window.innerWidth;
        const y = p.y * window.innerHeight;
        const pulse = 0.62 + Math.sin(frame * 0.018 + x * 0.01) * 0.38;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 179, 71, ${p.a * pulse})`;
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(render);
    };
    resize();
    render();
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); window.cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.62, pointerEvents: "none" }} />;
}

function PointerGlow() {
  const x = useMotionValue(-240);
  const y = useMotionValue(-240);
  const springX = useSpring(x, { stiffness: 80, damping: 22 });
  const springY = useSpring(y, { stiffness: 80, damping: 22 });
  useEffect(() => {
    const handleMove = (event: PointerEvent) => { x.set(event.clientX - 140); y.set(event.clientY - 140); };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);
  return <motion.div aria-hidden="true" style={{ x: springX, y: springY, position: "fixed", zIndex: 0, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,30,45,.16), transparent 66%)", pointerEvents: "none", mixBlendMode: "screen" }} />;
}

function MagneticButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18 });
  const springY = useSpring(y, { stiffness: 220, damping: 18 });
  function handleMove(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
  }
  return (
    <motion.button type="submit" disabled={disabled} onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x: springX, y: springY, minHeight: 58, border: 0, borderRadius: 999, padding: "0 26px", color: C.dark, background: `linear-gradient(135deg, ${C.orange}, ${C.amber})`, fontFamily: C.sans, fontWeight: 800, letterSpacing: "0.01em", cursor: disabled ? "not-allowed" : "pointer", boxShadow: "0 18px 54px rgba(139,30,45,.28)", opacity: disabled ? 0.72 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }} whileTap={{ scale: 0.98 }}>
      {children}
    </motion.button>
  );
}

function Countdown() {
  const countdown = useCountdown();
  const items = useMemo(() => [["Days", countdown.days], ["Hours", countdown.hours], ["Minutes", countdown.minutes], ["Seconds", countdown.seconds]] as const, [countdown]);
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(68px, 1fr))", gap: 10, maxWidth: 460, margin: "30px auto 0" }}>
      {items.map(([label, value]) => <div key={label} style={{ border: "1px solid rgba(255,255,255,.13)", background: "rgba(255,255,255,.06)", borderRadius: 0, padding: "16px 10px", textAlign: "center", backdropFilter: "blur(16px)" }}><p style={{ margin: 0, fontFamily: C.serif, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1, fontWeight: 400, color: C.cream }}>{String(value).padStart(2, "0")}</p><p style={{ margin: "8px 0 0", fontFamily: C.sans, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(252,251,248,.42)" }}>{label}</p></div>)}
    </motion.div>
  );
}

function KnottyConcierge() {
  const [answerKey, setAnswerKey] = useState("clients");
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} style={{ margin: "32px auto 0", maxWidth: 760, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.055)", padding: 18, backdropFilter: "blur(18px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <div style={{ width: 42, height: 42, color: C.amber }}><LuxuryIcon type="knotty" /></div>
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontFamily: C.serif, fontSize: 22, color: C.cream }}>Ask Knotty</p>
          <p style={{ margin: "4px 0 0", fontFamily: C.sans, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(252,251,248,.42)" }}>Launch concierge</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        {[["clients", "For clients"], ["therapists", "For therapists"], ["safety", "Safety"], ["launch", "Launch"]].map(([key, label]) => <button key={key} type="button" onClick={() => { setAnswerKey(key); trackWaitlistEvent("knotty_question", { topic: key }); }} style={{ border: "1px solid rgba(255,255,255,.13)", background: answerKey === key ? "rgba(139,30,45,.16)" : "rgba(255,255,255,.045)", color: answerKey === key ? "#FFE3C7" : "rgba(252,251,248,.66)", padding: "8px 12px", fontFamily: C.sans, fontSize: 12, cursor: "pointer" }}>{label}</button>)}
      </div>
      <motion.p key={answerKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 640, margin: "16px auto 0", fontFamily: C.sans, fontSize: 14, lineHeight: 1.75, color: "rgba(252,251,248,.68)", textAlign: "center" }}>{knottyAnswers[answerKey]}</motion.p>
    </motion.div>
  );
}

export function MasseurMatchComingSoon() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Early access updates, launch notice, and therapist onboarding priority. No spam.");
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => { startedAtRef.current = Date.now(); trackWaitlistEvent("page_view", { surface: "coming_soon" }); }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Securing your place on the early access list...");
    trackWaitlistEvent("waitlist_submit", { hasEmail: Boolean(email) });
    const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role: "visitor", eventName: "waitlist_signup", campaign: "prelaunch", pagePath: window.location.pathname, referrer: document.referrer, company, startedAt: startedAtRef.current, metadata: { surface: "coming_soon_hero", countdownTarget: LAUNCH_DATE } }) });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage(data.error || "Something failed. Try again in a moment.");
      trackWaitlistEvent("waitlist_error", { error: data.error || response.status });
      return;
    }
    setStatus("success");
    setMessage("You are on the early access list. Launch signal locked.");
    setEmail("");
    trackWaitlistEvent("waitlist_success", { conversion: true });
  }

  return (
    <MotionConfig reducedMotion="user">
      <main style={{ background: C.dark, color: C.white, minHeight: "100vh", overflow: "hidden", position: "relative", fontFamily: C.sans }}>
        <PointerGlow />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <FloatingParticles />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.075, mixBlendMode: "screen", backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35) 0 1px, transparent 1px), radial-gradient(circle at 80% 30%, rgba(255,255,255,.24) 0 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,.18) 0 1px, transparent 1px)", backgroundSize: "7px 7px, 11px 11px, 15px 15px" }} />
          <motion.div animate={{ y: [-18, 18, -18], scale: [1, 1.04, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", right: "-180px", top: "-180px", width: 620, height: 620, borderRadius: "50%", background: "rgba(139,30,45,0.15)", filter: "blur(120px)" }} />
          <motion.div animate={{ y: [16, -16, 16], scale: [1, 1.06, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.3 }} style={{ position: "absolute", left: "-150px", bottom: "-120px", width: 540, height: 540, borderRadius: "50%", background: "rgba(139,30,45,0.58)", filter: "blur(110px)" }} />
        </div>

        <section style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "clamp(64px, 10vw, 104px) 20px 34px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ margin: "0 auto 26px", width: 74, height: 74, color: C.amber }}><LuxuryIcon type="diamond" /></motion.div>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.58, delay: 0.05 }} style={{ margin: "0 auto 22px", fontFamily: C.sans, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: C.orange }}>MasseurMatch · Private launch</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ margin: "0 auto", maxWidth: 900, fontFamily: C.serif, fontSize: "clamp(48px, 9vw, 94px)", lineHeight: 1.02, letterSpacing: "-0.045em", fontWeight: 400, color: C.cream }}>
            Find the right massage therapist,<br /><em style={{ color: C.orange, fontStyle: "italic" }}>beautifully.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.66, delay: 0.18 }} style={{ margin: "28px auto 0", maxWidth: 660, fontFamily: C.sans, fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.8, color: "rgba(252,251,248,.65)", fontWeight: 300 }}>
            A polished directory for discovering independent LGBTQ+ affirming massage therapists by city, service style, profile details, and direct contact preferences.
          </motion.p>

          <Countdown />

          <motion.form id="waitlist" onSubmit={handleSubmit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.38 }} style={{ margin: "38px auto 0", maxWidth: 640, width: "100%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", padding: 12, boxShadow: "0 28px 80px rgba(0,0,0,.25)", backdropFilter: "blur(22px)" }}>
            <label htmlFor="email" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Email address</label>
            <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} name="company" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <div style={{ flex: "1 1 260px", minHeight: 58, display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,.22)", padding: "0 18px" }}>
                <div style={{ width: 22, height: 22, color: "rgba(255,179,71,.72)" }}><LuxuryIcon type="signal" /></div>
                <input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} onFocus={() => trackWaitlistEvent("waitlist_focus")} placeholder="Enter your email for early access" style={{ width: "100%", background: "transparent", border: 0, outline: 0, color: C.white, fontFamily: C.sans, fontSize: 14 }} />
              </div>
              <MagneticButton disabled={status === "loading"}>{status === "loading" ? "Locking..." : status === "success" ? "Joined" : "Get notified"}</MagneticButton>
            </div>
            <motion.p key={message} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "12px 8px 0", fontFamily: C.sans, fontSize: 12, lineHeight: 1.6, color: status === "error" ? "#FFC4B8" : status === "success" ? "#FFE3C7" : "rgba(252,251,248,.44)" }}>{message}</motion.p>
          </motion.form>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, margin: "34px auto 0", maxWidth: 920, width: "100%" }}>
            {launchFeatures.map((item, index) => <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, delay: 0.48 + index * 0.08 }} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.052)", padding: 22, textAlign: "left", backdropFilter: "blur(16px)" }}><div style={{ width: 36, height: 36, color: C.amber, marginBottom: 16 }}><LuxuryIcon type={index === 0 ? "compass" : index === 1 ? "shield" : "diamond"} /></div><p style={{ margin: 0, fontFamily: C.serif, fontSize: 22, color: C.cream }}>{item.title}</p><p style={{ margin: "10px 0 0", fontFamily: C.sans, fontSize: 13, lineHeight: 1.75, color: "rgba(252,251,248,.58)" }}>{item.text}</p></motion.div>)}
          </div>

          <KnottyConcierge />

          <footer style={{ marginTop: 34, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.10)", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {trustLinks.map((link) => <Link key={link.label} href={link.href} onClick={() => trackWaitlistEvent("footer_link_click", { label: link.label })} style={{ color: "rgba(252,251,248,.54)", fontFamily: C.sans, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>{link.label}</Link>)}
          </footer>
        </section>
      </main>
    </MotionConfig>
  );
}
