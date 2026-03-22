"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type ScrambleTextProps = {
  text: string;
  playKey?: number;
  duration?: number;
  className?: string;
};

export function ScrambleText({
  text,
  playKey,
  duration = 280,
  className,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (playKey === undefined || playKey <= 0) {
      return undefined;
    }

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    startRef.current = null;

    const step = (time: number) => {
      if (startRef.current === null) {
        startRef.current = time;
      }

      const progress = Math.min((time - startRef.current) / duration, 1);
      const settledCount = Math.floor(progress * text.length);
      const nextValue = text
        .split("")
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }

          if (index < settledCount || progress >= 1) {
            return char;
          }

          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] || char;
        })
        .join("");

      setDisplayText(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      frameRef.current = null;
      startRef.current = null;
      setDisplayText(text);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      startRef.current = null;
      setDisplayText(text);
    };
  }, [duration, playKey, text]);

  return <span className={cn("inline-block", className)}>{displayText}</span>;
}
