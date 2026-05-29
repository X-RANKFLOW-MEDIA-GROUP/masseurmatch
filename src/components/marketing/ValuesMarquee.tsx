import InfiniteMarquee from "@/components/motion/InfiniteMarquee";

const VALUES = [
  "VERIFIED THERAPISTS",
  "BACKGROUND CHECKED",
  "LICENSED PROFESSIONALS",
  "LGBTQ+ AFFIRMING",
  "REAL REVIEWS",
  "SAFE & PRIVATE",
];

export function ValuesMarquee() {
  return (
    <InfiniteMarquee
      items={VALUES}
      separator="✦"
      speed={40}
      className="border-y border-border bg-muted/30 py-6 font-display text-2xl uppercase tracking-tight text-foreground lg:text-3xl"
    />
  );
}
