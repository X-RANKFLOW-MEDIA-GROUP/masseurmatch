import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "motion-premium flex min-h-[120px] w-full rounded-xl border border-input/90 bg-white/92 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/_0.88)] ring-offset-background placeholder:text-muted-foreground/90 focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
