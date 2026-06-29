import { notFound } from "next/navigation";

import BugsnagTestClient from "./BugsnagTestClient";

export default function BugsnagDebugPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <BugsnagTestClient />;
}
