'use client';

import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Heart, 
  Home, 
  Users, 
  ArrowRight, 
  Shield, 
  Star, 
  Clock, 
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Phone,
  Calendar,
  HandHeart,
  Dumbbell,
  Leaf,
  Waves,
  Building2,
  Car,
  BadgeCheck,
  TrendingUp,
  MessageCircle,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PremiumIcon } from '@/components/icons/PremiumIcon';

interface FeaturedTherapist {
  id: string;
  slug?: string;
  display_name?: string;
  full_name?: string;
  specialties?: string[];
  is_verified_identity?: boolean;
  is_verified_profile?: boolean;
  _tier?: string;
  outcall_price?: number;
  incall_price?: number;
  available_now?: boolean;
  city?: string;
}

interface PremiumSeoHomepageProps {
  featuredTherapists: FeaturedTherapist[];
  totalTherapists: number;
  cityCount: number;
  launchCities?: any[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export function PremiumSeoHomepage({
  featuredTherapists,
  totalTherapists,
  cityCount,
}: PremiumSeoHomepageProps) {
  const cities = [
    { name: 'Dallas', slug: 'dallas', therapists: 85 },
    { name: 'Houston', slug: 'houston', therapists: 120 },
    { name: 'Austin', slug: 'austin', therapists: 65 },
    { name: 'Miami', slug: 'miami', therapists: 95 },
    { name: 'Chicago', slug: 'chicago', therapists: 110 },
    { name: 'New York', slug: 'new-york', therapists: 180 },
    { name: 'Los Angeles', slug: 'los-angeles', therapists: 150 },
    { name: 'San Francisco', slug: 'san-francisco', therapists: 75 },
  ];

  const services = [
    { 
      title: 'Deep Tissue', 
      description: 'Intensive muscle release therapy targeting chronic tension and knots',
      icon: Dumbbell,
      href: '/explore?service=deep-tissue'
    },
    { 
      title: 'Swedish', 
      description: 'Classic relaxation massage promoting circulation and stress relief',
      icon: Waves,
      href: '/explore?service=swedish'
    },
    { 
      title: 'Sports Recovery', 
      description: 'Athletic performance and recovery-focused therapeutic massage',
      icon: TrendingUp,
      href: '/explore?service=sports'
    },
    { 
      title: 'Wellness', 
      description: 'Holistic bodywork integrating mind-body relaxation techniques',
      icon: Leaf,
      href: '/explore?service=wellness'
    },
  ];

  const locationTypes = [
    {
      title: 'Hotel Massage',
      description: 'In-room service at your hotel or resort',
      icon: Building2,
      href: '/explore?location=hotel'
    },
    {
      title: 'Outcall / Mobile',
      description: 'Therapist travels to your location',
      icon: Car,
      href: '/explore?location=outcall'
    },
    {
      title: 'Incall / Studio',
      description: 'Visit the therapist\'s professional space',
      icon: Home,
      href: '/explore?location=incall'
    },
  ];

  const howItWorks = [
    { 
      step: 1, 
      title: 'Search or Browse', 
      description: 'Find therapists by city, service type, or real-time availability',
      icon: Search
    },
    { 
      step: 2, 
      title: 'Review Profiles', 
      description: 'Compare credentials, rates, specialties, photos, and reviews',
      icon: Star
    },
    { 
      step: 3, 
      title: 'Connect Directly', 
      description: 'Message or call the therapist to confirm details',
      icon: MessageCircle
    },
    { 
      step: 4, 
      title: 'Book Your Session', 
      description: 'Schedule your appointment on your terms',
      icon: Calendar
    },
  ];

  const faqs = [
    {
      q: 'How do I find verified male massage therapists near me?',
      a: 'Start with a city page, then compare specialties, incall or outcall options, visible pricing, reviews, and profile quality before contacting a therapist directly.',
    },
    {
      q: 'Which cities have live MasseurMatch landing pages?',
      a: 'Current launch pages include Dallas, Plano, Irving, Highland Park, Houston, Austin, Miami, and Chicago, with local service and neighborhood clusters expanding alongside therapist coverage.',
    },
    {
      q: 'Can I compare deep tissue, Swedish, hotel, and outcall options?',
      a: 'Yes. The directory includes city-plus-service routes for deep tissue, Swedish, sports recovery, hotel massage, mobile massage, incall, and outcall discovery.',
    },
    {
      q: 'Does MasseurMatch handle booking or payments?',
      a: 'No. MasseurMatch is a discovery directory. Users review profiles and contact therapists directly to confirm rates, boundaries, timing, location, and availability.',
    },
  ];

  return (
    <div className="w-full bg-[var(--cream)] text-[var(--navy)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--navy)]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy)] via-[var(--navy2)] to-[var(--navy3)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,138,31,0.08),_transparent_50%)]" />
        
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--orange)]/30 bg-[var(--orange)]/10 px-4 py-2 text-sm font-medium text-[var(--orange)]">
              <Sparkles className="h-4 w-4" />
              <span>LGBTQ+-Affirming Directory</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--cream)] sm:text-5xl lg:text-6xl xl:text-7xl text-balance">
              Find Verified Male Massage Therapists Near You
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--cream)]/80 sm:text-xl">
              Discover professional therapists with real availability, transparent pricing, and direct contact — no middleman, no hidden fees.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:border sm:border-white/10 sm:bg-white/5 sm:p-2 sm:backdrop-blur-sm">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--cream)]/50 sm:text-[var(--navy)]/40" />
                <input
                  type="text"
                  placeholder="Enter city or ZIP code..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[var(--cream)] placeholder-[var(--cream)]/50 backdrop-blur-sm transition focus:border-[var(--orange)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/20 sm:border-0 sm:bg-white sm:text-[var(--navy)] sm:placeholder-[var(--navy)]/40"
                />
              </div>
              <button className="flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] px-8 py-4 font-semibold text-white shadow-lg shadow-[var(--orange)]/25 transition hover:bg-[var(--orange2)] hover:shadow-xl hover:shadow-[var(--orange)]/30">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--cream)]/60">
              <span>Popular:</span>
              {['Dallas', 'Houston', 'Miami'].map((city) => (
                <Link 
                  key={city} 
                  href={`/${city.toLowerCase()}`}
                  className="underline underline-offset-2 transition hover:text-[var(--orange)]"
                >
                  {city}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-12 sm:gap-12"
          >
            {[
              { value: `${totalTherapists}+`, label: 'Verified Therapists', icon: BadgeCheck },
              { value: `${cityCount}`, label: 'US Cities', icon: MapPin },
              { value: '100%', label: 'Direct Contact', icon: Phone },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="text-center"
              >
                <stat.icon className="mx-auto mb-3 h-6 w-6 text-[var(--orange)]" />
                <div className="text-2xl font-bold text-[var(--cream)] sm:text-3xl lg:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-[var(--cream)]/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Browse by City Section */}
      <section className="bg-[var(--cream)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl lg:text-5xl text-balance">
              Browse by City
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--navy)]/70">
              Explore verified therapists in major US metropolitan areas
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {cities.map((city, idx) => (
              <motion.div
                key={city.slug}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/${city.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--navy)]/8 bg-white p-6 shadow-sm transition-all hover:border-[var(--orange)]/30 hover:shadow-lg hover:shadow-[var(--orange)]/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--navy)] transition group-hover:text-[var(--orange)]">
                        {city.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--navy)]/60">
                        {city.therapists}+ therapists
                      </p>
                    </div>
                    <div className="rounded-full bg-[var(--orange)]/10 p-2 transition group-hover:bg-[var(--orange)] group-hover:text-white">
                      <MapPin className="h-4 w-4 text-[var(--orange)] transition group-hover:text-white" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  
                  <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-[var(--navy)]/20 transition group-hover:text-[var(--orange)] group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--navy)] px-8 py-3.5 font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)] hover:text-white"
            >
              Explore All Cities
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Browse by Service Section */}
      <section className="bg-[var(--navy)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl lg:text-5xl text-balance">
              Browse by Service Type
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--cream)]/70">
              Find the perfect massage therapy tailored to your needs
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((service, idx) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition hover:border-[var(--orange)]/30 hover:bg-white/10"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--orange)]/15">
                    <service.icon className="h-7 w-7 text-[var(--orange)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--cream)] transition group-hover:text-[var(--orange)]">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--cream)]/60">
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[var(--orange)]">
                    Explore
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Location Types Section */}
      <section className="bg-[var(--cream2)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl lg:text-5xl text-balance">
              Your Choice of Location
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--navy)]/70">
              Book sessions at your preferred location — hotel, home, or studio
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {locationTypes.map((type, idx) => (
              <motion.div
                key={type.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={type.href}
                  className="group flex flex-col items-center rounded-3xl border border-[var(--navy)]/8 bg-white p-8 text-center shadow-sm transition hover:border-[var(--orange)]/30 hover:shadow-xl"
                >
                  <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--orange)]/20 to-[var(--orange)]/5">
                    <type.icon className="h-8 w-8 text-[var(--orange)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--navy)] transition group-hover:text-[var(--orange)]">
                    {type.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--navy)]/60">
                    {type.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Therapists Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 flex flex-col items-center justify-between gap-6 sm:flex-row"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl text-balance">
                Featured Therapists
              </h2>
              <p className="mt-3 text-lg text-[var(--navy)]/70">
                Verified professionals ready to provide expert care
              </p>
            </div>
            <Link
              href="/therapists"
              className="inline-flex items-center gap-2 text-[var(--orange)] font-semibold hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredTherapists.slice(0, 6).map((therapist, idx) => (
              <motion.div
                key={therapist.id}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/therapists/${therapist.slug || therapist.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--navy)]/8 bg-gradient-to-b from-[var(--cream)]/50 to-white transition hover:border-[var(--orange)]/30 hover:shadow-lg"
                >
                  {/* Premium badge */}
                  {therapist._tier === 'premium' && (
                    <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      <Star className="h-3 w-3" />
                      Premium
                    </div>
                  )}
                  
                  {/* Therapist avatar placeholder */}
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[var(--navy)]/5 to-[var(--navy)]/10">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                      <HandHeart className="h-10 w-10 text-[var(--orange)]" />
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--navy)] transition group-hover:text-[var(--orange)]">
                          {therapist.display_name || therapist.full_name || 'Therapist'}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--navy)]/60">
                          <MapPin className="h-3.5 w-3.5" />
                          {therapist.city || 'Location'}
                        </p>
                      </div>
                      {therapist.is_verified_identity && (
                        <div className="rounded-full bg-emerald-50 p-1.5">
                          <BadgeCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      {therapist.specialties?.slice(0, 2).map((spec) => (
                        <div key={spec} className="flex items-center gap-2 text-sm text-[var(--navy)]/70">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          {spec}
                        </div>
                      ))}
                      {therapist.available_now && (
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--orange)]">
                          <Clock className="h-4 w-4" />
                          Available now
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2 pt-5 border-t border-[var(--navy)]/8">
                      {therapist.incall_price && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--navy)]/5 px-3 py-1.5 text-xs font-medium text-[var(--navy)]">
                          <Home className="h-3 w-3" />
                          Incall
                        </span>
                      )}
                      {therapist.outcall_price && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--navy)]/5 px-3 py-1.5 text-xs font-medium text-[var(--navy)]">
                          <Car className="h-3 w-3" />
                          Outcall
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              href="/therapists"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-8 py-4 font-semibold text-white shadow-lg shadow-[var(--orange)]/25 transition hover:bg-[var(--orange2)] hover:shadow-xl"
            >
              View All Therapists
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-[var(--navy)] via-[var(--navy2)] to-[var(--navy3)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl lg:text-5xl text-balance">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--cream)]/70">
              A simple process to find and book your perfect massage therapy
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {howItWorks.map((item, idx) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--orange)] to-[var(--orange2)] shadow-xl shadow-[var(--orange)]/30">
                      <item.icon className="h-9 w-9 text-white" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--cream)] text-sm font-bold text-[var(--navy)] shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--cream)]">{item.title}</h3>
                  <p className="mt-3 text-[var(--cream)]/60 leading-relaxed">{item.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="absolute -right-4 top-10 hidden lg:block">
                    <ArrowRight className="h-6 w-6 text-[var(--orange)]/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Therapist Signup CTA Section */}
      <section className="relative overflow-hidden bg-[var(--orange)] py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--orange)] via-[var(--orange2)] to-amber-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.15),_transparent_50%)]" />
        
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Award className="h-4 w-4" />
              <span>Join Our Network</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
              Are You a Massage Therapist?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 leading-relaxed">
              Join our LGBTQ+-affirming directory and connect with clients who value verified, professional service. Set your own rates, schedule, and boundaries.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/for-therapists"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-[var(--orange)] shadow-xl transition hover:bg-[var(--cream)] hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Learn More
              </Link>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                { icon: Users, title: 'Reach More Clients', desc: 'Connect with serious clients actively searching' },
                { icon: Heart, title: 'Community-Focused', desc: 'LGBTQ+-affirming professional platform' },
                { icon: Shield, title: 'Set Your Terms', desc: 'Control pricing, availability, and services' },
              ].map((item, idx) => (
                <motion.div 
                  key={item.title}
                  variants={fadeInUp}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                >
                  <item.icon className="mx-auto mb-3 h-8 w-8 text-white" />
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[var(--cream)] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl lg:text-5xl text-balance">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--navy)]/70">
              Everything you need to know about MasseurMatch
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
              >
                <details className="group rounded-2xl border border-[var(--navy)]/8 bg-white transition hover:shadow-lg [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-6">
                    <h3 className="pr-4 font-semibold text-[var(--navy)] text-left">{faq.q}</h3>
                    <ChevronDown className="h-5 w-5 shrink-0 text-[var(--navy)]/40 transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[var(--navy)]/8 px-6 pb-6 pt-4">
                    <p className="text-[var(--navy)]/70 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[var(--navy)] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8 lg:px-12">
          <motion.div
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl lg:text-5xl text-balance">
              Ready to Find Your Perfect Massage Therapist?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--cream)]/70">
              Start your search today and connect with verified, professional therapists in your area.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] px-8 py-4 font-bold text-white shadow-xl shadow-[var(--orange)]/25 transition hover:bg-[var(--orange2)] hover:scale-105"
              >
                Explore Therapists
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/near-me"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--cream)]/30 px-8 py-4 font-semibold text-[var(--cream)] transition hover:bg-[var(--cream)]/10"
              >
                <MapPin className="h-5 w-5" />
                Find Near Me
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
