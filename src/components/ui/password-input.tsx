"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showStrength?: boolean;
}

function getPasswordStrength(pw: string): { label: string; color: string; percent: number } {
  if (pw.length === 0) return { label: "", color: "bg-gray-200", percent: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-red-500", percent: 20 };
  if (score <= 2) return { label: "Fair", color: "bg-amber-500", percent: 40 };
  if (score <= 3) return { label: "Good", color: "bg-yellow-500", percent: 60 };
  if (score <= 4) return { label: "Strong", color: "bg-green-500", percent: 80 };
  return { label: "Very Strong", color: "bg-green-600", percent: 100 };
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const value = (props.value as string) || "";
    const strength = getPasswordStrength(value);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn("pr-20", className)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span aria-hidden>{showPassword ? "Hide" : "Show"}</span>
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        {showStrength && value && (
          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{strength.label}</p>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
