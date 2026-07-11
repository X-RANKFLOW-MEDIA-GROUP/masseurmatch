"use client";

import React from "react";

type SmoothScrollProps = {
  children: React.ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  // Disabled Lenis smooth scroll library as it was preventing native scrolling.
  // Native browser scroll works correctly and provides better performance.
  return <>{children}</>;
}
