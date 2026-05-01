import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export { Badge as AppBadge, Button as AppButton, Input as AppInput, Textarea as AppTextarea };

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("premium-surface motion-premium rounded-[2rem] border border-border bg-background p-6 shadow-brand", className)}>
      {children}
    </div>
  );
}

export function PageSection({
  eyebrow,
  title,
  description,
  className,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p> : null}
      {actions ? <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">{actions}</div> : null}
    </div>
  );
}

export function StatGrid({
  items,
  className,
}: {
  items: Array<{ label: string; value: string; note?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="premium-surface motion-premium rounded-[1.4rem] border border-border bg-white/88 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
          <p className="font-display mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
          {item.note ? <p className="mt-2 text-sm text-muted-foreground">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("premium-surface rounded-[2rem] border border-dashed border-border px-6 py-10 text-center", className)}>
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
