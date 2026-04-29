const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export function envOptional(names: string[]): string | undefined {
  for (const name of names) {
    // Access process.env directly for Next.js server-side code
    const value = process.env[name] || viteEnv[name];
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function envAny(names: string[], fallback = ""): string {
  return envOptional(names) ?? fallback;
}
