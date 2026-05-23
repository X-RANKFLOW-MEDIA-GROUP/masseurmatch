import { createElement } from "react";
import { ImageResponse } from "next/og";

export const alt = "MasseurMatch – LGBTQ+-Inclusive Massage Therapist Directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          background: "#0B1F3A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px",
        },
      },
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            marginBottom: "28px",
          },
        },
        createElement(
          "span",
          {
            style: {
              fontSize: "54px",
              fontWeight: 700,
              color: "#FCFBF8",
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.01em",
            },
          },
          "Masseur",
        ),
        createElement(
          "span",
          {
            style: {
              fontSize: "54px",
              fontWeight: 700,
              color: "#FF8A1F",
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.01em",
            },
          },
          "Match",
        ),
      ),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        createElement(
          "span",
          {
            style: {
              fontSize: "22px",
              color: "rgba(252,251,248,0.6)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.04em",
            },
          },
          "LGBTQ+-Inclusive Massage Therapist Directory",
        ),
      ),
      createElement("div", {
        style: {
          display: "flex",
          width: "80px",
          height: "3px",
          background: "#FF8A1F",
          marginTop: "36px",
        },
      }),
    ),
    { ...size },
  );
}
