import InfiniteMarquee from "@/components/motion/InfiniteMarquee";

const VALUES = [
  "Verified Therapists",
  "Background Checked",
  "Licensed Professionals",
  "LGBTQ+ Affirming",
  "Real Reviews",
  "Safe & Private",
];

export function ValuesMarquee() {
  return (
    <InfiniteMarquee
      items={VALUES}
      separator="·"
      speed={35}
      className="border-y border-border/40 py-4 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground"
    />
  );
}
