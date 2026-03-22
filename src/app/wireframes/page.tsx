import type { Metadata } from "next";

import { WireframesPageClient } from "./WireframesPageClient";

export const metadata: Metadata = {
  title: "Wireframes and prototype",
  description:
    "Responsive wireframes, prototype flow, component inventory, and accessibility handoff for MasseurMatch.",
};

export default function WireframesPage() {
  return <WireframesPageClient />;
}
