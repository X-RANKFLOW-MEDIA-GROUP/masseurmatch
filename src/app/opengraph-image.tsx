import { ImageResponse } from "next/og";

export const alt = "MasseurMatch – LGBTQ+-Inclusive Massage Therapist Directory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B1F3A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px",
          color: "#FCFBF8",
          fontFamily: "Georgia, serif",
        }}
      >
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "flex",
              fontSize: "54px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              marginBottom: "28px",
            }}
          >
            MasseurMatch
          </span>
          <span
            style={{
              display: "flex",
              fontSize: "22px",
              color: "rgba(252,251,248,0.6)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.04em",
            }}
          >
            LGBTQ+-Inclusive Massage Therapist Directory
          </span>
        </span>
      </div>
    ),
    { ...size },
  );
}
