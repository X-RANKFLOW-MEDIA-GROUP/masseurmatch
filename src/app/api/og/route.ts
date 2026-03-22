import { createElement } from "react";
import { ImageResponse } from "next/og";

import { titleizeSlug } from "@/app/api/_lib/text";

export const runtime = "nodejs";

function buildCardCopy(input: {
  title?: string;
  slug?: string;
  city?: string;
  label?: string;
}) {
  const title = input.title?.trim() || (input.slug ? titleizeSlug(input.slug) : "MasseurMatch");
  const eyebrow = input.label?.trim() || (input.city ? `Explore ${input.city}` : "Directory");
  const subtitle = input.city
    ? `Browse massage therapists in ${input.city} and compare specialties, rates, and profile details.`
    : "Browse therapists, compare specialties, and contact providers directly.";

  return {
    eyebrow,
    title,
    subtitle,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const copy = buildCardCopy({
    title: searchParams.get("title") || undefined,
    slug: searchParams.get("slug") || undefined,
    city: searchParams.get("city") || undefined,
    label: searchParams.get("label") || undefined,
  });

  const card = createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px",
        background: "linear-gradient(135deg, #0f172a 0%, #172554 45%, #0f766e 100%)",
        color: "#f8fafc",
        fontFamily: "Georgia, serif",
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        },
      },
      createElement(
        "div",
        {
          style: {
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#a5f3fc",
          },
        },
        copy.eyebrow,
      ),
      createElement(
        "div",
        {
          style: {
            fontSize: 76,
            lineHeight: 1.05,
            maxWidth: "900px",
            fontWeight: 700,
          },
        },
        copy.title,
      ),
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        },
      },
      createElement(
        "div",
        {
          style: {
            fontSize: 30,
            maxWidth: "820px",
            lineHeight: 1.35,
            color: "#dbeafe",
          },
        },
        copy.subtitle,
      ),
      createElement(
        "div",
        {
          style: {
            fontSize: 28,
            color: "#fcd34d",
          },
        },
        "masseurmatch.com",
      ),
    ),
  );

  return new ImageResponse(
    card,
    {
      width: 1200,
      height: 630,
    },
  );
}
