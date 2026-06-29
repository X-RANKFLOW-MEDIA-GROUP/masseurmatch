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
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            fontSize: 52,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            marginBottom: 24,
          }}
        >
          <span style={{ color: "#FFFFFF" }}>Masseur</span>
          <span style={{ color: "#8B1E2D" }}>Match</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 300,
            letterSpacing: "0.04em",
          }}
        >
          <span>LGBTQ+-Inclusive Massage Therapist Directory</span>
        </div>

        <div
          style={{
            display: "flex",
            width: 80,
            height: 3,
            background: "#8B1E2D",
            marginTop: 36,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
