"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AlertCircle, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldEditorProps } from "@/types/profile-fields";

interface JSONEditorProps extends FieldEditorProps {
  /** Whether to show formatted view toggle */
  showFormatter?: boolean;
  /** Whether to use Monaco Editor if available */
  useMonaco?: boolean;
}

export const JSONEditor = React.forwardRef<HTMLTextAreaElement, JSONEditorProps>(
  (
    {
      config,
      value,
      onChange,
      errors = [],
      isSaving = false,
      className,
      showFormatter = true,
    },
    ref
  ) => {
    const [isFormatted, setIsFormatted] = useState(true);
    const [copied, setCopied] = useState(false);
    const hasError = errors.length > 0;

    let jsonString = "";
    try {
      if (typeof value === "string") {
        jsonString = isFormatted ? JSON.stringify(JSON.parse(value), null, 2) : value;
      } else if (value !== null && value !== undefined) {
        jsonString = isFormatted
          ? JSON.stringify(value, null, 2)
          : JSON.stringify(value);
      }
    } catch {
      jsonString = typeof value === "string" ? value : JSON.stringify(value);
    }

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        try {
          const parsed = JSON.parse(text);
          onChange(parsed);
        } catch {
          // Allow invalid JSON during editing
          onChange(text);
        }
      },
      [onChange]
    );

    const handleFormat = useCallback(() => {
      try {
        const parsed =
          typeof value === "string" ? JSON.parse(value) : value;
        onChange(JSON.stringify(parsed, null, 2));
      } catch (err) {
        console.error("Failed to format JSON:", err);
      }
    }, [value, onChange]);

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [jsonString]);

    const isValidJSON = (() => {
      try {
        if (typeof value === "string") {
          JSON.parse(value);
        }
        return true;
      } catch {
        return false;
      }
    })();

    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            {config.label}
            {config.validation?.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            {isSaving && (
              <Loader2 className="h-4 w-4 text-accent animate-spin" />
            )}
            {showFormatter && (
              <button
                onClick={handleFormat}
                disabled={isSaving || config.readOnly || !isValidJSON}
                className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Format
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={isSaving}
              className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* JSON textarea */}
        <textarea
          ref={ref}
          value={jsonString}
          onChange={handleChange}
          placeholder={config.placeholder || "Enter valid JSON..."}
          disabled={isSaving || config.readOnly}
          rows={12}
          className={cn(
            "motion-premium w-full font-mono text-xs rounded-xl border bg-white/92 px-4 py-3 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/_0.88)] placeholder:text-muted-foreground/90 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
            hasError || !isValidJSON
              ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/25"
              : "border-border/90 focus-visible:border-brand-secondary/35 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          )}
        />

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs">
          <div>
            {!isValidJSON && (
              <span className="text-destructive font-medium">
                Invalid JSON
              </span>
            )}
            {isValidJSON && (
              <span className="text-success font-medium">Valid JSON</span>
            )}
          </div>
          <span className="text-muted-foreground">
            {jsonString.length} characters
          </span>
        </div>

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

JSONEditor.displayName = "JSONEditor";
