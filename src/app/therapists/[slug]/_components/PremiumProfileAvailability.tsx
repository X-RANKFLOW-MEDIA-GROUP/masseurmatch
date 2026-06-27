"use client";

import type { PublicTherapist } from "@/app/_lib/directory";

type HoursMap = Record<string, string>;

function normalizeHours(value: unknown): { incall: HoursMap; outcall: HoursMap } {
  if (!value || typeof value !== "object") return { incall: {}, outcall: {} };
  if ("incall" in value || "outcall" in value) {
    const s = value as { incall?: HoursMap; outcall?: HoursMap };
    return { incall: s.incall || {}, outcall: s.outcall || {} };
  }
  return { incall: value as HoursMap, outcall: {} };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileAvailability({ profile }: Props) {
  const hours = normalizeHours(profile.business_hours);
  const hasIncall = Object.keys(hours.incall).length > 0;
  const hasOutcall = Object.keys(hours.outcall).length > 0;
  
  // If no hours set, show a default availability table
  const defaultHours = !hasIncall && !hasOutcall;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] font-medium px-3 py-2">Day</th>
            <th className="text-center text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] font-medium px-3 py-2">Morning</th>
            <th className="text-center text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] font-medium px-3 py-2">Afternoon</th>
            <th className="text-center text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] font-medium px-3 py-2">Evening</th>
            <th className="text-center text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] font-medium px-3 py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, i) => {
            const incallTime = hours.incall[day] || hours.incall[day.toLowerCase()];
            const outcallTime = hours.outcall[day] || hours.outcall[day.toLowerCase()];
            const hasAny = incallTime || outcallTime;
            
            // Default mock data for visual demonstration
            const mockSlots = defaultHours ? getMockSlots(i) : null;
            
            return (
              <tr key={day} className="border-t border-[var(--glass-border)]">
                <td className="px-3 py-3 font-medium text-sm text-[var(--cream)]">{day}</td>
                <td className="px-3 py-3 text-center">
                  {mockSlots ? (
                    <SlotBadge type={mockSlots.morning.type}>{mockSlots.morning.text}</SlotBadge>
                  ) : hasAny ? (
                    <SlotBadge type="open">{incallTime || outcallTime}</SlotBadge>
                  ) : (
                    <SlotBadge type="off">—</SlotBadge>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {mockSlots ? (
                    <SlotBadge type={mockSlots.afternoon.type}>{mockSlots.afternoon.text}</SlotBadge>
                  ) : (
                    <SlotBadge type="off">—</SlotBadge>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {mockSlots ? (
                    <SlotBadge type={mockSlots.evening.type}>{mockSlots.evening.text}</SlotBadge>
                  ) : (
                    <SlotBadge type="off">—</SlotBadge>
                  )}
                </td>
                <td className="px-3 py-3 text-center text-[11px] text-[var(--text-muted)]">
                  {mockSlots?.sessionType || (incallTime && outcallTime ? "Both" : incallTime ? "Incall" : outcallTime ? "Outcall" : "—")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SlotBadge({ type, children }: { type: "open" | "limited" | "off"; children: React.ReactNode }) {
  const styles = {
    open: "bg-[var(--green-dim)] text-[var(--green)] border-[rgba(46,204,138,0.2)]",
    limited: "bg-[var(--orange-dim)] text-[var(--orange)] border-[rgba(139, 30, 45,0.2)]",
    off: "text-[var(--text-muted)]",
  };

  if (type === "off") {
    return <span className={`text-xs ${styles.off}`}>{children}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border ${styles[type]}`}>
      {children}
    </span>
  );
}

function getMockSlots(dayIndex: number) {
  const patterns = [
    { morning: { type: "open" as const, text: "10am–12pm" }, afternoon: { type: "open" as const, text: "2pm–6pm" }, evening: { type: "off" as const, text: "—" }, sessionType: "Incall" },
    { morning: { type: "off" as const, text: "—" }, afternoon: { type: "open" as const, text: "1pm–5pm" }, evening: { type: "open" as const, text: "7pm–9pm" }, sessionType: "Both" },
    { morning: { type: "open" as const, text: "9am–12pm" }, afternoon: { type: "limited" as const, text: "Limited" }, evening: { type: "off" as const, text: "—" }, sessionType: "Incall" },
    { morning: { type: "open" as const, text: "10am–1pm" }, afternoon: { type: "open" as const, text: "3pm–7pm" }, evening: { type: "open" as const, text: "7pm–9pm" }, sessionType: "Both" },
    { morning: { type: "limited" as const, text: "Limited" }, afternoon: { type: "open" as const, text: "2pm–6pm" }, evening: { type: "open" as const, text: "6pm–9pm" }, sessionType: "Outcall" },
    { morning: { type: "open" as const, text: "10am–2pm" }, afternoon: { type: "limited" as const, text: "1 slot" }, evening: { type: "off" as const, text: "—" }, sessionType: "Both" },
    { morning: { type: "off" as const, text: "—" }, afternoon: { type: "open" as const, text: "12pm–4pm" }, evening: { type: "off" as const, text: "—" }, sessionType: "Incall" },
  ];
  return patterns[dayIndex % patterns.length];
}
