"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldPreviewProps } from "@/types/profile-fields";
import { FieldType } from "@/types/profile-fields";

export const FieldPreview = React.forwardRef<
  HTMLDivElement,
  FieldPreviewProps
>(({ config, value, className }, ref) => {
  const renderValue = (): React.ReactNode => {
    switch (config.type) {
      case FieldType.BOOLEAN:
        return (
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-success font-medium">Yes</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No</span>
              </>
            )}
          </div>
        );

      case FieldType.ARRAY:
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-muted-foreground italic">Empty</span>;
        }
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        );

      case FieldType.JSONB:
        try {
          const jsonValue =
            typeof value === "string" ? JSON.parse(value) : value;
          return (
            <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 font-mono text-foreground border border-border/90">
              {JSON.stringify(jsonValue, null, 2)}
            </pre>
          );
        } catch {
          return (
            <pre className="text-xs bg-muted/50 p-3 rounded-lg font-mono text-destructive border border-border/90">
              Invalid JSON
            </pre>
          );
        }

      case FieldType.INTEGER:
        return (
          <span className="font-mono text-sm font-bold text-accent">
            {value ?? 0}
          </span>
        );

      case FieldType.SELECT: {
        const option = config.options?.find((opt) => opt.value === value);
        return (
          <span className="inline-flex items-center px-3 py-1 bg-secondary/10 text-secondary rounded-lg border border-secondary/20 text-sm font-medium">
            {option?.label ? String(option.label) : (value ? String(value) : "—")}
          </span>
        );
      }

      case FieldType.TEXT:
      default:
        if (!value) {
          return <span className="text-muted-foreground italic">Empty</span>;
        }
        return (
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {String(value)}
          </p>
        );
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "space-y-2 p-4 rounded-xl border border-border/90 bg-white/92",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {config.label}
        </label>
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {config.type}
        </span>
      </div>

      <div className="pt-2">{renderValue()}</div>

      {config.helpText && (
        <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">
          {config.helpText}
        </p>
      )}
    </div>
  );
});

FieldPreview.displayName = "FieldPreview";
