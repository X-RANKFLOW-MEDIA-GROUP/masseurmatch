import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      description: "Get started with basic features",
      features: [
        "Basic profile listing",
        "3 photos maximum",
        "City-level visibility",
        "Standard search results",
        "Basic contact info display"
      ],
      cta: "Get Started",
      popular: false,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      name: "Standard",
      price: "$29",
      period: "month",
      description: "Enhanced visibility for growing practices",
      features: [
        "Enhanced profile listing",
        "10 photos maximum",
        "Featured in search results",
        "Service menu display",
        "Basic analytics dashboard",
        "Priority email support"
      ],
      cta: "Start Standard",
      popular: false,
      gradient: "from-blue-600 to-blue-700"
    },
    {
      name: "Premium",
      price: "$59",
      period: "month",
      description: "Most popular choice for professionals",
      features: [
        "Verified badge",
        "Unlimited photos",
        "Homepage rotation (3x/week)",
        "Advanced analytics",
        "Gallery & hours management",
        "Premium placement",
        "24/7 priority support"
      ],
      cta: "Go Premium",
      popular: true,
      gradient: "from-primary to-accent"
    },
    {
      name: "Gold",
      price: "$99",
      period: "month",
      description: "Maximum exposure for your practice",
      features: [
        "All Premium features",
        "Top search placement",
        "Daily homepage feature",
        "Extended profile content",
        "Booking integration ready",
        "Dedicated account manager",
        "Custom branding options"
      ],
      cta: "Choose Gold",
      popular: false,
      gradient: "from-yellow-600 to-yellow-700"
    },
    {
      name: "Platinum",
      price: "$149",
      period: "month",
      description: "Elite tier for established professionals",
      features: [
        "All Gold features",
        "Permanent homepage presence",
        "Exclusive 'Elite' badge",
        "API access",
        "White-label options",
        "Custom domain support",
        "Marketing consultation",
        "Priority feature requests"
      ],
      cta: "Go Elite",
      popular: false,
      gradient: "from-purple-600 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Flexible Plans</Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Choose Your <span className="gradient-text">Growth Plan</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your practice grows. All plans include our core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card p-8 card-hover relative ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-accent border-0 text-white">
                  ⭐ MOST POPULAR
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black gradient-text">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-black mb-8 text-center">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal through our secure payment processor Stripe."
              },
              {
                q: "Is there a contract or commitment?",
                a: "No long-term contracts! All plans are month-to-month and you can cancel anytime."
              },
              {
                q: "How does the verification process work?",
                a: "Premium plans and above include professional verification. We verify your license, certifications, and identity within 24-48 hours."
              }
            ].map((faq, index) => (
              <div key={index} className="glass-card p-6">
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
