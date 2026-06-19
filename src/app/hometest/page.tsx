import type { Metadata } from "next";
import {
  Gem,
  CheckCircle2,
  Users,
  TrendingUp,
  BarChart3,
  Heart,
  Building2,
  ArrowRight,
  Search,
  Filter,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home Test - Premium Directory | MasseurMatch",
  description: "Premium male massage therapist directory showcase",
};

export default function HomeTestPage() {
  // Mock therapist profiles
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
    <div className="min-h-screen bg-background">
      {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Left: Large hero image */}
            <div className="lg:col-span-1">
              <div className="w-full aspect-square bg-gray-500 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-8xl">
                👨‍💼
              </div>
            </div>

            {/* Center: Main content */}
            <div className="lg:col-span-1">
              <h1 className="font-display text-5xl lg:text-6xl font-black text-black leading-tight mb-2 tracking-tight">
                Find The Right Massage.
              </h1>
              <h2 className="font-display text-5xl lg:text-6xl font-black text-[#FF8A1F] leading-tight mb-8 tracking-tight">
                Every Time.
              </h2>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <div className="flex-1 flex items-center gap-2 bg-white border-2 border-gray-300 rounded-full px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" strokeWidth={2.25} />
                  <input
                    type="text"
                    placeholder="Search by string"
                    className="flex-1 outline-none text-sm bg-transparent"
                  />
                </div>
                <select className="border-2 border-gray-300 rounded-full px-4 py-3 text-sm bg-white font-medium">
                  <option>All dates</option>
                </select>
                <button className="bg-[#FF8A1F] hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-colors">
                  SEARCH
                </button>
              </div>
            </div>

            {/* Right: Therapist cards */}
            <div className="lg:col-span-1 space-y-4">
              {therapists.map((therapist, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow flex items-start gap-3 relative"
                >
                  <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-3xl flex-shrink-0">
                    {therapist.image}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-black text-gray-900 text-sm">
                      {therapist.name}
                    </h3>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {therapist.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-gray-900">
                        ${therapist.rating}
                      </span>
                    </div>
                  </div>
                  {/* Orange badge on right */}
                  <div className="absolute right-3 top-3 bg-[#FF8A1F] rounded-full p-2 text-white">
                    <Gem className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES & STATS BAND ────────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 border-t border-b border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Feature icons */}
            {featureStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 text-gray-600 flex-shrink-0"
                    strokeWidth={2.25}
                  />
                  <span className="text-sm font-semibold text-gray-700">
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
                    className="w-5 h-5 text-gray-600 flex-shrink-0"
                    strokeWidth={2.25}
                  />
                  <div>
                    <div className="font-black text-gray-900 text-sm">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ILLUSTRATED THERAPIST PROFILES ────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-600 text-center mb-4">
            premium benefits
          </p>
          <h2 className="font-display text-5xl font-black text-black text-center mb-16 tracking-tight">
            Meet Our Verified Therapists
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-16 max-w-3xl mx-auto">
            {/* Profile 1 - With protective circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-80 h-80 mb-8">
                {/* Outer gray circle */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-300"></div>

                {/* Orange accent arc */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#FF8A1F 0deg 90deg, transparent 90deg)",
                    maskImage: "radial-gradient(circle, transparent 60%, black 80%)",
                  }}
                ></div>

                {/* Avatar placeholder */}
                <div className="absolute inset-12 bg-gray-200 rounded-full flex items-center justify-center text-8xl shadow-lg">
                  🧘‍♂️
                </div>
              </div>
              <h3 className="font-black text-2xl text-black text-center">
                Verified Professional
              </h3>
              <p className="text-sm text-gray-700 text-center mt-3">
                Certified therapist with protective circle verification
              </p>
            </div>

            {/* Profile 2 - With verified checkmark badge */}
            <div className="flex flex-col items-center">
              <div className="relative w-80 h-80 mb-8">
                {/* Outer gray circle */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-400"></div>

                {/* Orange accent arcs */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(transparent 0deg, transparent 90deg, #FF8A1F 180deg 270deg, transparent 270deg)",
                    maskImage: "radial-gradient(circle, transparent 60%, black 80%)",
                  }}
                ></div>

                {/* Avatar placeholder */}
                <div className="absolute inset-12 bg-gray-200 rounded-full flex items-center justify-center text-8xl shadow-lg">
                  💆‍♂️
                </div>

                {/* Verified checkmark badge */}
                <div className="absolute bottom-8 right-8 bg-[#FF8A1F] rounded-full p-5 shadow-2xl border-4 border-white">
                  <CheckCircle2
                    className="w-8 h-8 text-white"
                    strokeWidth={3}
                    fill="currentColor"
                  />
                </div>
              </div>
              <h3 className="font-black text-2xl text-black text-center">
                Premium Verified
              </h3>
              <p className="text-sm text-gray-700 text-center mt-3">
                Top-rated therapist with verified checkmark credential
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST & VERIFICATION ICONS SECTION ────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <h3 className="font-display text-3xl font-black text-black text-center mb-12 tracking-tight">
            Verification & Trust Icons
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200">
              <div className="bg-orange-100 p-4 rounded-full mb-4">
                <CheckCircle2
                  className="w-8 h-8 text-[#FF8A1F]"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-black text-gray-900 text-center text-sm">
                Verified Therapists
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                All profiles reviewed and confirmed
              </p>
            </div>

            <div className="flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200">
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <Heart
                  className="w-8 h-8 text-emerald-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-black text-gray-900 text-center text-sm">
                Professional Care
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                Licensed and certified experts
              </p>
            </div>

            <div className="flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users
                  className="w-8 h-8 text-blue-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-black text-gray-900 text-center text-sm">
                LGBTQ+ Affirming
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                Safe, welcoming, and inclusive space
              </p>
            </div>

            <div className="flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <TrendingUp
                  className="w-8 h-8 text-purple-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-black text-gray-900 text-center text-sm">
                Top Rated
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                Premium therapists with high ratings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DARK FOOTER SECTION ──────────────────────────────────────── */}
      <section className="px-4 py-8 sm:px-6 lg:px-8 bg-gray-800 text-white text-center">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-lg font-black mb-2 tracking-tight">MASSEURMATCH</h3>
          <p className="text-gray-300 text-xs mb-4">
            © masseurmatch.com • masseurmatch@masseurmatch.com
          </p>
          <p className="text-gray-400 text-xs">☎️ (000) 255-0775</p>
        </div>
      </section>
    </div>
  );
}
