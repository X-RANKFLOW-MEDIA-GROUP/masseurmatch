import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws on import unless the bundler applies the
      // `react-server` condition; vitest doesn't, so stub it to a no-op for
      // unit tests that transitively import server modules.
      "server-only": path.resolve(__dirname, "tests/stubs/empty.ts"),
    },
  },
});
