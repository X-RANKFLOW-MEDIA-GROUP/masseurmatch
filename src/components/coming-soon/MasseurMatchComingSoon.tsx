"use client";

import Link from "next/link";
import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, MotionConfig, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, MapPin, Search, ShieldCheck, Sparkles, Users } from "lucide-react";

const C = {
  dark: "#0B1F3A",
  blue: "#1E4B8F",
  orange: "#FF8A1F",
  amber: "#FFB347",
  cream: "#FCFBF8",
  white: "#ffffff",
};

const LAUNCH_DATE = process.env.NEXT_PUBLIC_MASSEURMATCH_LAUNCH_DATE || "2026-09-01T14:00:00-04:00";

const launchFeatures = [
  "City based discovery built for local SEO and therapist visibility.",
  "Independent therapist profile pages with direct contact outside the platform.",
  "Premium visibility tiers for professionals who want stronger placement.",
  "Clear directory model with no bookings, payments, calendars, or platform fees.",
];

const audienceBadges = [
  "Independent therapists",
  "LGBTQ+ affirming discovery",
  "Local massage search",
  "Direct contact directory",
];

const previewCards = [
  { name: "Premium therapist profiles", city: "Profile pages built for search visibility", icon: ShieldCheck },
  { name: "Direct contact experience", city: "Clients contact therapists outside MasseurMatch", icon: Users },
  { name: "City discovery engine", city: "SEO pages by city, specialty, and service intent", icon: MapPin },
];

type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

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

  void fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = Array.from({ length: prefersReducedMotion ? 24 : 72 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00022,
      a: Math.random() * 0.45 + 0.12,
    }));

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
        const pulse = 0.65 + Math.sin(frame * 0.018 + x * 0.01) * 0.35;

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

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.72, pointerEvents: "none" }} />;
}

function CinematicNoise() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.085,
        mixBlendMode: "screen",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35) 0 1px, transparent 1px), radial-gradient(circle at 80% 30%, rgba(255,255,255,.24) 0 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,.18) 0 1px, transparent 1px)",
        backgroundSize: "7px 7px, 11px 11px, 15px 15px",
      }}
    />
  );
}

function MagneticButton({ children, type = "button", onClick, disabled }: { children: React.ReactNode; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18 });
  const springY = useSpring(y, { stiffness: 220, damping: 18 });

  function handleMove(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        x: springX,
        y: springY,
        minHeight: 56,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        border: 0,
        borderRadius: 18,
        padding: "0 22px",
        color: C.dark,
        background: `linear-gradient(135deg, ${C.orange}, ${C.amber})`,
        fontWeight: 950,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: "0 18px 54px rgba(255,138,31,.28)",
        opacity: disabled ? 0.72 : 1,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

function Countdown() {
  const countdown = useCountdown();
  const items = useMemo(
    () => [
      ["Days", countdown.days],
      ["Hours", countdown.hours],
      ["Minutes", countdown.minutes],
      ["Seconds", countdown.seconds],
    ] as const,
    [countdown],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.28 }}
      style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(68px, 1fr))", gap: 10, maxWidth: 480, marginTop: 28 }}
    >
      {items.map(([label, value]) => (
        <div key={label} style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", borderRadius: 20, padding: "14px 10px", textAlign: "center", backdropFilter: "blur(14px)" }}>
          <p style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)", lineHeight: 1, fontWeight: 950, color: C.white }}>{String(value).padStart(2, "0")}</p>
          <p style={{ margin: "7px 0 0", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(252,251,248,.44)" }}>{label}</p>
        </div>
      ))}
    </motion.div>
  );
}

function PointerGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 80, damping: 22 });
  const springY = useSpring(y, { stiffness: 80, damping: 22 });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX - 120);
      y.set(event.clientY - 120);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return <motion.div aria-hidden="true" style={{ x: springX, y: springY, position: "fixed", zIndex: 0, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,31,.18), transparent 66%)", pointerEvents: "none", mixBlendMode: "screen" }} />;
}

