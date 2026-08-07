"use client";

import { useEffect } from "react";

type Ticket = {
  id: string;
  subject: string;
  category: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  body: string;
  author_role: string;
  author_name: string | null;
  created_at: string;
};

const categoryLabels: Record<string, string> = {
  billing: "Billing",
  payouts: "Payouts",
  technical: "Technical issue",
  profile: "Profile & listing",
  verification: "Verification",
  account: "Account",
  trust_safety: "Trust & Safety",
  other: "Other",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function patchList(tickets: Ticket[]) {
  document.querySelectorAll("button h3").forEach((heading) => {
    const ticket = tickets.find((candidate) => candidate.subject === heading.textContent?.trim());
    const metadata = heading.parentElement?.querySelector("p");
    if (!ticket || !metadata) return;
    metadata.textContent = `${categoryLabels[ticket.category] || ticket.category} · Updated ${formatDate(ticket.updated_at)}`;
  });
}

async function patchThread(tickets: Ticket[]) {
  const title = document.querySelector("main h1, [class*='max-w-3xl'] h1")?.textContent?.trim();
  const ticket = tickets.find((candidate) => candidate.subject === title);
  if (!ticket) return;

  const response = await fetch(`/api/support/tickets/${ticket.id}`, { cache: "no-store" });
  if (!response.ok) return;
  const payload = await response.json() as { messages?: Message[] };

  const headerMeta = Array.from(document.querySelectorAll("p")).find((node) => node.textContent?.includes("Opened "));
  if (headerMeta) {
    headerMeta.textContent = `${categoryLabels[ticket.category] || ticket.category} · Opened ${formatDate(ticket.created_at)}`;
  }

  for (const message of payload.messages ?? []) {
    const body = Array.from(document.querySelectorAll("p.whitespace-pre-wrap")).find(
      (node) => node.textContent?.trim() === message.body.trim(),
    );
    const meta = body?.previousElementSibling;
    if (!meta) continue;
    const author = message.author_role === "provider" ? "You" : message.author_name || "Support Team";
    meta.textContent = `${author} · ${formatDate(message.created_at)}`;
  }
}

export function TicketLocaleEnhancer() {
  useEffect(() => {
    let tickets: Ticket[] = [];
    let timer: number | undefined;

    const patch = () => {
      patchList(tickets);
      void patchThread(tickets);
    };

    fetch("/api/support/tickets", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        tickets = payload?.tickets ?? [];
        patch();
      })
      .catch(() => undefined);

    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(patch, 20);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
