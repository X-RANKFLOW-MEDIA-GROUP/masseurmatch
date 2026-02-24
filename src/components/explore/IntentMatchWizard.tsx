import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X, ArrowRight, ArrowLeft, Sparkles, MapPin, CheckCircle2,
  MessageSquare, Home, Car, DollarSign, Clock, Zap
} from "lucide-react";

interface TherapistItem {
  id: string;
  name: string;
  city: string;
  specialty: string;
  image: string;
  verified: boolean;
  price: string;
  priceNum: number;
  available: boolean;
  bio: string;
  specialties?: string[];
  incallPrice?: number;
  outcallPrice?: number;
}

interface IntentMatchWizardProps {
  therapists: TherapistItem[];
  onClose: () => void;
  isOpen: boolean;
}

type Step = "location" | "budget" | "timeframe" | "type" | "results";

const MASSAGE_TYPES = [
  "Deep Tissue", "Swedish", "Sports Recovery", "Hot Stone",
  "Thai", "Shiatsu", "Therapeutic", "Relaxation",
];

export const IntentMatchWizard = ({ therapists, onClose, isOpen }: IntentMatchWizardProps) => {
  const [step, setStep] = useState<Step>("location");
  const [locationPref, setLocationPref] = useState<"incall" | "outcall" | "either" | null>(null);
  const [budgetPref, setBudgetPref] = useState<"$" | "$$" | "$$$" | "any" | null>(null);
  const [timeframePref, setTimeframePref] = useState<"today" | "this-week" | "flexible" | null>(null);
  const [typePref, setTypePref] = useState<string[]>([]);

  const steps: Step[] = ["location", "budget", "timeframe", "type", "results"];
  const stepIdx = steps.indexOf(step);

  const goNext = () => {
    if (stepIdx < steps.length - 1) setStep(steps[stepIdx + 1]);
  };
  const goBack = () => {
    if (stepIdx > 0) setStep(steps[stepIdx - 1]);
  };

  const resetAndClose = () => {
    setStep("location");
    setLocationPref(null);
    setBudgetPref(null);
    setTimeframePref(null);
    setTypePref([]);
    onClose();
  };

  // Scoring logic
  const scoreTherapist = (t: TherapistItem): number => {
    let score = 0;

    // Location preference
    if (locationPref === "incall" && (t.incallPrice || t.priceNum > 0)) score += 30;
    else if (locationPref === "outcall" && (t.outcallPrice || t.priceNum > 0)) score += 30;
    else if (locationPref === "either") score += 20;

    // Budget
    const price = t.priceNum || 0;
    if (budgetPref === "$" && price > 0 && price <= 80) score += 30;
    else if (budgetPref === "$$" && price > 80 && price <= 150) score += 30;
    else if (budgetPref === "$$$" && price > 150) score += 30;
    else if (budgetPref === "any") score += 15;
    else if (price > 0) score += 5; // partial match

    // Massage type match
    if (typePref.length > 0) {
      const specLower = t.specialty.toLowerCase();
      const matched = typePref.filter((tp) => specLower.includes(tp.toLowerCase()));
      score += matched.length * 15;
    } else {
      score += 10;
    }

    // Availability bonus
    if (t.available) score += 10;
    if (t.verified) score += 5;

    return score;
  };

  const rankedResults = [...therapists]
    .map((t) => ({ ...t, score: scoreTherapist(t) }))
    .sort((a, b) => b.score - a.score);

  const top3 = rankedResults.slice(0, 3);

  const canProceed = () => {
    if (step === "location") return locationPref !== null;
    if (step === "budget") return budgetPref !== null;
    if (step === "timeframe") return timeframePref !== null;
    if (step === "type") return true; // optional
    return true;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-lg border border-border bg-card rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Smart Match</h2>
            </div>
            <button onClick={resetAndClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          {step !== "results" && (
            <div className="px-5 pt-4">
              <div className="flex gap-1">
                {steps.slice(0, 4).map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= stepIdx ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Step {stepIdx + 1} of 4
              </p>
            </div>
          )}

          {/* Content */}
          <div className="p-5 min-h-[280px]">
            <AnimatePresence mode="wait">
              {/* STEP 1: Location */}
              {step === "location" && (
                <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold mb-2">Where do you want your session?</h3>
                  <p className="text-sm text-muted-foreground mb-6">Tap one option</p>
                  <div className="space-y-3">
                    {[
                      { value: "incall" as const, icon: Home, label: "Incall", desc: "Visit the therapist's location" },
                      { value: "outcall" as const, icon: Car, label: "Outcall", desc: "Therapist comes to you" },
                      { value: "either" as const, icon: Zap, label: "Either", desc: "No preference" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setLocationPref(opt.value); goNext(); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          locationPref === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        <opt.icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Budget */}
              {step === "budget" && (
                <motion.div key="budget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold mb-2">What's your budget?</h3>
                  <p className="text-sm text-muted-foreground mb-6">Per session estimate</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "$" as const, label: "$", desc: "Under $80/hr" },
                      { value: "$$" as const, label: "$$", desc: "$80 – $150/hr" },
                      { value: "$$$" as const, label: "$$$", desc: "$150+/hr" },
                      { value: "any" as const, label: "Any", desc: "No preference" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setBudgetPref(opt.value); goNext(); }}
                        className={`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${
                          budgetPref === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <p className="font-bold text-lg">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Timeframe */}
              {step === "timeframe" && (
                <motion.div key="timeframe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold mb-2">When do you need it?</h3>
                  <p className="text-sm text-muted-foreground mb-6">Tap one</p>
                  <div className="space-y-3">
                    {[
                      { value: "today" as const, icon: Zap, label: "Today", desc: "Looking for someone available now" },
                      { value: "this-week" as const, icon: Clock, label: "This Week", desc: "Flexible within the next few days" },
                      { value: "flexible" as const, icon: Clock, label: "Flexible", desc: "No rush, just browsing options" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setTimeframePref(opt.value); goNext(); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          timeframePref === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        <opt.icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Massage Type */}
              {step === "type" && (
                <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold mb-2">What type of massage?</h3>
                  <p className="text-sm text-muted-foreground mb-6">Select one or more (or skip)</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {MASSAGE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setTypePref((prev) =>
                            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                          )
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          typePref.includes(type)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:border-foreground/30"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RESULTS */}
              {step === "results" && (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">Your Top Matches</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Based on your preferences. Contact directly — no bookings, no payments.
                  </p>

                  {top3.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-8 text-center">No matches found. Try adjusting your preferences.</p>
                  ) : (
                    <div className="space-y-3">
                      {top3.map((t, i) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-muted-foreground/40 transition-colors"
                        >
                          <div className="relative">
                            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center z-10">
                              {i + 1}
                            </span>
                            <img
                              src={t.image}
                              alt={t.name}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate">{t.name}</h4>
                              {t.verified && <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {t.city}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{t.specialty}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-sm font-bold">{t.price}</span>
                            <div className="flex gap-1.5">
                              <Link to={`/therapist/${t.id}`}>
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                  View
                                </Button>
                              </Link>
                              <Button size="sm" className="h-7 text-xs px-2 gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {rankedResults.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={resetAndClose}
                    >
                      View Full List ({rankedResults.length} results)
                    </Button>
                  )}

                  <p className="text-[10px] text-muted-foreground text-center mt-4 italic">
                    MasseurMatch is a directory only. All contact is directly between you and the provider.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Nav */}
          {step !== "results" && (
            <div className="flex items-center justify-between p-5 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={stepIdx === 0}
                className="gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>

              {step === "type" ? (
                <Button size="sm" onClick={goNext} className="gap-1">
                  See Matches
                  <Sparkles className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="gap-1 text-muted-foreground"
                >
                  Skip
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
