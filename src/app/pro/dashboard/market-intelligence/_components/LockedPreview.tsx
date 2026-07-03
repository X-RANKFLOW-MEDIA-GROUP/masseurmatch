"use client";

import { Lock, TrendingUp, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: TrendingUp,
    title: "Demand Spikes",
    description: "See when and where search volume peaks for your specialties.",
  },
  {
    icon: TrendingUp,
    title: "Search Trends",
    description: "Track the most popular techniques and services in your area.",
  },
  {
    icon: TrendingUp,
    title: "Peak Hours & Days",
    description: "Optimize your availability for when demand is highest.",
  },
  {
    icon: TrendingUp,
    title: "City Demand Score",
    description: "Understand competition and opportunity in every market.",
  },
  {
    icon: TrendingUp,
    title: "Boost Recommendations",
    description: "Data-driven suggestions on when to promote your profile.",
  },
  {
    icon: TrendingUp,
    title: "Hotel Opportunities",
    description: "Identify high-opportunity areas for travel & hotel sessions.",
  },
];

export function LockedPreview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Lock className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold">Market Intelligence</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Unlock premium insights to grow your practice. Available with paid plans.
        </p>
      </div>

      {/* Feature Grid with Blur Overlay */}
      <div className="relative">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 backdrop-blur-sm"
              >
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white/40 backdrop-blur-[3px]" />

                {/* Content */}
                <div className="relative space-y-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Lock Icon */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-background/80 backdrop-blur-md p-4">
            <Lock className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mx-auto mb-4">
          <Zap className="h-6 w-6 text-accent" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-semibold">Unlock Market Intelligence</h2>
        <p className="mt-2 max-w-md mx-auto text-muted-foreground">
          Get data-driven insights to optimize your availability, boost your visibility, and grow your practice faster.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent/90"
          >
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pro/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold transition hover:bg-card/80"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
