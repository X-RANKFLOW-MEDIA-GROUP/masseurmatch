"use client";

import React, { useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import type { FieldEditorProps } from "@/types/profile-fields";

export const BooleanFieldEditor = React.forwardRef<
  HTMLButtonElement,
  FieldEditorProps
>(
  (
    { config, value, onChange, isSaving = false, className },
    ref
  ) => {
    const boolValue = Boolean(value);

    const handleChange = useCallback(() => {
      onChange(!boolValue);
    }, [boolValue, onChange]);

    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/90 bg-white/92 hover:bg-white/96 transition-colors motion-premium">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground cursor-pointer">
              {config.label}
              {config.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </label>
            {config.helpText && (
              <p className="text-xs text-muted-foreground mt-1">
                {config.helpText}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 ml-4">
            {isSaving && (
              <Loader2 className="h-4 w-4 text-accent animate-spin" />
            )}
            <Switch
              ref={ref}
              checked={boolValue}
              onCheckedChange={handleChange}
              disabled={isSaving || config.readOnly}
              aria-label={config.label}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground px-4">
          {boolValue ? (
            <span className="text-accent font-medium">Enabled</span>
          ) : (
            <span className="text-muted-foreground">Disabled</span>
          )}
        </div>
      </div>
    );
  }
);

BooleanFieldEditor.displayName = "BooleanFieldEditor";
