"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfilePricing({ profile }: Props) {
  const [activeTab, setActiveTab] = useState<"incall" | "outcall">(
    profile.incall_price ? "incall" : "outcall"
  );
  
  const incallBase = profile.incall_price || 120;
  const outcallBase = profile.outcall_price || 160;
  
  // Generate pricing tiers
  const incallPrices = [
    { type: "Swedish / Relaxing", duration: "60 min", price: incallBase, best: false },
    { type: "Swedish / Relaxing", duration: "90 min", price: Math.round(incallBase * 1.4), best: true },
    { type: "Deep Tissue", duration: "60 min", price: Math.round(incallBase * 1.15), best: false },
    { type: "Deep Tissue", duration: "90 min", price: Math.round(incallBase * 1.6), best: false },
    { type: "Therapeutic / Custom", duration: "120 min", price: Math.round(incallBase * 2.1), best: false },
    { type: "Couples Session", duration: "90 min", price: Math.round(incallBase * 2.6), best: false },
  ];
  
  const outcallPrices = [
    { type: "Swedish / Relaxing", duration: "60 min", price: outcallBase, best: false },
    { type: "Swedish / Relaxing", duration: "90 min", price: Math.round(outcallBase * 1.3), best: true },
    { type: "Deep Tissue", duration: "60 min", price: Math.round(outcallBase * 1.12), best: false },
    { type: "Deep Tissue", duration: "90 min", price: Math.round(outcallBase * 1.5), best: false },
    { type: "Therapeutic / Custom", duration: "120 min", price: Math.round(outcallBase * 1.9), best: false },
  ];
  
  const hasIncall = !!profile.incall_price;
  const hasOutcall = !!profile.outcall_price;
  const currentPrices = activeTab === "incall" ? incallPrices : outcallPrices;

  return (
    <section className="pp-section pp-fade-in" id="pricing">
      <div className="pp-section-header">
        <h2 className="pp-section-title">Pricing</h2>
      </div>

      {/* Tabs */}
      {hasIncall && hasOutcall && (
        <div className="pp-pricing-tabs">
          <button
            className={`pp-ptab ${activeTab === "incall" ? "active" : ""}`}
            onClick={() => setActiveTab("incall")}
          >
            Incall
          </button>
          <button
            className={`pp-ptab ${activeTab === "outcall" ? "active" : ""}`}
            onClick={() => setActiveTab("outcall")}
          >
            Outcall
          </button>
        </div>
      )}

      {/* Pricing Table */}
      <table className="pp-pricing-table">
        <thead>
          <tr>
            <th>Session Type</th>
            <th>Duration</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentPrices.map((row, i) => (
            <tr key={i}>
              <td>{row.type}</td>
              <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                {row.duration}
              </td>
              <td>
                <span className="pp-price-val">${row.price}</span>
                {row.best && <span className="pp-price-best">Best Value</span>}
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Travel note for outcall */}
      {activeTab === "outcall" && (
        <div className="mt-4 rounded-lg border border-[var(--glass-border)] bg-[var(--cream-dim)] px-5 py-4 flex items-center gap-3 text-xs text-[var(--text-dim)]">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            Travel fee automatically calculated based on your location · Central areas included · {">"}10mi: +$20
          </span>
        </div>
      )}
    </section>
  );
}
