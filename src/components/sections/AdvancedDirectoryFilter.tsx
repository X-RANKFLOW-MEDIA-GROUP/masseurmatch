"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SlidersIcon, FilterX } from "lucide-react";
import { fadeInUp } from "@/components/animations/MicroInteractions";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "range" | "multi-select";
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface AdvancedDirectoryFilterProps {
  groups: FilterGroup[];
  onFilterChange?: (filters: Record<string, any>) => void;
  onReset?: () => void;
}

export function AdvancedDirectoryFilter({
  groups,
  onFilterChange = () => undefined,
  onReset,
}: AdvancedDirectoryFilterProps) {
  const [expanded, setExpanded] = useState<string | null>(groups[0]?.id || null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (groupId: string, value: any) => {
    const newFilters = { ...filters, [groupId]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeCount = Object.values(filters).filter((v) => v !== null && v !== undefined).length;

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersIcon size={20} className="text-brand-primary" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeCount > 0 && (
            <motion.span
              className="px-2 py-1 rounded-full bg-brand-electric/10 text-brand-electric text-xs font-semibold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {activeCount}
            </motion.span>
          )}
        </div>
        {activeCount > 0 && (
          <motion.button
            onClick={() => {
              setFilters({});
              onReset?.();
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FilterX size={14} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Filter Groups */}
      <motion.div className="space-y-3 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {groups.map((group) => (
            <FilterGroupComponent
              key={group.id}
              group={group}
              isExpanded={expanded === group.id}
              onToggle={() =>
                setExpanded(expanded === group.id ? null : group.id)
              }
              value={filters[group.id]}
              onChange={(value) => handleFilterChange(group.id, value)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function FilterGroupComponent({
  group,
  isExpanded,
  onToggle,
  value,
  onChange,
}: {
  group: FilterGroup;
  isExpanded: boolean;
  onToggle: () => void;
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <motion.div
      className="border border-border rounded-lg overflow-hidden bg-card/40 backdrop-blur-sm hover:border-brand-electric/30 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-card/60 transition-colors"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      >
        <span className="font-medium text-foreground">{group.label}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {group.type === "checkbox" && group.options && (
                <CheckboxGroup
                  options={group.options}
                  value={value || []}
                  onChange={onChange}
                />
              )}
              {group.type === "range" && (
                <RangeFilter
                  min={group.min || 0}
                  max={group.max || 1000}
                  value={value || [group.min, group.max]}
                  onChange={onChange}
                />
              )}
              {group.type === "multi-select" && group.options && (
                <MultiSelect
                  options={group.options}
                  value={value || []}
                  onChange={onChange}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CheckboxGroup({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <motion.div className="space-y-2">
      {options.map((option) => (
        <motion.label
          key={option.id}
          className="flex items-center gap-3 cursor-pointer group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 4 }}
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={value.includes(option.id)}
              onChange={(e) => {
                const newValue = e.target.checked
                  ? [...value, option.id]
                  : value.filter((id) => id !== option.id);
                onChange(newValue);
              }}
              className="w-4 h-4 appearance-none border-2 border-border rounded bg-white checked:bg-brand-electric checked:border-brand-electric cursor-pointer transition-all"
            />
            {value.includes(option.id) && (
              <motion.svg
                className="absolute inset-0 w-4 h-4 text-white pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </div>
          <span className="text-sm text-foreground group-hover:text-brand-primary transition-colors">
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              ({option.count})
            </span>
          )}
        </motion.label>
      ))}
    </motion.div>
  );
}

function RangeFilter({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        type="range"
        min={min}
        max={max}
        value={value[0]}
        onChange={(e) =>
          onChange([Math.min(parseInt(e.target.value), value[1]), value[1]])
        }
        className="w-full accent-brand-electric"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={(e) =>
          onChange([value[0], Math.max(parseInt(e.target.value), value[0])])
        }
        className="w-full accent-brand-electric"
      />
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">${value[0]}</span>
        <span className="text-muted-foreground">-</span>
        <span className="font-medium text-foreground">${value[1]}</span>
      </div>
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <motion.button
          key={option.id}
          onClick={() => {
            const newValue = value.includes(option.id)
              ? value.filter((id) => id !== option.id)
              : [...value, option.id];
            onChange(newValue);
          }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            value.includes(option.id)
              ? "bg-brand-electric text-white shadow-lg"
              : "bg-border/50 text-foreground hover:bg-border"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  );
}
