"use client";

import React, { useState, useCallback } from "react";
import { AlertCircle, Loader2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { FieldEditorProps } from "@/types/profile-fields";

export const ArrayFieldEditor = React.forwardRef<
  HTMLInputElement,
  FieldEditorProps
>(
  (
    {
      config,
      value,
      onChange,
      errors = [],
      isSaving = false,
      className,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
    const arrayValue = Array.isArray(value) ? value : [];
    const hasError = errors.length > 0;

    const handleAddItem = useCallback(() => {
      const currentArray = Array.isArray(value) ? value : [];
      if (inputValue.trim()) {
        const newArray = [...currentArray, inputValue.trim()];
        if (
          !config.validation?.maxLength ||
          newArray.length <= config.validation.maxLength
        ) {
          onChange(newArray);
          setInputValue("");
        }
      }
    }, [inputValue, value, onChange, config.validation?.maxLength]);

    const handleRemoveItem = useCallback(
      (index: number) => {
        const currentArray = Array.isArray(value) ? value : [];
        onChange(currentArray.filter((_, i) => i !== index));
      },
      [value, onChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddItem();
        }
      },
      [handleAddItem]
    );

    return (
      <div className={cn("space-y-3", className)}>
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

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder || "Add an item and press Enter"}
            disabled={isSaving || config.readOnly}
            className={cn(
              hasError &&
                "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/25"
            )}
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={
              isSaving ||
              config.readOnly ||
              !inputValue.trim() ||
              Boolean(
                config.validation?.maxLength &&
                  arrayValue.length >= config.validation.maxLength
              )
            }
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors motion-premium font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Chips Display */}
        {arrayValue.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {arrayValue.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-2 rounded-lg border border-accent/20"
              >
                <span className="text-sm font-medium">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={isSaving || config.readOnly}
                  className="p-0.5 hover:bg-accent/20 rounded transition-colors disabled:cursor-not-allowed"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
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

        {/* Counter */}
        {config.validation?.maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {arrayValue.length} / {config.validation.maxLength} items
          </p>
        )}

        {arrayValue.length === 0 && config.validation?.minLength && (
          <p className="text-xs text-warning">
            Minimum {config.validation.minLength} item(s) required
          </p>
        )}
      </div>
    );
  }
);

ArrayFieldEditor.displayName = "ArrayFieldEditor";
