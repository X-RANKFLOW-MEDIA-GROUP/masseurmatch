declare module "@vercel/analytics/react" {
  import type { ComponentType } from "react";

  export const Analytics: ComponentType<Record<string, never>>;
}

declare module "@vercel/speed-insights/next" {
  import type { ComponentType } from "react";

  export const SpeedInsights: ComponentType<Record<string, never>>;
}
