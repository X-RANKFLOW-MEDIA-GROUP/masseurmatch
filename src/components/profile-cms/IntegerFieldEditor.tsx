"use client";

import React, { useState, useCallback } from "react";
import { AlertCircle, Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { FieldEditorProps } from "@/types/profile-fields";

export const IntegerFieldEditor = React.forwardRef<
  HTMLInputElement,
  FieldEditorProps
>(
  (
    { config, value, onChange, errors = [], isSaving = false, className },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const numValue = Number(value) || 0;
    const hasError = errors.length > 0;
    const minValue = config.validation?.minValue ?? Number.MIN_SAFE_INTEGER;
    const maxValue = config.validation?.maxValue ?? Number.MAX_SAFE_INTEGER;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (newValue === "" || newValue === "-") {
          onChange(newValue);
        } else {
          const num = parseInt(newValue, 10);
          if (!Number.isNaN(num)) {
            onChange(num);
          }
        }
      },
      [onChange]
    );

    const handleIncrement = useCallback(() => {
      const newValue = numValue + 1;
      if (newValue <= maxValue) {
        onChange(newValue);
      }
    }, [numValue, maxValue, onChange]);

    const handleDecrement = useCallback(() => {
      const newValue = numValue - 1;
      if (newValue >= minValue) {
        onChange(newValue);
      }
    }, [numValue, minValue, onChange]);

    const canIncrement = numValue < maxValue;
    const canDecrement = numValue > minValue;

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            {config.label}
            {config.validation?.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
          {isSaving && (
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
          )}
        </div>

        {/* Input with stepper buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDecrement}
            disabled={isSaving || config.readOnly || !canDecrement}
            className="flex items-center justify-center px-3 py-2 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors motion-premium border border-border/90"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>

          <Input
            ref={ref}
            type="number"
            value={numValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isSaving || config.readOnly}
            min={minValue}
            max={maxValue}
            placeholder={config.placeholder || "0"}
            className={cn(
              "text-center",
              hasError &&
                "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/25"
            )}
          />

          <button
            onClick={handleIncrement}
            disabled={isSaving || config.readOnly || !canIncrement}
            className="flex items-center justify-center px-3 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors motion-premium border border-border/90"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Range info */}
        {(minValue !== Number.MIN_SAFE_INTEGER ||
          maxValue !== Number.MAX_SAFE_INTEGER) && (
          <p className="text-xs text-muted-foreground">
            Range: {minValue} to {maxValue}
          </p>
        )}

        {config.helpText && !hasError && (
          <p className="text-xs text-muted-foreground">{config.helpText}</p>
        )}

        {hasError && (
          <div className="space-y-1">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

IntegerFieldEditor.displayName = "IntegerFieldEditor";
