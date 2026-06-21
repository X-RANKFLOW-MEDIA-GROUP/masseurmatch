import type { Metadata } from "next";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  TrendingUp,
  Zap,
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Lock,
  Verified,
  ThumbsUp,
  ArrowRight,
  Search,
  Filter,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Trophy,
  Sparkles,
  Target,
  BarChart3,
  Send,
  BadgeCheck,
  Eye,
  Hand,
  Wind,
  Activity,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home Test - Icon Showcase | MasseurMatch",
  description: "Test page showcasing premium icon implementation with lucide-react",
};

export default function HomeTestPage() {
  const features = [
    {
      icon: ShieldCheck,
      label: "Verified Profiles",
      description: "All therapists reviewed and vetted before launch",
    },
    {
      icon: BadgeCheck,
      label: "Trusted & Safe",
      description: "Premium vetting for your peace of mind",
    },
    {
      icon: Users,
      label: "LGBTQ+ Affirming",
      description: "Welcoming professionals across the community",
    },
    {
      icon: TrendingUp,
      label: "Top Specialists",
      description: "The best therapists in your area",
    },
    {
      icon: Zap,
      label: "Quick Booking",
      description: "Direct contact—no middleman required",
    },
    {
      icon: Heart,
      label: "Wellness Focus",
      description: "Premium therapeutic experience",
    },
  ];

  const services = [
    { icon: MessageCircle, label: "Chat Support" },
    { icon: MapPin, label: "Local Search" },
    { icon: Clock, label: "Availability" },
    { icon: DollarSign, label: "Transparent Pricing" },
    { icon: Phone, label: "Direct Contact" },
    { icon: Calendar, label: "Schedule Now" },
  ];

  const statsIcons = [
    { icon: Users, label: "45,000+", description: "Therapists Reviewed" },
    { icon: MapPin, label: "80+", description: "Cities Covered" },
    { icon: TrendingUp, label: "5.3x", description: "Faster Matches" },
    { icon: Trophy, label: "23", description: "Premium Features" },
  ];

  const socialProof = [
    { icon: Star, label: "Top Rated" },
    { icon: Award, label: "Industry Leading" },
    { icon: CheckCircle2, label: "Verified Listings" },
    { icon: Sparkles, label: "Premium Quality" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── DARK HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1A1A1A] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Left: Text content */}
            <div className="flex flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-400 mb-4">
                Premium Icons Showcase
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                Find the Right Massage.{" "}
                <span className="text-red-400">Every Time.</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-lg">
                A premium directory of LGBTQ+-affirming male massage therapists
                across 80+ US cities. Verified, trusted, and easy to find.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Search className="w-5 h-5" strokeWidth={2.25} />
                  Search Therapists
                </button>
                <Link
                  href="/"
                  className="border border-white/20 text-white px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  Back to Home
                  <ArrowRight className="w-5 h-5" strokeWidth={2.25} />
                </Link>
              </div>
            </div>

            {/* Right: Feature icons grid */}
            <div className="grid grid-cols-2 gap-4 self-center">
              {[
                { icon: ShieldCheck, color: "text-emerald-400" },
                { icon: Heart, color: "text-red-400" },
                { icon: Users, color: "text-blue-400" },
                { icon: Star, color: "text-yellow-400" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-center justify-center backdrop-blur"
                  >
                    <Icon className={`w-12 h-12 ${item.color}`} strokeWidth={2} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ──────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-400 mb-4">
              Why Choose Us
            </p>
            <h2 className="font-display text-4xl font-extrabold text-gray-900 mb-4">
              Premium Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every element designed to build trust and make finding your perfect
              therapist effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <Icon
                      className="w-8 h-8 text-red-500"
                      strokeWidth={2.25}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {feature.label}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION WITH ICONS ─────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-extrabold text-gray-900 text-center mb-16">
            By the Numbers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statsIcons.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                      <Icon
                        className="w-8 h-8 text-red-500"
                        strokeWidth={2.25}
                      />
                    </div>
                  </div>
                  <div className="font-display text-3xl font-extrabold text-gray-900 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-gray-600">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ICONS GRID ──────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-extrabold text-gray-900 text-center mb-16">
            Available Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Icon
                    className="w-6 h-6 text-red-500 flex-shrink-0"
                    strokeWidth={2.25}
                  />
                  <span className="font-semibold text-gray-900">
                    {service.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── COMPREHENSIVE ICON SHOWCASE ──────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-extrabold text-gray-900 text-center mb-4">
            Icon Library
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            All icons use lucide-react with intentional strokeWidth and sizing
            in rem units for consistency
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "ShieldCheck", Icon: ShieldCheck },
              { name: "BadgeCheck", Icon: BadgeCheck },
              { name: "CheckCircle2", Icon: CheckCircle2 },
              { name: "Heart", Icon: Heart },
              { name: "Star", Icon: Star },
              { name: "Trophy", Icon: Trophy },
              { name: "Award", Icon: Award },
              { name: "Sparkles", Icon: Sparkles },
              { name: "Users", Icon: Users },
              { name: "MapPin", Icon: MapPin },
              { name: "Clock", Icon: Clock },
              { name: "Phone", Icon: Phone },
              { name: "Mail", Icon: Mail },
              { name: "Send", Icon: Send },
              { name: "Search", Icon: Search },
              { name: "Filter", Icon: Filter },
              { name: "ArrowRight", Icon: ArrowRight },
              { name: "TrendingUp", Icon: TrendingUp },
              { name: "BarChart3", Icon: BarChart3 },
              { name: "Target", Icon: Target },
              { name: "Eye", Icon: Eye },
              { name: "Lock", Icon: Lock },
              { name: "Verified", Icon: Verified },
              { name: "Calendar", Icon: Calendar },
              { name: "Activity", Icon: Activity },
              { name: "Hand", Icon: Hand },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-red-400 transition-colors"
              >
                <item.Icon
                  className="w-6 h-6 text-red-500"
                  strokeWidth={2.25}
                />
                <span className="text-xs text-gray-600 text-center font-mono">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DARK SECTION WITH ICONS ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1A1A1A] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-extrabold text-white text-center mb-16">
            Why <span className="text-red-400">MasseurMatch</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {socialProof.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur"
                >
                  <Icon
                    className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1"
                    strokeWidth={2.25}
                  />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      {item.label}
                    </h3>
                    <p className="text-white/70">
                      Premium quality and trust are our foundation
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ───────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-4">
            Ready to find your perfect therapist?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Browse verified professionals in 80+ US cities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors">
              <Search className="w-5 h-5" strokeWidth={2.25} />
              Search Now
            </button>
            <Link
              href="/"
              className="border-2 border-red-500 text-red-500 hover:bg-red-50 px-8 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Back Home
              <ArrowRight className="w-5 h-5" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
