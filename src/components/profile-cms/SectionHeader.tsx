"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionHeaderProps } from "@/types/profile-fields";

const sectionTitles: Record<string, string> = {
  basic: "Basic Information",
  services: "Services & Specialties",
  pricing: "Pricing & Rates",
  marketing: "Marketing & Visibility",
  advanced: "Advanced Settings",
};

const sectionDescriptions: Record<string, string> = {
  basic: "Core profile information including name, location, and contact details",
  services: "Services offered, specialties, and certifications",
  pricing: "Rate cards, session pricing, and package options",
  marketing: "SEO, tags, descriptions, and promotional content",
  advanced: "Advanced configuration and system settings",
};

export const SectionHeader = React.forwardRef<
  HTMLButtonElement,
  SectionHeaderProps
>(
  (
    {
      section,
      title = sectionTitles[section] || section,
      description = sectionDescriptions[section],
      isExpanded: controlledExpanded,
      onToggle,
      className,
    },
    ref
  ) => {
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(true);
    const isExpanded =
      controlledExpanded !== undefined
        ? controlledExpanded
        : uncontrolledExpanded;

    const handleToggle = () => {
      if (controlledExpanded === undefined) {
        setUncontrolledExpanded(!isExpanded);
      }
      onToggle?.(!isExpanded);
    };

    return (
      <button
        ref={ref}
        onClick={handleToggle}
        className={cn(
          "w-full text-left motion-premium",
          className
        )}
      >
        <div className="flex items-start gap-3 p-4 rounded-xl border border-border/90 bg-gradient-to-r from-white/98 to-white/94 hover:from-white/96 hover:to-white/92 transition-colors group">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {title}
              </h2>
              <span className="px-2 py-1 rounded text-xs font-medium bg-accent/10 text-accent">
                {section.toUpperCase()}
              </span>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex-shrink-0 mt-1 transition-transform duration-300 text-muted-foreground group-hover:text-foreground",
              isExpanded && "rotate-180"
            )}
          >
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </button>
    );
  }
);

SectionHeader.displayName = "SectionHeader";
