import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SUBSCRIPTION_TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Get started with basic visibility",
    features: [
      "1 photo",
      "Bottom search placement",
      "No 'Available Now' status",
      "1 travel schedule per month",
      "No analytics",
      "Basic listing watermark"
    ],
    cta: "Current Plan",
    highlighted: false
  },
  {
    id: "standard",
    name: "Standard",
    price: "$39",
    period: "per month",
    description: "Popular for growing therapists",
    features: [
      "6 photos",
      "Middle search placement",
      "'Available Now' for 2 hours",
      "3 travel schedules per month",
      "Views analytics",
      "Newsletter promotion chance"
    ],
    cta: "Upgrade Now",
    highlighted: false
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    period: "per month",
    description: "Maximum visibility and features",
    features: [
      "12 photos + video",
      "Top search placement",
      "'Available Now' for 3 hours",
      "Unlimited travel schedules",
      "Views & clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge"
    ],
    cta: "Upgrade Now",
    highlighted: true
  },
  {
    id: "elite",
    name: "Elite",
    price: "$99",
    period: "per month",
    description: "Premium placement across cities",
    features: [
      "12 photos + video",
      "Top search placement",
      "'Available Now' for 4 hours",
      "Unlimited travel schedules",
      "Full analytics suite",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
      "2 active ads across 2 cities"
    ],
    cta: "Upgrade Now",
    highlighted: false
  }
];

export default async function SubscriptionPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600">
            Scale your visibility with MasseurMatch premium subscriptions
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SUBSCRIPTION_TIERS.map((tier) => (
            <Card 
              key={tier.id}
              className={`flex flex-col ${
                tier.highlighted 
                  ? "ring-2 ring-orange-500 shadow-lg lg:scale-105" 
                  : "border-slate-200"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-600">{tier.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full ${
                    tier.id === "free"
                      ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
                      : tier.highlighted
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <Link href={`/api/stripe/checkout?plan=${tier.id}`}>
                    {tier.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Questions?</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-slate-600">Yes! Changes take effect at the start of your next billing cycle. We'll prorate any charges.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600">We accept all major credit cards through Stripe. Your payment information is secure and encrypted.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600">Absolutely! Cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
