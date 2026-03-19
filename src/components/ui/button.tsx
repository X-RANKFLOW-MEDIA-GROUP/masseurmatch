import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-action-primary text-white shadow-[0_14px_32px_rgba(11,31,58,0.12)] hover:bg-action-primary-hover hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-white text-foreground hover:border-primary/20 hover:bg-secondary",
        secondary:
          "bg-action-secondary text-white shadow-[0_14px_32px_rgba(11,31,58,0.12)] hover:bg-action-secondary-hover hover:-translate-y-0.5",
        ghost: "text-foreground hover:bg-secondary hover:text-primary",
        link: "text-primary underline-offset-4 hover:text-brand-deep hover:underline",
        hero:
          "bg-action-primary text-white font-bold shadow-[0_18px_40px_rgba(255,138,31,0.28)] hover:bg-action-primary-hover hover:scale-[1.02] transition-transform",
        glass: "border border-white/20 bg-white/10 text-white hover:bg-white/20",
        premium:
          "bg-brand-gold text-white shadow-[0_16px_36px_rgba(231,168,75,0.28)] hover:brightness-[0.98] hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
