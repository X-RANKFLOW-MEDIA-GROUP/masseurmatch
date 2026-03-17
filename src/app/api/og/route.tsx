import { ImageResponse } from "next/og";
import { getCityBySlug, getTherapistBySlug } from "@/mm/lib/directory";
import { appName } from "@/mm/lib/env";

export const runtime = "nodejs";

async function buildCardCopy({
  city,
  label,
  slug,
  title,
}: {
  city: string | null;
  label: string | null;
  slug: string | null;
  title: string | null;
}): Promise<{
  eyebrow: string;
  heading: string;
  subheading: string;
}> {
  if (slug) {
    const therapist = await getTherapistBySlug(slug);

    if (therapist) {
      return {
        eyebrow: `${appName} therapist profile`,
        heading: therapist.displayName,
        subheading: `${therapist.citySlug.toUpperCase()} | ${therapist.modalities.slice(0, 3).join(" | ")}`,
      };
    }
  }

  if (city) {
    const cityRecord = await getCityBySlug(city);

    if (cityRecord) {
      return {
        eyebrow: `${appName} city directory`,
        heading: `${cityRecord.name} therapist directory`,
        subheading: label || cityRecord.hero,
      };
    }
  }

  return {
    eyebrow: appName,
    heading: title || "Direct therapist discovery",
    subheading: label || "City-first profiles, direct contact, and cleaner therapist discovery.",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const slug = searchParams.get("slug");
  const city = searchParams.get("city");
  const label = searchParams.get("label");
  const copy = await buildCardCopy({ city, label, slug, title });

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "linear-gradient(135deg, #f3ede2 0%, #f7f4ef 55%, #ead8be 100%)",
          color: "#1f1a16",
          display: "flex",
          fontFamily: "Georgia, serif",
          height: "100%",
          padding: "54px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(95, 71, 47, 0.15)",
            borderRadius: "32px",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            padding: "44px",
            position: "relative",
          }}
        >
          <div
            style={{
              background: "radial-gradient(circle, rgba(195, 161, 113, 0.24) 0%, rgba(195, 161, 113, 0) 70%)",
              height: "360px",
              position: "absolute",
              right: "-60px",
              top: "-90px",
              width: "360px",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "72%" }}>
            <div
              style={{
                color: "#6b5949",
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {copy.eyebrow}
            </div>
            <div style={{ display: "flex", fontSize: "72px", fontWeight: 700, lineHeight: 1.05 }}>
              {copy.heading}
            </div>
            <div
              style={{
                color: "#5c4f44",
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: "28px",
                lineHeight: 1.45,
              }}
            >
              {copy.subheading}
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                border: "1px solid rgba(95, 71, 47, 0.18)",
                borderRadius: "999px",
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                padding: "14px 22px",
              }}
            >
              Contact providers directly
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              {appName}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
