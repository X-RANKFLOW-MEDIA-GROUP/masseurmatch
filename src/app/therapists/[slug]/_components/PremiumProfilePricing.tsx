"use client";

import { useState } from "react";
import { Clock, Tag } from "lucide-react";
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

  // If the profile has explicit pricing_sessions, build rows from those
  const sessions = profile.pricing_sessions;
  const hasExplicitSessions = Array.isArray(sessions) && sessions.length > 0;

  const explicitIncall = hasExplicitSessions
    ? sessions!
        .filter((s) => s.incall != null)
        .map((s, i) => ({
          type: s.name || "Session",
          duration: s.duration ? `${s.duration} min` : "—",
          price: s.incall as number,
          best: i === 1,
        }))
    : null;

  const explicitOutcall = hasExplicitSessions
    ? sessions!
        .filter((s) => s.outcall != null)
        .map((s, i) => ({
          type: s.name || "Session",
          duration: s.duration ? `${s.duration} min` : "—",
          price: s.outcall as number,
          best: i === 1,
        }))
    : null;

  // Fall back to auto-generated tiers when no explicit sessions
  const generatedIncall = [
    { type: "Swedish / Relaxing", duration: "60 min", price: incallBase, best: false },
    { type: "Swedish / Relaxing", duration: "90 min", price: Math.round(incallBase * 1.4), best: true },
    { type: "Deep Tissue", duration: "60 min", price: Math.round(incallBase * 1.15), best: false },
    { type: "Deep Tissue", duration: "90 min", price: Math.round(incallBase * 1.6), best: false },
    { type: "Therapeutic / Custom", duration: "120 min", price: Math.round(incallBase * 2.1), best: false },
    { type: "Couples Session", duration: "90 min", price: Math.round(incallBase * 2.6), best: false },
  ];

  const generatedOutcall = [
    { type: "Swedish / Relaxing", duration: "60 min", price: outcallBase, best: false },
    { type: "Swedish / Relaxing", duration: "90 min", price: Math.round(outcallBase * 1.3), best: true },
    { type: "Deep Tissue", duration: "60 min", price: Math.round(outcallBase * 1.12), best: false },
    { type: "Deep Tissue", duration: "90 min", price: Math.round(outcallBase * 1.5), best: false },
    { type: "Therapeutic / Custom", duration: "120 min", price: Math.round(outcallBase * 1.9), best: false },
  ];

  const hasIncall = !!profile.incall_price;
  const hasOutcall = !!profile.outcall_price;

  const incallPrices = explicitIncall && explicitIncall.length > 0 ? explicitIncall : generatedIncall;
  const outcallPrices = explicitOutcall && explicitOutcall.length > 0 ? explicitOutcall : generatedOutcall;
  const currentPrices = activeTab === "incall" ? incallPrices : outcallPrices;

  const promotions = profile.promotions;

  return (
    <section className="pp-section pp-fade-in" id="pricing">
      <div className="pp-section-header">
        <h2 className="pp-section-title">Pricing</h2>
      </div>

      {/* Promotions */}
      {promotions && promotions.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {promotions.map((promo, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-[rgba(255,138,31,0.25)] bg-[rgba(255,138,31,0.07)] px-4 py-3"
            >
              <Tag className="w-4 h-4 text-[var(--orange)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[var(--orange)]">{promo.title}</span>
                <span className="text-xs text-[var(--text-dim)] ml-2">{promo.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

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
