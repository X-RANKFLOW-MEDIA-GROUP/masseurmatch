"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? (window.scrollY / max) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, value)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[70] h-[3px] w-full overflow-hidden bg-transparent">
      <div
        className="h-full rounded-r-full bg-[linear-gradient(90deg,rgb(var(--color-action-primary-rgb)),rgb(var(--color-brand-soft-accent-rgb)),rgb(var(--color-brand-secondary-rgb)))] shadow-[0_0_24px_rgb(var(--color-action-primary-rgb)/0.4)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
