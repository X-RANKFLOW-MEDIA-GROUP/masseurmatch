"use client";

import React, { useState, useCallback } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { FieldEditorProps } from "@/types/profile-fields";

interface TextFieldEditorProps extends FieldEditorProps {
  /** For text fields specifically */
  multiline?: boolean;
  /** Number of rows for textarea */
  rows?: number;
}

export const TextFieldEditor = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldEditorProps
>(
  (
    {
      config,
      value,
      onChange,
      errors = [],
      isSaving = false,
      className,
      multiline = false,
      rows = 4,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const stringValue = String(value || "");
    const hasError = errors.length > 0;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    if (multiline) {
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

          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={stringValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={config.placeholder}
            rows={rows}
            disabled={isSaving || config.readOnly}
            maxLength={config.validation?.maxLength}
            className={cn(
              "motion-premium flex w-full rounded-xl border bg-white/92 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/_0.88)] placeholder:text-muted-foreground/90 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
              hasError
                ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/25"
                : "border-border/90 focus-visible:border-brand-secondary/35 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
            )}
          />

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

          {config.validation?.maxLength && (
            <p className="text-xs text-muted-foreground text-right">
              {stringValue.length} / {config.validation.maxLength}
            </p>
          )}
        </div>
      );
    }

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

        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          type="text"
          value={stringValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={config.placeholder}
          disabled={isSaving || config.readOnly}
          maxLength={config.validation?.maxLength}
          className={cn(
            hasError &&
              "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/25"
          )}
        />

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

        {config.validation?.maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {stringValue.length} / {config.validation.maxLength}
          </p>
        )}
      </div>
    );
  }
);

TextFieldEditor.displayName = "TextFieldEditor";
