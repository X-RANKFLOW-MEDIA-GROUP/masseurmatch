import type { Metadata } from "next";

import { PrototypePageClient } from "../PrototypePageClient";

export const metadata: Metadata = {
  title: "Wireframe prototype",
  description:
    "Clickable prototype for the MasseurMatch wireframe flow from homepage through dashboard.",
};

export default function WireframePrototypePage() {
  return <PrototypePageClient />;
}
