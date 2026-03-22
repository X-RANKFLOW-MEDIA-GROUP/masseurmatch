import type { KnottyIntent } from "@/lib/knotty/types";

type SearchParamsLike = {
  get(name: string): string | null;
};

export type KnottyAttribution = {
  source: "knotty";
  sessionId: string;
  intent: KnottyIntent;
  position: number | null;
};

export function buildKnottyProfilePath(
  basePath: string,
  input: {
    intent: KnottyIntent;
    position: number;
    sessionId: string;
  },
) {
  const url = new URL(basePath, "https://masseurmatch.local");
  url.searchParams.set("src", "knotty");
  url.searchParams.set("intent", input.intent);
  url.searchParams.set("pos", String(input.position));
  url.searchParams.set("sessionId", input.sessionId);
  return `${url.pathname}${url.search}`;
}

export function readKnottyAttribution(searchParams: SearchParamsLike | null): KnottyAttribution | null {
  if (!searchParams) {
    return null;
  }

  if (searchParams.get("src") !== "knotty") {
    return null;
  }

  const sessionId = searchParams.get("sessionId");
  const intent = searchParams.get("intent");
  const position = searchParams.get("pos");

  if (!sessionId || !intent) {
    return null;
  }

  return {
    source: "knotty",
    sessionId,
    intent: intent as KnottyIntent,
    position: position ? Number(position) || null : null,
  };
}
