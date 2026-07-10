import { NextResponse } from "next/server";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";

const PLATFORM_VALIDATORS: Record<string, (url: string) => boolean> = {
  rubmaps: (url) => {
    try {
      const u = new URL(url);
      return u.hostname.includes("rubmaps.com") && u.pathname.includes("/provider");
    } catch {
      return false;
    }
  },
  "4corners": (url) => {
    try {
      const u = new URL(url);
      return u.hostname.includes("4corners") && u.pathname.length > 1;
    } catch {
      return false;
    }
  },
  nuru: (url) => {
    try {
      const u = new URL(url);
      return u.hostname.includes("nurumap") && u.pathname.includes("/provider");
    } catch {
      return false;
    }
  },
  custom: (url) => {
    try {
      const u = new URL(url);
      return u.protocol.startsWith("http");
    } catch {
      return false;
    }
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, platform } = body;

    if (!url || typeof url !== "string") {
      throw new RouteError(400, "URL is required.");
    }

    if (!platform || typeof platform !== "string") {
      throw new RouteError(400, "Platform is required.");
    }

    if (!PLATFORM_VALIDATORS[platform]) {
      throw new RouteError(400, "Unsupported platform.");
    }

    const isValid = PLATFORM_VALIDATORS[platform](url);
    if (!isValid) {
      throw new RouteError(400, `Invalid ${platform} URL format. Please check and try again.`);
    }

    // Optional: Make a HEAD request to verify the URL is reachable
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const headRes = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!headRes.ok && headRes.status !== 404) {
        throw new RouteError(400, "Could not reach the URL. Please check it and try again.");
      }
    } catch (fetchErr) {
      // If HEAD fails, that's okay — the URL might have CORS restrictions
      // but we still accept it for backend validation
      if (fetchErr instanceof RouteError) throw fetchErr;
    }

    return json({ ok: true, valid: true });
  } catch (error) {
    return errorResponse(error);
  }
}
