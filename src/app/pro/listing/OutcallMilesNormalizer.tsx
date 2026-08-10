"use client";

import { useEffect } from "react";

/**
 * Compatibility shim for the legacy listing editor. The persisted
 * `outcall_radius` values are used by the public profile as miles, but the
 * legacy editor still labels the control as km. Keep the stored values intact
 * and correct only the stale UI copy until the large editor is decomposed.
 */
export function OutcallMilesNormalizer() {
  useEffect(() => {
    const normalize = () => {
      const root = document.querySelector("main") || document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const value = node.nodeValue || "";
        if (value.includes("Outcall Radius (km)")) {
          node.nodeValue = value.replaceAll("Outcall Radius (km)", "Outcall Radius (miles)");
        } else if (/^\s*\d+\s+km\s*$/.test(value)) {
          node.nodeValue = value.replace(/\bkm\b/g, "miles");
        }
        node = walker.nextNode();
      }
    };

    normalize();
    const observer = new MutationObserver(normalize);
    observer.observe(document.body, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
