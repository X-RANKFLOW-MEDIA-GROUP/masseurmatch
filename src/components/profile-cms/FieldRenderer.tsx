"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FieldType, type FieldEditorProps } from "@/types/profile-fields";
import { TextFieldEditor } from "./TextFieldEditor";
import { ArrayFieldEditor } from "./ArrayFieldEditor";
import { BooleanFieldEditor } from "./BooleanFieldEditor";
import { IntegerFieldEditor } from "./IntegerFieldEditor";
import { JSONEditor } from "./JSONEditor";

interface SelectFieldEditorProps extends FieldEditorProps {
  multiline?: boolean;
  rows?: number;
}

/**
 * FieldRenderer automatically selects the correct editor component
 * based on the field type defined in the config.
 *
 * Usage:
 * ```tsx
 * <FieldRenderer
 *   config={fieldConfig}
 *   value={currentValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   errors={validationErrors}
 * />
 * ```
 */
export const FieldRenderer = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement,
  SelectFieldEditorProps
>(
  (
    {
      config,
      value,
      onChange,
      errors,
      isSaving,
      className,
      ...rest
    },
    ref
  ) => {
    const baseProps = {
      config,
      value,
      onChange,
      errors,
      isSaving,
      className,
    };

    switch (config.type) {
      case FieldType.TEXT:
        return (
          <TextFieldEditor
            {...baseProps}
            ref={ref as React.Ref<HTMLInputElement | HTMLTextAreaElement>}
            multiline={false}
          />
        );

      case FieldType.ARRAY:
        return (
          <ArrayFieldEditor
            {...baseProps}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );

      case FieldType.BOOLEAN:
        return (
          <BooleanFieldEditor
            {...baseProps}
            ref={ref as React.Ref<HTMLButtonElement>}
          />
        );

      case FieldType.INTEGER:
        return (
          <IntegerFieldEditor
            {...baseProps}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );

      case FieldType.JSONB:
        return (
          <JSONEditor
            {...baseProps}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        );

      case FieldType.SELECT:
        // SELECT fields render as dropdown
        return (
          <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                {config.label}
                {config.validation?.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </label>
            </div>

            <select
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              disabled={isSaving || config.readOnly}
              className={cn(
                "motion-premium flex h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/_0.88)] placeholder:text-muted-foreground/90 focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <option value="">
                {config.placeholder || "Select an option"}
              </option>
              {config.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {config.helpText && (
              <p className="text-xs text-muted-foreground">
                {config.helpText}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-destructive">
            Unknown field type: {config.type}
          </div>
        );
    }
  }
);

FieldRenderer.displayName = "FieldRenderer";
