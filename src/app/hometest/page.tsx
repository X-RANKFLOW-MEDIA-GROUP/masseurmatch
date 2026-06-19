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
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          {/* Eyebrow */}
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-600 mb-8 text-center">
            Premium. Professional. Personal.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Left: Large hero image */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-6xl">
                  👨‍💼
                </div>
              </div>
            </div>

            {/* Center: Main content */}
            <div className="lg:col-span-1">
              <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
                Find The Right Massage. <br />
                <span className="text-orange-500">Every Time.</span>
              </h1>

              {/* Search bar */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" strokeWidth={2.25} />
                  <input
                    type="text"
                    placeholder="Search by string"
                    className="flex-1 outline-none text-sm"
                  />
                </div>
                <select className="border border-gray-300 rounded px-4 py-3 text-sm bg-white">
                  <option>All dates</option>
                </select>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-semibold transition-colors">
                  SEARCH
                </button>
              </div>
            </div>

            {/* Right: Therapist cards */}
            <div className="lg:col-span-1 space-y-3">
              {therapists.map((therapist, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl flex-shrink-0">
                      {therapist.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {therapist.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {therapist.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-semibold text-gray-900">
                          ${therapist.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES & STATS BAND ────────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 bg-white border-t border-b border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Feature icons */}
            {featureStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 text-gray-700 flex-shrink-0"
                    strokeWidth={2.25}
                  />
                  <span className="text-sm font-medium text-gray-700">
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
                    className="w-5 h-5 text-gray-700 flex-shrink-0"
                    strokeWidth={2.25}
                  />
                  <div>
                    <div className="font-bold text-gray-900">{stat.value}</div>
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
          <h2 className="font-display text-4xl font-extrabold text-gray-900 text-center mb-16">
            Meet Our Verified Therapists
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 max-w-2xl mx-auto">
            {/* Profile 1 - With protective circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64 mb-6">
                {/* Circular protective design */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
                <div
                  className="absolute inset-4 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#FF8A1F 0deg 90deg, transparent 90deg 180deg, #E5E7EB 180deg 270deg, transparent 270deg)",
                  }}
                ></div>

                {/* Avatar placeholder with therapeutic massage illustration */}
                <div className="absolute inset-8 bg-gray-200 rounded-full flex items-center justify-center text-7xl shadow-lg">
                  🧘‍♂️
                </div>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 text-center">
                Verified Professional
              </h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                Certified therapist with protective circle verification
              </p>
            </div>

            {/* Profile 2 - With verified checkmark badge */}
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64 mb-6">
                {/* Circular protective design */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-400"></div>
                <div
                  className="absolute inset-4 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#E5E7EB 0deg 180deg, #FF8A1F 180deg 270deg, transparent 270deg)",
                  }}
                ></div>

                {/* Avatar placeholder */}
                <div className="absolute inset-8 bg-gray-200 rounded-full flex items-center justify-center text-7xl shadow-lg">
                  💆‍♂️
                </div>

                {/* Verified checkmark badge */}
                <div className="absolute bottom-4 right-4 bg-orange-500 rounded-full p-3 shadow-lg border-4 border-white">
                  <CheckCircle2
                    className="w-8 h-8 text-white"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 text-center">
                Premium Verified
              </h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                Top-rated therapist with verified checkmark credential
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST & VERIFICATION ICONS SECTION ────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl">
          <h3 className="font-display text-2xl font-extrabold text-gray-900 text-center mb-12">
            Verification & Trust Icons
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="bg-orange-100 p-4 rounded-full mb-4">
                <CheckCircle2
                  className="w-8 h-8 text-orange-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
                Verified Therapists
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                All profiles reviewed and confirmed
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <Heart
                  className="w-8 h-8 text-emerald-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
                Professional Care
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                Licensed and certified experts
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users
                  className="w-8 h-8 text-blue-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
                LGBTQ+ Affirming
              </h4>
              <p className="text-xs text-gray-600 text-center mt-2">
                Safe, welcoming, and inclusive space
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <TrendingUp
                  className="w-8 h-8 text-purple-500"
                  strokeWidth={2.25}
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
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
      <section className="px-4 py-8 sm:px-6 lg:px-8 bg-gray-900 text-white text-center">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-xl font-bold mb-2">MASSEURMATCH</h3>
          <p className="text-gray-400 text-sm mb-4">
            © masseurmatch.com • masseurmatch@masseurmatch.com
          </p>
          <p className="text-gray-500 text-xs">☎️ (000) 255-0775</p>
        </div>
      </section>
    </div>
  );
}
