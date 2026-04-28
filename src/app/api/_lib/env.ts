export function envOptional(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function envAny(names: string[], fallback = ""): string {
  return envOptional(names) ?? fallback;
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
