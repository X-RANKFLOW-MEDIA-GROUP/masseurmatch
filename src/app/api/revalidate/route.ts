import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { envOptional } from "@/app/_lib/env";
import { getSitemapRevalidatePaths, normalizeRevalidatePaths } from "@/app/_lib/revalidate";

export const runtime = "nodejs";

function secretsMatch(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const expectedSecret = envOptional(["REVALIDATE_SECRET"]);

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "revalidation secret is not configured" },
      { status: 503 },
    );
  }

  const receivedSecret = request.headers.get("x-revalidate-secret") || "";

  if (!secretsMatch(receivedSecret, expectedSecret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestPaths = Array.isArray(body?.paths) ? body.paths : [];
  const paths = normalizeRevalidatePaths([...requestPaths, ...getSitemapRevalidatePaths()]);

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    revalidated: paths,
  });
}
