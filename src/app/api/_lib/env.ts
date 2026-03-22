const runtimeProcess = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const processEnv = runtimeProcess.process?.env ?? {};

export function envOptional(names: string[]): string | undefined {
  for (const name of names) {
    const value = processEnv[name] || viteEnv[name];
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function envAny(names: string[], fallback = ""): string {
  return envOptional(names) ?? fallback;
}
