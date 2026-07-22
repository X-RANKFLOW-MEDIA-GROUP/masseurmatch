"use client";

import { useEffect } from "react";

export function useFadeInOnScroll() {
  useEffect(() => {
    // Mark all fade-in elements as visible immediately on mount if prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.querySelectorAll(".pp-fade-in").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      // Trigger when element is 0% visible and scroll into top 150px of viewport
      { threshold: 0, rootMargin: "150px 0px 0px 0px" }
    );

    document.querySelectorAll(".pp-fade-in").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}
