'use client';

import Link from 'next/link';
import { Search, MapPin, Heart, Home, Users, HelpCircle, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface City {
  name: string;
  slug: string;
}

interface PremiumSeoHomepageProps {
  featuredTherapists: FeaturedTherapist[];
  totalTherapists: number;
  cityCount: number;
  launchCities?: any[];
}

export function PremiumSeoHomepage({
  featuredTherapists,
  totalTherapists,
  cityCount,
  launchCities = [],
}: PremiumSeoHomepageProps) {
  const cities = [
    { name: 'Dallas', slug: 'dallas' },
    { name: 'Houston', slug: 'houston' },
    { name: 'Austin', slug: 'austin' },
    { name: 'Miami', slug: 'miami' },
    { name: 'Chicago', slug: 'chicago' },
    { name: 'New York', slug: 'new-york' },
    { name: 'Los Angeles', slug: 'los-angeles' },
    { name: 'San Francisco', slug: 'san-francisco' },
  ];

  const services = [
    { title: 'Deep Tissue', description: 'Intensive muscle release and tension relief', icon: '💪' },
    { title: 'Swedish', description: 'Relaxation and circulation improvement', icon: '✨' },
    { title: 'Sports', description: 'Recovery and athletic performance massage', icon: '🏃' },
    { title: 'Wellness', description: 'Holistic health and wellbeing services', icon: '🧘' },
  ];

  const howitWorks = [
    { step: 1, title: 'Search or Browse', description: 'Find therapists by city, service, or availability' },
    { step: 2, title: 'Review Profiles', description: 'Check credentials, rates, specialties, and availability' },
    { step: 3, title: 'Connect Directly', description: 'Message the therapist to confirm details and book' },
    { step: 4, title: 'Enjoy Your Massage', description: 'Receive expert therapeutic care on your schedule' },
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
    <div className="w-full bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-balance">
              Find Verified Male Massage Therapists Near You
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-100">
              Discover LGBTQ+-affirming therapists with real availability, transparent pricing, and direct contact
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:rounded-full sm:bg-white sm:p-1">
              <input
                type="text"
                placeholder="Enter city or ZIP code..."
                className="flex-1 rounded-full bg-white px-6 py-3 text-gray-900 placeholder-gray-500 focus:outline-none sm:rounded-full"
              />
              <button className="rounded-full bg-accent px-8 py-3 font-semibold text-white transition hover:bg-accent/90 sm:rounded-full">
                <Search className="inline mr-2 h-5 w-5" />
                Search
              </button>
            </div>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-3 gap-4 text-center sm:gap-8"
          >
            <div>
              <div className="text-3xl font-bold sm:text-4xl">{totalTherapists}+</div>
              <div className="text-sm text-gray-100">Verified Therapists</div>
            </div>
            <div>
              <div className="text-3xl font-bold sm:text-4xl">{cityCount}</div>
              <div className="text-sm text-gray-100">US Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold sm:text-4xl">100%</div>
              <div className="text-sm text-gray-100">Direct Contact</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Browse by City Section */}
      <section className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground text-balance">Browse by City</h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore verified therapists in major US cities
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cities.map((city, idx) => (
              <motion.div
                key={city.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/${city.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition hover:border-accent hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition">
                      {city.name}
                    </h3>
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {Math.floor(Math.random() * 200) + 20}+ therapists
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      Verified
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-semibold text-white transition hover:bg-accent/90"
            >
              Explore All Cities
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Service Section */}
      <section className="bg-gray-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground text-balance">Browse by Service Type</h2>
            <p className="mt-4 text-lg text-gray-600">
              Find the perfect massage therapy for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/explore?service=${service.title.toLowerCase()}`}
                  className="group flex flex-col rounded-2xl bg-white p-8 transition hover:shadow-lg hover:border-accent border border-gray-200"
                >
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-accent font-semibold">
                    Explore <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists Section */}
      <section className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground text-balance">Featured Therapists</h2>
            <p className="mt-4 text-lg text-gray-600">
              Verified professionals ready to provide expert massage therapy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTherapists.slice(0, 6).map((therapist, idx) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/therapists/${therapist.slug || therapist.id}`}
                  className="group block rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition hover:shadow-lg hover:border-accent overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition">
                        {therapist.display_name || therapist.full_name || 'Therapist'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{therapist.city}</p>
                    </div>
                    {therapist.is_verified_identity && (
                      <div className="bg-accent/10 rounded-full p-2">
                        <Check className="h-5 w-5 text-accent" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {therapist.specialties && therapist.specialties.slice(0, 2).map((spec) => (
                      <div key={spec} className="text-sm text-gray-600">
                        ✓ {spec}
                      </div>
                    ))}
                    {therapist.available_now && (
                      <div className="text-sm font-semibold text-accent">
                        ✓ Available now
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    {therapist.incall_price && (
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        Incall
                      </span>
                    )}
                    {therapist.outcall_price && (
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        Outcall
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/therapists"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-semibold text-white transition hover:bg-accent/90"
            >
              View All Therapists
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-primary to-blue-900 py-20 sm:py-32 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-balance">How It Works</h2>
            <p className="mt-4 text-lg text-gray-100">
              Simple process to find and book your perfect massage therapy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howitWorks.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent font-bold text-primary text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-gray-100">{item.description}</p>
                </div>
                {idx < howitWorks.length - 1 && (
                  <div className="absolute -right-4 top-8 hidden lg:block">
                    <ArrowRight className="h-6 w-6 text-accent/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapist Signup CTA Section */}
      <section className="bg-accent text-white py-20 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-balance">
              Are You a Massage Therapist?
            </h2>
            <p className="mt-6 text-lg text-white/90">
              Join our LGBTQ+-affirming directory and reach clients who value verified, professional service.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/for-therapists"
                className="rounded-full bg-white px-8 py-4 font-bold text-accent transition hover:bg-gray-100"
              >
                Get Started as a Therapist
              </Link>
              <Link
                href="/for-therapists"
                className="rounded-full border-2 border-white px-8 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-6">
                <Users className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold">Reach More Clients</h3>
                <p className="mt-2 text-sm text-white/80">Connect with serious clients actively searching for services</p>
              </div>
              <div className="rounded-xl bg-white/10 p-6">
                <Heart className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold">Community-Focused</h3>
                <p className="mt-2 text-sm text-white/80">LGBTQ+-affirming platform designed for professional massage therapy</p>
              </div>
              <div className="rounded-xl bg-white/10 p-6">
                <Home className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold">Set Your Terms</h3>
                <p className="mt-2 text-sm text-white/80">Control your pricing, availability, services, and contact method</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground text-balance">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about MasseurMatch
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <details className="group rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-lg">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground">
                    <h3>{faq.q}</h3>
                    <HelpCircle className="h-5 w-5 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition"
            >
              View All FAQs
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-900 to-accent py-20 sm:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-96 w-96 rounded-full bg-white blur-3xl -top-32 -left-32"></div>
          <div className="absolute h-96 w-96 rounded-full bg-accent blur-3xl -bottom-32 -right-32"></div>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold sm:text-5xl text-white text-balance">
              Start Your Massage Journey Today
            </h2>
            <p className="mt-6 text-lg text-white/90">
              Discover verified, professional male massage therapists in your area with direct contact and transparent pricing.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/explore"
                className="rounded-full bg-white px-8 py-4 font-bold text-accent transition hover:bg-gray-100"
              >
                Browse Therapists
              </Link>
              <Link
                href="/near-me"
                className="rounded-full border-2 border-white px-8 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Find Near Me
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