export function MasseurMatchComingSoon() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Early access updates, launch notice, and therapist onboarding priority. No spam.");
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    startedAtRef.current = Date.now();
    trackWaitlistEvent("page_view", { surface: "coming_soon" });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Securing your place on the early access list...");
    trackWaitlistEvent("waitlist_submit", { hasEmail: Boolean(email) });

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role: "visitor",
        eventName: "waitlist_signup",
        campaign: "prelaunch",
        pagePath: window.location.pathname,
        referrer: document.referrer,
        company,
        startedAt: startedAtRef.current,
        metadata: {
          surface: "coming_soon_hero",
          countdownTarget: LAUNCH_DATE,
        },
      }),
    });

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
      <main style={{ background: C.dark, color: C.white, minHeight: "100vh", overflow: "hidden", position: "relative" }}>
        <PointerGlow />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <FloatingParticles />
          <CinematicNoise />
          <motion.div animate={{ y: [-18, 18, -18], scale: [1, 1.04, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", right: "-180px", top: "-180px", width: 620, height: 620, borderRadius: "50%", background: "rgba(255,138,31,0.18)", filter: "blur(120px)" }} />
          <motion.div animate={{ y: [16, -16, 16], scale: [1, 1.06, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.3 }} style={{ position: "absolute", left: "-150px", bottom: "-120px", width: 540, height: 540, borderRadius: "50%", background: "rgba(30,75,143,0.55)", filter: "blur(110px)" }} />
          <motion.div animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }} transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "linear" }} style={{ position: "absolute", inset: 0, opacity: 0.055, backgroundImage: "linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <section style={{ position: "relative", zIndex: 1, maxWidth: 1220, margin: "0 auto", padding: "32px 20px 36px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Link href="/" aria-label="MasseurMatch homepage" style={{ display: "flex", alignItems: "center", gap: 12, color: C.white, textDecoration: "none" }} onClick={() => trackWaitlistEvent("logo_click")}>
                <div style={{ width: 46, height: 46, borderRadius: 18, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.orange}, ${C.blue})`, boxShadow: "0 0 42px rgba(255,138,31,.26)" }}>
                  <Sparkles size={21} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em" }}>Masseur<span style={{ color: C.orange }}>Match</span></p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(252,251,248,.46)" }}>Coming soon</p>
                </div>
              </Link>
            </motion.div>

            <motion.a href="#waitlist" onClick={() => trackWaitlistEvent("cta_click", { location: "header" })} initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} style={{ border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", color: C.white, textDecoration: "none", borderRadius: 999, padding: "11px 18px", fontSize: 14, fontWeight: 800, backdropFilter: "blur(14px)" }}>
              Join waitlist
            </motion.a>
          </header>

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", alignItems: "center", gap: 48, padding: "72px 0 44px" }}>
            <div>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,138,31,.30)", background: "rgba(255,138,31,.12)", color: "#FFE3C7", borderRadius: 999, padding: "10px 15px", fontSize: 14, fontWeight: 800, boxShadow: "0 0 40px rgba(255,138,31,.11)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: C.orange, boxShadow: "0 0 0 7px rgba(255,138,31,.12)" }} />
                Launching soon
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.08 }} style={{ margin: "28px 0 0", maxWidth: 780, fontSize: "clamp(46px, 8vw, 88px)", lineHeight: .94, letterSpacing: "-0.06em", fontWeight: 950 }}>
                Find the right massage therapist,<span style={{ display: "block", color: C.orange }}>beautifully.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.16 }} style={{ margin: "28px 0 0", maxWidth: 660, fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.75, color: "rgba(252,251,248,.68)" }}>
                MasseurMatch is a modern directory for discovering independent LGBTQ+ affirming massage therapists by city, service style, profile details, and direct contact preferences.
              </motion.p>

              <Countdown />

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.34 }} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
                {audienceBadges.map((badge) => <span key={badge} style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: "rgba(252,251,248,.76)", borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: 700, backdropFilter: "blur(14px)" }}>{badge}</span>)}
              </motion.div>

              <motion.form id="waitlist" onSubmit={handleSubmit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.42 }} style={{ marginTop: 38, maxWidth: 620, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", borderRadius: 28, padding: 12, boxShadow: "0 28px 80px rgba(0,0,0,.25)", backdropFilter: "blur(22px)" }}>
                <label htmlFor="email" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Email address</label>
                <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} name="company" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: "1 1 260px", minHeight: 56, display: "flex", alignItems: "center", gap: 12, borderRadius: 18, background: "rgba(0,0,0,.22)", padding: "0 16px" }}>
                    <Mail size={20} color="rgba(252,251,248,.46)" />
                    <input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} onFocus={() => trackWaitlistEvent("waitlist_focus")} placeholder="Enter your email for early access" style={{ width: "100%", background: "transparent", border: 0, outline: 0, color: C.white, fontSize: 14 }} />
                  </div>
                  <MagneticButton type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Locking..." : status === "success" ? "Joined" : "Get notified"}
                    {status === "success" ? <CheckCircle2 size={17} /> : <ArrowRight size={17} />}
                  </MagneticButton>
                </div>
                <motion.p key={message} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "11px 8px 0", fontSize: 12, lineHeight: 1.6, color: status === "error" ? "#FFC4B8" : status === "success" ? "#FFE3C7" : "rgba(252,251,248,.44)" }}>{message}</motion.p>
              </motion.form>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.94, y: 26 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.22 }} style={{ position: "relative", maxWidth: 560, width: "100%", margin: "0 auto" }}>
              <motion.div animate={{ scale: [1, 1.06, 1], opacity: [.55, .82, .55] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, borderRadius: 42, background: `linear-gradient(135deg, rgba(255,138,31,.42), rgba(30,75,143,.40))`, filter: "blur(44px)" }} />
              <div style={{ position: "relative", border: "1px solid rgba(255,255,255,.14)", background: "rgba(8,20,38,.82)", borderRadius: 40, padding: 18, boxShadow: "0 36px 90px rgba(0,0,0,.36)", backdropFilter: "blur(24px)" }}>
                <div style={{ border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", borderRadius: 30, padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                    <div><p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "rgba(252,251,248,.48)" }}>Preview</p><h2 style={{ margin: "3px 0 0", fontSize: 28, lineHeight: 1, letterSpacing: "-0.04em" }}>Discovery engine</h2></div>
                    <div style={{ width: 50, height: 50, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,138,31,.16)", color: C.amber }}><Search size={24} /></div>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {previewCards.map((item, index) => {
                      const Icon = item.icon;
                      return <motion.div key={item.name} animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * .45, ease: "easeInOut" }} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(0,0,0,.23)", borderRadius: 24, padding: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 48, height: 48, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,138,31,.16)", color: C.amber }}><Icon size={21} /></div><div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontWeight: 900, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p><p style={{ margin: "5px 0 0", fontSize: 13, color: "rgba(252,251,248,.48)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.city}</p></div><CheckCircle2 size={20} color={C.orange} /></div></motion.div>;
                    })}
                  </div>
                  <motion.div animate={status === "success" ? { scale: [1, 1.03, 1], borderColor: ["rgba(255,179,71,.18)", "rgba(255,179,71,.55)", "rgba(255,179,71,.18)"] } : {}} transition={{ duration: 1.1 }} style={{ marginTop: 16, border: "1px solid rgba(255,179,71,.18)", background: "rgba(255,138,31,.10)", borderRadius: 24, padding: 18 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#FFE3C7" }}>{status === "success" ? "Early access confirmed" : "Built for launch SEO"}</p>
                    <p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.7, color: "rgba(252,251,248,.58)" }}>{status === "success" ? "Your signup is saved in Supabase and tracked as a conversion event." : "Structured metadata, crawlable launch messaging, city discovery intent, and clear platform scope from day one."}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .45 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, paddingBottom: 12 }}>
            {launchFeatures.map((feature) => <div key={feature} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.055)", borderRadius: 24, padding: 20, backdropFilter: "blur(16px)" }}><CheckCircle2 size={20} color={C.orange} /><p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.65, color: "rgba(252,251,248,.68)" }}>{feature}</p></div>)}
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
}
