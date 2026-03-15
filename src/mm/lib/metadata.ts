import type { Metadata } from "next";
import { appName, appUrl } from "@/mm/lib/env";

export function buildMetadata({
  title,
  description,
  path = "/",
  imagePath,
}: {
  title: string;
  description: string;
  path?: string;
  imagePath?: string;
}): Metadata {
  const fullTitle = `${title} | ${appName}`;
  const imageUrl = imagePath ? `${appUrl}${imagePath}` : `${appUrl}/api/og?title=${encodeURIComponent(title)}`;

  return {
    metadataBase: new URL(appUrl),
    title: fullTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: appName,
      type: "website",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
