"use client";

type TextRevealProps = {
  text: string;
  delay?: number;
  className?: string;
};

export function TextReveal({ text, className }: TextRevealProps) {
  return <span className={className}>{text}</span>;
}
