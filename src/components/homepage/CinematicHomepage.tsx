"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  Search, MapPin, Shield, Star, Phone, MessageSquare, 
  ChevronRight, Sparkles, CheckCircle, Users, Award, 
  Clock, Heart, ArrowRight, Globe
} from "lucide-react";
import type { Profile } from "@/lib/supabase/directory";

interface CinematicHomepageProps {
  featuredTherapists: Profile[];
  totalTherapists: number;
  cityCount: number;
}

// Hero Section with cinematic dark navy gradient
function HeroSection({ totalTherapists, cityCount }: { totalTherapists: number; cityCount: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const cities = [
    "Dallas", "Houston", "Austin", "Miami", "Los Angeles", "New York", 
    "Chicago", "San Francisco", "Atlanta", "Denver", "Seattle"
  ];

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[100vh] overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060B12 0%, #0B1F3A 45%, #16386A 100%)" }}
    >
      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Animated radial glows */}
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full"
        style={{ 
          background: "radial-gradient(circle, rgba(30,75,143,0.4) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] rounded-full"
        style={{ 
          background: "radial-gradient(circle, rgba(255,138,31,0.2) 0%, transparent 60%)",
          filter: "blur(100px)",
        }}
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hero content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[100vh] px-4 sm:px-6 lg:px-8 pt-24 pb-16"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF8A1F] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              The Premium Massage Directory
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-[-0.03em] mb-6"
          >
            Find Independent{" "}
            <span className="bg-gradient-to-r from-[#FF8A1F] to-[#FFB347] bg-clip-text text-transparent">
              Massage Therapists
            </span>
            {" "}Near You
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Compare profiles, specialties, trust signals and direct contact options 
            in one premium directory. No booking fees. Contact therapists directly.
          </motion.p>

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div 
              className="p-2 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/50 focus:border-transparent transition-all"
                  />
                </div>
                
                {/* City select */}
                <div className="sm:w-48 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/50 cursor-pointer"
                  >
                    <option value="" className="bg-[#0B1F3A] text-white">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city.toLowerCase()} className="bg-[#0B1F3A] text-white">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search button */}
                <Link
                  href={`/explore${selectedCity ? `?city=${selectedCity}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
                  className="h-14 px-8 rounded-xl bg-gradient-to-r from-[#FF8A1F] to-[#FF9E45] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FF8A1F]/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { value: totalTherapists > 0 ? `${totalTherapists}+` : "500+", label: "Verified Therapists" },
              { value: "100%", label: "LGBTQ+ Affirming" },
              { value: `${cityCount}+`, label: "Cities" },
              { value: "4.9", label: "Avg Rating" },
            ].map((stat, i) => (
              <div 
                key={stat.label}
                className="text-center px-6 py-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="font-stat text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Quick action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FF8A1F]" />
              Available Now
            </Link>
            <Link
              href="/explore?lgbtq=true"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#FF8A1F]" />
              LGBTQ+ Friendly
            </Link>
            <Link
              href="/for-therapists"
              className="px-6 py-3 rounded-full bg-[#1E4B8F] border border-[#1E4B8F] text-white font-medium hover:bg-[#16386A] transition-all flex items-center gap-2"
            >
              List Your Profile
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-white/50" />
        </div>
      </motion.div>
    </section>
  );
}

