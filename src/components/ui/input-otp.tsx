"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2", containerClassName)}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

function InputOTPGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

function InputOTPSlot({ index, className }: { index: number; className?: string }) {
  const otpContext = React.useContext(OTPInputContext);
  const slot = otpContext?.slots[index];

  return (
    <div
      className={cn(
        "flex h-11 w-9 items-center justify-center rounded-md border border-border bg-background text-sm font-medium",
        slot?.isActive ? "ring-2 ring-ring ring-offset-2" : "",
        className,
      )}
    >
      {slot?.char ?? ""}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
