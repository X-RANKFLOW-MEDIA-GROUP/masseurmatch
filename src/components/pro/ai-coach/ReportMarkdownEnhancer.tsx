"use client";

import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MarkdownReport } from "./MarkdownReport";

const roots = new WeakMap<Element, Root>();

function enhanceReports() {
  document.querySelectorAll("article p.whitespace-pre-wrap").forEach((paragraph) => {
    if (paragraph.getAttribute("data-markdown-enhanced") === "true") return;
    const content = paragraph.textContent?.trim() || "";
    if (!content || !/(^|\n)#{1,3}\s|\*\*[^*]+\*\*|(^|\n)\|.+\|/m.test(content)) return;

    const container = document.createElement("div");
    container.setAttribute("data-markdown-enhanced", "true");
    paragraph.replaceWith(container);
    const root = createRoot(container);
    roots.set(container, root);
    root.render(<MarkdownReport content={content} />);
  });
}

export function ReportMarkdownEnhancer() {
  useEffect(() => {
    enhanceReports();
    const observer = new MutationObserver(enhanceReports);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