// Featured Therapists Section
function FeaturedTherapists({ therapists }: { therapists: Profile[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  if (therapists.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 bg-[#FCFBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] text-xs font-semibold uppercase tracking-[0.15em] mb-4">
            <Star className="w-3.5 h-3.5 text-[#FF8A1F]" />
            Featured Profiles
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1F3A] mb-4">
            Top-Rated Massage Therapists
          </h2>
          <p className="text-lg text-[#4A4F5C] max-w-2xl mx-auto">
            Discover verified professionals with exceptional ratings and reviews
          </p>
        </motion.div>

        {/* Therapist grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {therapists.slice(0, 8).map((therapist, index) => (
            <TherapistCard 
              key={therapist.id} 
              therapist={therapist} 
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0B1F3A] text-white font-semibold hover:bg-[#16386A] transition-all duration-300 hover:shadow-lg"
          >
            View All Therapists
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Therapist Card Component
function TherapistCard({ therapist, index, isInView }: { therapist: Profile; index: number; isInView: boolean }) {
  const tierColors: Record<string, { bg: string; border: string; text: string }> = {
    elite: { bg: "bg-gradient-to-r from-[#FFB347] to-[#FF8A1F]", border: "border-[#FF8A1F]/30", text: "text-[#0B1F3A]" },
    pro: { bg: "bg-[#1E4B8F]", border: "border-[#1E4B8F]/20", text: "text-white" },
    standard: { bg: "bg-[#0B1F3A]", border: "border-[#0B1F3A]/10", text: "text-white" },
    free: { bg: "bg-[#64748B]", border: "border-[#64748B]/10", text: "text-white" },
  };

  const tier = (therapist.subscription_tier || "free").toLowerCase();
  const tierStyle = tierColors[tier] || tierColors.free;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group"
    >
      <Link href={`/therapists/${therapist.slug || therapist.id}`}>
        <div 
          className={`relative overflow-hidden rounded-2xl bg-white border ${tierStyle.border} shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}
        >
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={therapist.avatar_url || therapist.photo_url || "/images/placeholder-therapist.jpg"}
              alt={therapist.display_name || "Therapist"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
              {/* Tier badge */}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tierStyle.bg} ${tierStyle.text}`}>
                {tier === "free" ? "Basic" : tier}
              </span>

              {/* Available Now */}
              {therapist.available_now && (
                <span className="px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Available
                </span>
              )}
            </div>

            {/* Profile info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display text-lg font-bold text-white mb-1 line-clamp-1">
                {therapist.display_name || "Massage Therapist"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <MapPin className="w-3.5 h-3.5" />
                <span className="line-clamp-1">
                  {therapist.neighborhood_name || therapist.city || "Location"}
                  {therapist.city && therapist.neighborhood_name ? `, ${therapist.city}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Card content */}
          <div className="p-4">
            {/* Verification badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {therapist.is_verified_identity && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  ID Verified
                </span>
              )}
              {therapist.lgbtq_affirming && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                  <Heart className="w-3 h-3" />
                  LGBTQ+
                </span>
              )}
            </div>

            {/* Specialties */}
            {therapist.specialties && therapist.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {therapist.specialties.slice(0, 3).map((specialty) => (
                  <span 
                    key={specialty}
                    className="px-2 py-0.5 rounded-full bg-[#F4F6F9] text-[#4A4F5C] text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E6F0]">
              <div>
                {therapist.incall_price || therapist.outcall_price ? (
                  <div className="text-[#0B1F3A]">
                    <span className="text-xs text-[#64748B]">From </span>
                    <span className="font-stat text-lg font-bold">
                      ${therapist.incall_price || therapist.outcall_price}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-[#64748B]">Contact for pricing</span>
                )}
              </div>
              <span className="text-[#FF8A1F] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                View Profile
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Trust Section
function TrustSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Shield,
      title: "Identity Verified",
      description: "Every therapist goes through a secure identity verification process for your safety",
    },
    {
      icon: Star,
      title: "Authentic Reviews",
      description: "Read real feedback from verified clients to make informed decisions",
    },
    {
      icon: MapPin,
      title: "Real Locations",
      description: "All service areas and locations are verified and regularly updated",
    },
    {
      icon: Clock,
      title: "Real-time Availability",
      description: "See who is available now and book directly with the therapist",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] text-xs font-semibold uppercase tracking-[0.15em] mb-4">
            <CheckCircle className="w-3.5 h-3.5 text-[#FF8A1F]" />
            Trust & Safety
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1F3A] mb-4">
            Your Safety is Our Priority
          </h2>
          <p className="text-lg text-[#4A4F5C] max-w-2xl mx-auto">
            Every profile is reviewed and verified. We maintain the highest standards for your peace of mind.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="p-6 rounded-2xl bg-[#F4F6F9] border border-[#E2E6F0] hover:border-[#1E4B8F]/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] flex items-center justify-center mb-4 group-hover:bg-[#1E4B8F] transition-colors">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1F3A] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#4A4F5C] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      title: "Search & Discover",
      description: "Browse verified therapists by location, specialty, and availability. Filter by your preferences.",
    },
    {
      number: "02", 
      title: "Compare Profiles",
      description: "Review detailed profiles, photos, certifications, and read authentic client reviews.",
    },
    {
      number: "03",
      title: "Contact Directly",
      description: "Reach out via phone, text, WhatsApp, or email. Arrange your session directly with the therapist.",
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #16386A 100%)" }}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
            <Globe className="w-3.5 h-3.5 text-[#FF8A1F]" />
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Direct Contact, No Booking Fees
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            MasseurMatch connects you directly with independent massage therapists. 
            No middleman, no extra fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="relative"
            >
              <div 
                className="p-8 rounded-2xl h-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <span className="font-stat text-5xl font-bold text-[#FF8A1F]/30 mb-4 block">
                  {step.number}
                </span>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-24 bg-[#FCFBF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1F3A] mb-6">
            Ready to Grow Your Practice?
          </h2>
          <p className="text-lg text-[#4A4F5C] max-w-2xl mx-auto mb-10">
            Join hundreds of independent massage therapists who are getting more clients through MasseurMatch. 
            List your profile today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#FF8A1F] to-[#FF9E45] text-white font-semibold hover:shadow-lg hover:shadow-[#FF8A1F]/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              List Your Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full bg-[#0B1F3A] text-white font-semibold hover:bg-[#16386A] transition-all duration-300 flex items-center justify-center gap-2"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Homepage Component
export function CinematicHomepage({ featuredTherapists, totalTherapists, cityCount }: CinematicHomepageProps) {
  return (
    <main className="overflow-x-hidden">
      <HeroSection totalTherapists={totalTherapists} cityCount={cityCount} />
      <FeaturedTherapists therapists={featuredTherapists} />
      <TrustSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
