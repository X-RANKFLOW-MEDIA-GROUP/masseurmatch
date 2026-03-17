import { envAny as baseEnvAny, envOptional as baseEnvOptional } from "@/app/api/_lib/env";

export const envAny = baseEnvAny;
export const envOptional = baseEnvOptional;

export function envRequired(names: string[], label?: string) {
  const value = baseEnvOptional(names);

  if (!value) {
    throw new Error(`${label || names[0] || "Environment variable"} is not configured.`);
  }

  return value;
}

export const isProduction = envAny(["NODE_ENV"], "development") === "production";
