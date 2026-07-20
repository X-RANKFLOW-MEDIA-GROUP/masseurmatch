import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Search, MessageSquare, CircleCheckBig, Brain, Zap, Target, MapPin, Shield, Lock, Heart, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Find Verified Male Massage Therapists Near You | MasseurMatch",
  description: "MasseurMatch is the premium US directory for verified LGBTQ+-affirming male massage therapists. Search Dallas, Miami, NYC, LA, Chicago & cities across the US. Compare deep tissue, Swedish, outcall & incall options.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0F1419] via-[#1a1f2e] to-[#0F1419]">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#8B1E2D] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#8B1E2D]/20 blur-2xl"></div>
        </div>
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex max-w-3xl flex-col justify-center">
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-white/70">LGBTQ+ Affirming • AI-Powered Discovery</p>
              <h1 className="font-display text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Find Your <span className="text-white">Verified Therapist</span>
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-gray-300 sm:text-xl">
                AI-powered discovery of verified, LGBTQ+-affirming male massage therapists across the US. Direct contact, transparent pricing, zero middleman.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white/70" strokeWidth={2.5} />
                  <span className="text-xs uppercase tracking-widest text-white/70 font-semibold">AI-Powered Discovery</span>
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <Link href="/explore" className="group inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-2xl shadow-[#8B1E2D]/30 transition duration-300 hover:bg-[#6E1521] hover:shadow-[#8B1E2D]/50">
                    Explore Therapists
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
                  </Link>
                  <Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-black uppercase tracking-wider text-white backdrop-blur-sm transition duration-300 hover:border-[#8B1E2D]/60 hover:bg-[#8B1E2D]/10">
                    Browse by City
                  </Link>
                </div>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
                <div>
                  <p className="text-lg font-black text-white">Reviewed</p>
                  <p className="mt-1 text-sm text-gray-400">Before going live</p>
                </div>
                <div>
                  <p className="text-lg font-black text-white">Direct contact</p>
                  <p className="mt-1 text-sm text-gray-400">No booking middleman</p>
                </div>
                <div>
                  <p className="text-lg font-black text-white">LGBTQ+ affirming</p>
                  <p className="mt-1 text-sm text-gray-400">Inclusive by design</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Discovery Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#f7f7f7] py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">AI-Powered Discovery</p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">Smart Matching Made Simple</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6F6F6F]">Our AI assistant learns what matters to you and connects you with the perfect therapist, faster than browsing alone.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, title: "Smart Matching", desc: "AI learns your preferences and finds therapists perfectly suited to you" },
              { icon: Zap, title: "Instant Results", desc: "Get personalized recommendations in seconds, not hours of browsing" },
              { icon: Target, title: "Precise Filtering", desc: "Filter by technique, availability, location, and pricing with ease" },
              { icon: MessageSquare, title: "Direct Communication", desc: "Connect directly with therapists—no booking platform in between" },
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[24px] border border-[#E8E8E8] bg-white/60 p-8 backdrop-blur-md transition duration-300 hover:border-[#8B1E2D]/30 hover:bg-white/80 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E2D]/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B1E2D]/10 text-[#8B1E2D] transition duration-300 group-hover:bg-[#8B1E2D]/20">
                    <item.icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-3 font-display text-xl font-bold text-[#111111]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6F6F6F]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="relative overflow-hidden bg-[#ffffff] py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">Browse by city</p>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">Explore Major US Cities</h2>
                <p className="mt-4 max-w-2xl text-lg text-[#6F6F6F]">Search verified therapists across 50+ cities from coast to coast</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["New York", "Los Angeles", "Miami", "Chicago", "Dallas", "Houston", "Atlanta", "Washington DC"].map((city, i) => (
              <Link key={i} href={`/${city.toLowerCase().replace(" ", "-")}`}>
                <div className="group flex flex-col justify-between rounded-[24px] border border-[#E8E8E8] bg-gradient-to-br from-[#f7f7f7] to-[#fafafa] p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:border-[#8B1E2D]/20 hover:shadow-xl min-h-44">
                  <div className="flex items-center gap-2 text-[#8B1E2D] mb-4">
                    <MapPin className="h-5 w-5" strokeWidth={2} />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E2D]">LGBTQ+ affirming</span>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-black text-[#111111] transition duration-300 group-hover:text-[#8B1E2D]">{city}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[#8B1E2D] transition duration-300 group-hover:translate-x-1">
                      <span className="text-sm font-semibold">Browse Therapists</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f7f7] to-[#ffffff] py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">Simple Process</p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">How It Works</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6F6F6F]">Three simple steps to find and connect with your perfect massage therapist</p>
          </div>
          <div className="space-y-8 lg:space-y-12">
            {[
              { step: "01", icon: Search, title: "Search & Filter", items: ["Filter by city", "Search by specialty", "View availability", "Compare pricing"] },
              { step: "02", icon: MessageSquare, title: "Review & Connect", items: ["Reviewed profiles", "Direct messaging", "Transparent pricing", "Detailed specialties"] },
              { step: "03", icon: CircleCheckBig, title: "Connect & Schedule", items: ["Direct contact", "No hidden fees", "Flexible scheduling", "Professional service"] },
            ].map((section, i) => (
              <div key={i} className="relative">
                <div className="grid gap-8 lg:grid-cols-[120px_1fr]">
                  <div className="flex flex-col items-start gap-4">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#8B1E2D] text-white shadow-lg shadow-[#8B1E2D]/20">
                        <section.icon className="h-10 w-10" strokeWidth={1.5} />
                      </div>
                      <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] font-display text-lg font-black text-white">{section.step}</div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-display text-2xl font-black text-[#111111] sm:text-3xl">{section.title}</h3>
                    <p className="mt-4 text-lg leading-relaxed text-[#6F6F6F]">Browse verified therapists by city, specialty, technique, availability, and pricing.</p>
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {section.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
                          <svg className="h-5 w-5 text-[#8B1E2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"></path></svg>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F1419] via-[#1a1f2e] to-[#0F1419] py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">Trust & Safety</p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">Built on Trust</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">We've built MasseurMatch from the ground up to prioritize safety, verification, and professional standards.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Reviewed Before Going Live", desc: "Every profile is reviewed before it appears." },
              { icon: Lock, title: "Direct Contact", desc: "No booking middleman. You contact therapists directly." },
              { icon: Heart, title: "LGBTQ+ Affirming", desc: "Profiles self-identify as affirming and welcoming." },
              { icon: Users, title: "Professional Community", desc: "MasseurMatch connects serious seekers with professionals." },
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 backdrop-blur-md transition duration-300 hover:border-[#8B1E2D]/30 hover:bg-white/[0.08]">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#8B1E2D]/10 blur-2xl transition duration-300 group-hover:bg-[#8B1E2D]/20"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B1E2D]/20 text-[#8B1E2D] transition duration-300 group-hover:bg-[#8B1E2D]/30">
                    <item.icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Therapists */}
      <section className="relative overflow-hidden bg-[#ffffff] py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">For Massage Therapists</p>
              <h2 className="mt-6 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">Grow Your Practice <span className="text-[#8B1E2D]">With MasseurMatch</span></h2>
              <p className="mt-8 text-lg leading-relaxed text-[#6F6F6F]">Join a curated directory built for serious massage therapists who want to reach clients in a professional, LGBTQ+-affirming environment.</p>
              <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Premium therapist directory",
                  "Direct client connections",
                  "Verified LGBTQ+ audience",
                  "No booking fees",
                  "Professional positioning",
                  "Growth opportunities",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold text-[#111111]">
                    <svg className="h-5 w-5 shrink-0 text-[#8B1E2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap gap-4 sm:gap-6">
                <Link href="/for-therapists" className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521] hover:shadow-[#8B1E2D]/40">
                  Join MasseurMatch
                  <ArrowRight className="h-4.5 w-4.5" strokeWidth={2} />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-8 py-4 text-sm font-black uppercase tracking-wider text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE]">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative space-y-4">
              {[
                { icon: "⏰", title: "Premium Profile Setup", desc: "Create a professional profile showcasing your expertise." },
                { icon: "👥", title: "Direct Client Connections", desc: "Connect directly with verified clients seeking your services." },
                { icon: "✓", title: "Zero Booking Fees", desc: "Keep 100% of your rates. No commissions, no hidden fees." },
              ].map((item, i) => (
                <div key={i} className="rounded-[24px] border border-[#E8E8E8] bg-white p-8 shadow-md transition hover:shadow-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D] text-lg">{item.icon}</div>
                  <h3 className="font-display text-lg font-bold text-[#111111]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#6F6F6F]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
