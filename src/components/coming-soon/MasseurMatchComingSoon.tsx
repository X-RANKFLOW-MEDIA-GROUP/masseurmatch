"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, MapPin, Search, ShieldCheck, Sparkles, Users } from "lucide-react";

const C = {
  dark: "#0B1F3A",
  blue: "#1E4B8F",
  orange: "#FF8A1F",
  amber: "#FFB347",
  cream: "#FCFBF8",
  white: "#ffffff",
};

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
  {
    name: "Premium therapist profiles",
    city: "Profile pages built for search visibility",
    icon: ShieldCheck,
  },
  {
    name: "Direct contact experience",
    city: "Clients contact therapists outside MasseurMatch",
    icon: Users,
  },
  {
    name: "City discovery engine",
    city: "SEO pages by city, specialty, and service intent",
    icon: MapPin,
  },
];

export function MasseurMatchComingSoon() {
  return (
    <MotionConfig reducedMotion="user">
      <main style={{ background: C.dark, color: C.white, minHeight: "100vh", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <motion.div
            animate={{ y: [-18, 18, -18], scale: [1, 1.04, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", right: "-180px", top: "-180px", width: 620, height: 620, borderRadius: "50%", background: "rgba(255,138,31,0.18)", filter: "blur(120px)" }}
          />
          <motion.div
            animate={{ y: [16, -16, 16], scale: [1, 1.06, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
            style={{ position: "absolute", left: "-150px", bottom: "-120px", width: 540, height: 540, borderRadius: "50%", background: "rgba(30,75,143,0.55)", filter: "blur(110px)" }}
          />
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            style={{ position: "absolute", inset: 0, opacity: 0.055, backgroundImage: "linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px)", backgroundSize: "64px 64px" }}
          />
        </div>

        <section style={{ position: "relative", zIndex: 1, maxWidth: 1220, margin: "0 auto", padding: "32px 20px 36px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Link href="/" aria-label="MasseurMatch homepage" style={{ display: "flex", alignItems: "center", gap: 12, color: C.white, textDecoration: "none" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.orange}, ${C.blue})`, boxShadow: "0 0 42px rgba(255,138,31,.26)" }}>
                  <Sparkles size={21} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em" }}>Masseur<span style={{ color: C.orange }}>Match</span></p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(252,251,248,.46)" }}>Coming soon</p>
                </div>
              </Link>
            </motion.div>

            <motion.a href="#waitlist" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} style={{ border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", color: C.white, textDecoration: "none", borderRadius: 999, padding: "11px 18px", fontSize: 14, fontWeight: 800, backdropFilter: "blur(14px)" }}>
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
                Find the right massage therapist,
                <span style={{ display: "block", color: C.orange }}>beautifully.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.16 }} style={{ margin: "28px 0 0", maxWidth: 660, fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.75, color: "rgba(252,251,248,.68)" }}>
                MasseurMatch is a modern directory for discovering independent LGBTQ+ affirming massage therapists by city, service style, profile details, and direct contact preferences.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.24 }} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
                {audienceBadges.map((badge) => (
                  <span key={badge} style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: "rgba(252,251,248,.76)", borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: 700, backdropFilter: "blur(14px)" }}>{badge}</span>
                ))}
              </motion.div>

              <motion.form id="waitlist" action="/api/waitlist" method="POST" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.32 }} style={{ marginTop: 38, maxWidth: 620, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", borderRadius: 28, padding: 12, boxShadow: "0 28px 80px rgba(0,0,0,.25)", backdropFilter: "blur(22px)" }}>
                <label htmlFor="email" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Email address</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: "1 1 260px", minHeight: 56, display: "flex", alignItems: "center", gap: 12, borderRadius: 18, background: "rgba(0,0,0,.22)", padding: "0 16px" }}>
                    <Mail size={20} color="rgba(252,251,248,.46)" />
                    <input id="email" name="email" type="email" required placeholder="Enter your email for early access" style={{ width: "100%", background: "transparent", border: 0, outline: 0, color: C.white, fontSize: 14 }} />
                  </div>
                  <button type="submit" style={{ minHeight: 56, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, border: 0, borderRadius: 18, padding: "0 22px", color: C.dark, background: `linear-gradient(135deg, ${C.orange}, ${C.amber})`, fontWeight: 950, cursor: "pointer", boxShadow: "0 18px 54px rgba(255,138,31,.28)" }}>
                    Get notified <ArrowRight size={17} />
                  </button>
                </div>
                <p style={{ margin: "11px 8px 0", fontSize: 12, lineHeight: 1.6, color: "rgba(252,251,248,.44)" }}>Early access updates, launch notice, and therapist onboarding priority. No spam.</p>
              </motion.form>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.94, y: 26 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.22 }} style={{ position: "relative", maxWidth: 560, width: "100%", margin: "0 auto" }}>
              <motion.div animate={{ scale: [1, 1.06, 1], opacity: [.55, .82, .55] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, borderRadius: 42, background: `linear-gradient(135deg, rgba(255,138,31,.42), rgba(30,75,143,.40))`, filter: "blur(44px)" }} />
              <div style={{ position: "relative", border: "1px solid rgba(255,255,255,.14)", background: "rgba(8,20,38,.82)", borderRadius: 40, padding: 18, boxShadow: "0 36px 90px rgba(0,0,0,.36)", backdropFilter: "blur(24px)" }}>
                <div style={{ border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", borderRadius: 30, padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "rgba(252,251,248,.48)" }}>Preview</p>
                      <h2 style={{ margin: "3px 0 0", fontSize: 28, lineHeight: 1, letterSpacing: "-0.04em" }}>Discovery engine</h2>
                    </div>
                    <div style={{ width: 50, height: 50, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,138,31,.16)", color: C.amber }}><Search size={24} /></div>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    {previewCards.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div key={item.name} animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * .45, ease: "easeInOut" }} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(0,0,0,.23)", borderRadius: 24, padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,138,31,.16)", color: C.amber }}><Icon size={21} /></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 900, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                              <p style={{ margin: "5px 0 0", fontSize: 13, color: "rgba(252,251,248,.48)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.city}</p>
                            </div>
                            <CheckCircle2 size={20} color={C.orange} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 16, border: "1px solid rgba(255,179,71,.18)", background: "rgba(255,138,31,.10)", borderRadius: 24, padding: 18 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#FFE3C7" }}>Built for launch SEO</p>
                    <p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.7, color: "rgba(252,251,248,.58)" }}>Structured metadata, crawlable launch messaging, city discovery intent, and clear platform scope from day one.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .45 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, paddingBottom: 12 }}>
            {launchFeatures.map((feature) => (
              <div key={feature} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.055)", borderRadius: 24, padding: 20, backdropFilter: "blur(16px)" }}>
                <CheckCircle2 size={20} color={C.orange} />
                <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.65, color: "rgba(252,251,248,.68)" }}>{feature}</p>
              </div>
            ))}
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
}
