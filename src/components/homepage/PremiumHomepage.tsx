"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Shield, Users, Zap, CheckCircle } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { Button } from "@/components/ui/button";
import { AuroraBackgroundLight } from "@/components/ui/aurora-background";

type Props = {
  featuredTherapists: PublicTherapist[];
  totalTherapists: number;
  cityCount: number;
};

export function PremiumHomepage({ featuredTherapists, totalTherapists, cityCount }: Props) {
  const [selectedCity, setSelectedCity] = useState("Dallas");

  const stats = [
    { label: "Verified Therapists", value: totalTherapists.toLocaleString() },
    { label: "LGBTQ+ Affirming", value: "100%" },
    { label: "Cities Covered", value: cityCount },
    { label: "Avg Rating", value: "4.8★" },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: "Identity Verified",
      description: "Every therapist goes through thorough background verification",
    },
    {
      icon: Star,
      title: "Rated & Reviewed",
      description: "Transparent ratings from real clients to guide your choice",
    },
    {
      icon: MapPin,
      title: "Real Locations",
      description: "Confirmed addresses and service areas for every profile",
    },
    {
      icon: Zap,
      title: "Available Now",
      description: "Real-time availability updates from verified therapists",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        <AuroraBackgroundLight className="absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Preheader Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">LGBTQ+ Affirming • 100% Verified • No Booking Fees</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Find Your Perfect
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Massage Therapist
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Discover verified, LGBTQ+-affirming massage therapists in your area. Real profiles, transparent pricing, direct contact.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/explore">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all">
                  Explore Therapists <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
                  I&apos;m a Therapist
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Therapists Choose MasseurMatch</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trusted by both clients and verified massage therapists across the US
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {trustFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer"
                >
                  <Icon className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Therapists Section */}
      {featuredTherapists.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Featured Verified Therapists</h2>
              <p className="text-lg text-slate-600">Top-rated LGBTQ+-affirming massage professionals</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredTherapists.slice(0, 6).map((therapist) => (
                <Link key={therapist.id} href={`/therapists/${therapist.slug || therapist.id}`}>
                  <div className="group cursor-pointer">
                    <div className="mb-4 rounded-lg overflow-hidden h-64 bg-gradient-to-br from-purple-400 to-pink-400 relative">
                      {therapist.avatar_url ? (
                        <img src={therapist.avatar_url ?? undefined} alt={therapist.display_name || "Therapist"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      {therapist.is_verified_identity && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">{therapist.display_name || "Therapist"}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {therapist.city || "Location available on profile"}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-slate-500">{therapist.review_count || 0} review{(therapist.review_count || 0) === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/explore">
                <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
                  View All Therapists <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-lg text-purple-100 mb-8">Join thousands of clients who have found verified, affirming massage therapists on MasseurMatch.</p>
          <Link href="/explore">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl hover:shadow-2xl transition-all">
              Start Exploring Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
