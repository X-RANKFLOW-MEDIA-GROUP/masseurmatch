"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Check, ChevronRight } from "lucide-react";
import { fadeInUp } from "@/components/animations/MicroInteractions";

export interface TherapistProfile {
  id: string;
  name: string;
  image: string;
  rating?: number;
  reviews: number;
  specialties: string[];
  priceRange: {
    min: number;
    max: number;
  };
  availability: {
    available: boolean;
    nextAvailable?: string;
  };
  incall: boolean;
  outcall: boolean;
  experience?: number;
  responseTime?: string;
  features: Record<string, boolean>;
}

export interface TherapistComparisonProps {
  profiles: TherapistProfile[];
  features: Array<{
    key: string;
    label: string;
    category?: string;
  }>;
}

export function TherapistComparison({
  profiles,
  features,
}: TherapistComparisonProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(
    profiles.slice(0, 2).map((p) => p.id)
  );

  const comparingProfiles = profiles.filter((p) =>
    selectedProfiles.includes(p.id)
  );

  const handleToggleProfile = (profileId: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Profile Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Select Therapists to Compare</h3>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {profiles.map((profile) => {
            const isSelected = selectedProfiles.includes(profile.id);
            return (
              <motion.button
                key={profile.id}
                onClick={() => handleToggleProfile(profile.id)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left group ${
                  isSelected
                    ? "border-brand-electric bg-brand-electric/5"
                    : "border-border hover:border-brand-electric/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-brand-electric border-brand-electric"
                      : "border-border group-hover:border-brand-electric"
                  }`}
                >
                  {isSelected && (
                    <Check size={14} className="text-white" />
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-electric to-brand-accent mb-3">
                  {profile.image && (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>

                <div className="font-medium text-foreground mb-1">
                  {profile.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {profile.rating ? `Rating ${profile.rating} (${profile.reviews})` : "New listing"}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Comparison Table */}
      <motion.div
        layout
        className="overflow-x-auto rounded-lg border border-border"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Feature
              </th>
              <AnimatePresence>
                {comparingProfiles.map((profile) => (
                  <th
                    key={profile.id}
                    className="px-6 py-4 text-center border-l border-border"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="font-semibold text-foreground">
                        {profile.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {profile.rating ? `Rating ${profile.rating}` : "New listing"}
                      </div>
                    </motion.div>
                  </th>
                ))}
              </AnimatePresence>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <motion.tr
                key={feature.key}
                className="border-b border-border hover:bg-muted/20 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
              >
                <td className="px-6 py-4 font-medium text-foreground text-sm">
                  {feature.label}
                </td>
                <AnimatePresence>
                  {comparingProfiles.map((profile) => {
                    const value = profile.features[feature.key];
                    return (
                      <td
                        key={profile.id}
                        className="px-6 py-4 text-center border-l border-border"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          {typeof value === "boolean" ? (
                            value ? (
                              <Check
                                size={20}
                                className="text-feedback-success mx-auto"
                              />
                            ) : (
                              <X
                                size={20}
                                className="text-feedback-error mx-auto"
                              />
                            )
                          ) : (
                            <span className="text-sm text-foreground">
                              {value}
                            </span>
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                </AnimatePresence>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* CTA */}
      {comparingProfiles.length > 0 && (
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {comparingProfiles.map((profile) => (
            <motion.a
              key={profile.id}
              href={`#profile-${profile.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-electric text-white font-medium hover:bg-brand-electric/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Profile: {profile.name}
              <ChevronRight size={16} />
            </motion.a>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

// Quick compare inline component for listing pages
interface CompareButtonProps {
  profileId: string;
  onCompare: (profileId: string) => void;
  isSelected?: boolean;
}

export function CompareButton({
  profileId,
  onCompare,
  isSelected = false,
}: CompareButtonProps) {
  return (
    <motion.button
      onClick={() => onCompare(profileId)}
      className={`p-2 rounded border transition-all ${
        isSelected
          ? "bg-brand-electric/10 border-brand-electric"
          : "border-border hover:border-brand-electric"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Add to comparison"
    >
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          isSelected
            ? "bg-brand-electric border-brand-electric"
            : "border-muted-foreground"
        }`}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
