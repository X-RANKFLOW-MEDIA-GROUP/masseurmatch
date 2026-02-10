interface MarqueeProps {
  items: string[];
  className?: string;
}

export const Marquee = ({ items, className = "" }: MarqueeProps) => {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-content">
        {items.map((item, i) => (
          <span key={i} className="text-2xl md:text-4xl font-heading font-bold text-muted-foreground/30 whitespace-nowrap uppercase tracking-widest">
            {item}
          </span>
        ))}
      </div>
      <div className="marquee-content" aria-hidden="true">
        {items.map((item, i) => (
          <span key={i} className="text-2xl md:text-4xl font-heading font-bold text-muted-foreground/30 whitespace-nowrap uppercase tracking-widest">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
