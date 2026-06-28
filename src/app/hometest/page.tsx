import type { Metadata } from "next";
import {
  Gem,
  CheckCircle2,
  Users,
  TrendingUp,
  BarChart3,
  Heart,
  Building2,
  Search,
  Menu,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Home Test - Premium Directory | MasseurMatch",
  description: "Premium male massage therapist directory showcase",
};

export default function HomeTestPage() {
  const therapists = [
    {
      name: "Daniel M.",
      image: "👨‍⚕️",
      description: "Professional therapist with 10+ years massage and healthcare exp.",
      rating: 4.9,
    },
    {
      name: "Lucas S.",
      image: "👨‍⚕️",
      description: "Certified massage therapist specialized in deep tissue.",
      rating: 4.8,
    },
    {
      name: "Anderson R.",
      image: "👨‍⚕️",
      description: "Professional therapist with expertise in sports massage and care.",
      rating: 4.9,
    },
  ];

  const featureStats = [
    { icon: Gem, label: "Features" },
    { icon: CheckCircle2, label: "For appreciated bodies" },
    { icon: Users, label: "Professional therapists" },
    { icon: Building2, label: "100% healthfulness" },
  ];

  const numberStats = [
    { icon: Users, value: "45,000+", label: "licensed therapists" },
    { icon: BarChart3, value: "3.3x+", label: "faster therapy booking" },
    { icon: Building2, value: "23+", label: "premium benefits" },
  ];

  return (
    <div style={{ backgroundColor: "#F7F7F7", minHeight: "100vh" }}>
      {/* ─── HEADER/NAVIGATION ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D0D0D0" }}>
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="font-black text-lg" style={{ color: "#BB1D00" }}>
                MM
              </span>
              <span className="font-black text-sm tracking-tight" style={{ color: "#000000" }}>
                MASSEURMATCH
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#000000" }}>
                HOME
              </a>
              <a href="#" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#000000" }}>
                MASSEURES
              </a>
              <a href="#" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#000000" }}>
                HOW IT WORKS
              </a>
              <a href="#" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#000000" }}>
                MASSAGE PROFILE
              </a>
              <a href="#" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#000000" }}>
                CONTACT
              </a>
            </nav>

            {/* Right: Buttons */}
            <div className="flex items-center gap-3">
              <button
                className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors"
                style={{
                  color: "#000000",
                  backgroundColor: "transparent",
                  border: "1px solid #D0D0D0",
                }}
              >
                LOGIN
              </button>
              <button
                className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#BB1D00" }}
              >
                GET STARTED
              </button>
              {/* Mobile menu button */}
              <button className="md:hidden p-2" style={{ color: "#000000" }}>
                <Menu className="w-6 h-6" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto max-w-7xl">
          {/* Eyebrow */}
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] mb-8 text-center"
            style={{ color: "#6F6F6F" }}
          >
            Premium. Professional. Personal.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Left: Large hero image */}
            <div className="lg:col-span-1">
              <div
                className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-8xl"
                style={{ backgroundColor: "#8E8E8E" }}
              >
                👨‍💼
              </div>
            </div>

            {/* Center: Main content */}
            <div className="lg:col-span-1">
              <h1
                className="text-5xl lg:text-6xl font-display font-black leading-tight mb-2 tracking-tight"
                style={{ color: "#000000" }}
              >
                Find The Right Massage.
              </h1>
              <h2
                className="text-5xl lg:text-6xl font-display font-black leading-tight mb-8 tracking-tight"
                style={{ color: "#BB1D00" }}
              >
                Every Time.
              </h2>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <div
                  className="flex-1 flex items-center gap-2 rounded-full px-4 py-3 border-2"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D0D0D0",
                  }}
                >
                  <Search className="w-5 h-5" strokeWidth={2.25} style={{ color: "#8E8E8E" }} />
                  <input
                    type="text"
                    placeholder="Search by string"
                    className="flex-1 outline-none text-sm bg-transparent"
                    style={{ color: "#000000" }}
                  />
                </div>
                <select
                  className="border-2 rounded-full px-4 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D0D0D0",
                    color: "#000000",
                  }}
                >
                  <option>All dates</option>
                </select>
                <button
                  className="text-white px-8 py-3 rounded-full font-black transition-colors hover:opacity-90"
                  style={{ backgroundColor: "#E84C3D" }}
                >
                  SEARCH
                </button>
              </div>
            </div>

            {/* Right: Therapist cards */}
            <div className="lg:col-span-1 space-y-4">
              {therapists.map((therapist, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 hover:shadow-md transition-shadow flex items-start gap-3 relative"
                  style={{ backgroundColor: "#EEEEEE" }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ backgroundColor: "#D0D0D0" }}
                  >
                    {therapist.image}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3
                      className="font-black text-sm"
                      style={{ color: "#000000" }}
                    >
                      {therapist.name}
                    </h3>
                    <p className="text-xs line-clamp-2" style={{ color: "#6F6F6F" }}>
                      {therapist.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-black" style={{ color: "#000000" }}>
                        ${therapist.rating}
                      </span>
                    </div>
                  </div>
                  {/* Burgundy badge on right */}
                  <div
                    className="absolute right-3 top-3 rounded-full p-2 text-white"
                    style={{ backgroundColor: "#BB1D00" }}
                  >
                    <Gem className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES & STATS BAND ────────────────────────────────────── */}
      <section
        className="px-4 py-12 sm:px-6 lg:px-8 border-t border-b"
        style={{
          backgroundColor: "#F7F7F7",
          borderColor: "#D0D0D0",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Feature icons */}
            {featureStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    strokeWidth={2.25}
                    style={{ color: "#6F6F6F" }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#444444" }}
                  >
                    {stat.label}
                  </span>
                </div>
              );
            })}

            {/* Number stats */}
            {numberStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={`stat-${i}`} className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    strokeWidth={2.25}
                    style={{ color: "#6F6F6F" }}
                  />
                  <div>
                    <div
                      className="font-black text-sm"
                      style={{ color: "#000000" }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: "#8E8E8E" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ILLUSTRATED THERAPIST PROFILES ────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto max-w-7xl">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-center mb-4"
            style={{ color: "#8E8E8E" }}
          >
            premium benefits
          </p>
          <h2
            className="text-5xl font-display font-black text-center mb-16 tracking-tight"
            style={{ color: "#000000" }}
          >
            Meet Our Verified Therapists
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-16 max-w-3xl mx-auto">
            {/* Profile 1 - With protective circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-80 h-80 mb-8">
                {/* Outer gray circle */}
                <div
                  className="absolute inset-0 rounded-full border-8"
                  style={{ borderColor: "#CCCCCC" }}
                ></div>

                {/* Burgundy accent arc */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#BB1D00 0deg 90deg, transparent 90deg)",
                    maskImage: "radial-gradient(circle, transparent 60%, black 80%)",
                  }}
                ></div>

                {/* Avatar placeholder */}
                <div
                  className="absolute inset-12 rounded-full flex items-center justify-center text-8xl shadow-lg"
                  style={{ backgroundColor: "#D0D0D0" }}
                >
                  🧘‍♂️
                </div>
              </div>
              <h3
                className="font-display font-black text-2xl text-center tracking-tight"
                style={{ color: "#000000" }}
              >
                Verified Professional
              </h3>
              <p className="text-sm text-center mt-3" style={{ color: "#6F6F6F" }}>
                Certified therapist with protective circle verification
              </p>
            </div>

            {/* Profile 2 - With verified checkmark badge */}
            <div className="flex flex-col items-center">
              <div className="relative w-80 h-80 mb-8">
                {/* Outer gray circle */}
                <div
                  className="absolute inset-0 rounded-full border-8"
                  style={{ borderColor: "#8E8E8E" }}
                ></div>

                {/* Burgundy accent arcs */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(transparent 0deg, transparent 90deg, #BB1D00 180deg 270deg, transparent 270deg)",
                    maskImage: "radial-gradient(circle, transparent 60%, black 80%)",
                  }}
                ></div>

                {/* Avatar placeholder */}
                <div
                  className="absolute inset-12 rounded-full flex items-center justify-center text-8xl shadow-lg"
                  style={{ backgroundColor: "#D0D0D0" }}
                >
                  💆‍♂️
                </div>

                {/* Verified checkmark badge */}
                <div
                  className="absolute bottom-8 right-8 rounded-full p-5 shadow-2xl border-4 text-white"
                  style={{
                    backgroundColor: "#E84C3D",
                    borderColor: "#FFFFFF",
                  }}
                >
                  <CheckCircle2
                    className="w-8 h-8 text-white"
                    strokeWidth={3}
                    fill="currentColor"
                  />
                </div>
              </div>
              <h3
                className="font-display font-black text-2xl text-center tracking-tight"
                style={{ color: "#000000" }}
              >
                Premium Verified
              </h3>
              <p className="text-sm text-center mt-3" style={{ color: "#6F6F6F" }}>
                Top-rated therapist with verified checkmark credential
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST & VERIFICATION ICONS SECTION ────────────────────────── */}
      <section
        className="px-4 py-16 sm:px-6 lg:px-8 border-t"
        style={{
          backgroundColor: "#F7F7F7",
          borderColor: "#D0D0D0",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <h3
            className="text-3xl font-display font-black text-center mb-12 tracking-tight"
            style={{ color: "#000000" }}
          >
            Verification & Trust Icons
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div
              className="flex flex-col items-center p-8 rounded-2xl border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#D0D0D0",
              }}
            >
              <div
                className="p-4 rounded-full mb-4"
                style={{ backgroundColor: "#FFE8E8" }}
              >
                <CheckCircle2
                  className="w-8 h-8"
                  strokeWidth={2.25}
                  style={{ color: "#E84C3D" }}
                />
              </div>
              <h4
                className="font-black text-center text-sm"
                style={{ color: "#000000" }}
              >
                Verified Therapists
              </h4>
              <p className="text-xs text-center mt-2" style={{ color: "#8E8E8E" }}>
                All profiles reviewed and confirmed
              </p>
            </div>

            <div
              className="flex flex-col items-center p-8 rounded-2xl border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#D0D0D0",
              }}
            >
              <div
                className="p-4 rounded-full mb-4"
                style={{ backgroundColor: "#E8F5E9" }}
              >
                <Heart
                  className="w-8 h-8"
                  strokeWidth={2.25}
                  style={{ color: "#4CAF50" }}
                />
              </div>
              <h4
                className="font-black text-center text-sm"
                style={{ color: "#000000" }}
              >
                Professional Care
              </h4>
              <p className="text-xs text-center mt-2" style={{ color: "#8E8E8E" }}>
                Licensed and certified experts
              </p>
            </div>

            <div
              className="flex flex-col items-center p-8 rounded-2xl border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#D0D0D0",
              }}
            >
              <div
                className="p-4 rounded-full mb-4"
                style={{ backgroundColor: "#E3F2FD" }}
              >
                <Users
                  className="w-8 h-8"
                  strokeWidth={2.25}
                  style={{ color: "#2196F3" }}
                />
              </div>
              <h4
                className="font-black text-center text-sm"
                style={{ color: "#000000" }}
              >
                LGBTQ+ Affirming
              </h4>
              <p className="text-xs text-center mt-2" style={{ color: "#8E8E8E" }}>
                Safe, welcoming, and inclusive space
              </p>
            </div>

            <div
              className="flex flex-col items-center p-8 rounded-2xl border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#D0D0D0",
              }}
            >
              <div
                className="p-4 rounded-full mb-4"
                style={{ backgroundColor: "#F3E5F5" }}
              >
                <TrendingUp
                  className="w-8 h-8"
                  strokeWidth={2.25}
                  style={{ color: "#9C27B0" }}
                />
              </div>
              <h4
                className="font-black text-center text-sm"
                style={{ color: "#000000" }}
              >
                Top Rated
              </h4>
              <p className="text-xs text-center mt-2" style={{ color: "#8E8E8E" }}>
                Premium therapists with high ratings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DARK FOOTER SECTION ──────────────────────────────────────── */}
      <section className="px-4 py-8 sm:px-6 lg:px-8 text-white text-center" style={{ backgroundColor: "#111111" }}>
        <div className="mx-auto max-w-7xl">
          <h3 className="text-lg font-black mb-2 tracking-tight">MASSEURMATCH</h3>
          <p className="text-xs mb-4" style={{ color: "#CCCCCC" }}>
            © masseurmatch.com • masseurmatch@masseurmatch.com
          </p>
          <p className="text-xs" style={{ color: "#8E8E8E" }}>
            ☎️ (000) 255-0775
          </p>
        </div>
      </section>
    </div>
  );
}
