import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next/dist/index.js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".next", "next-env.d.ts", "src/legacy-pages/**/*", "_old_app/**/*", "test-results", "playwright-report", ".claude/**/*", "prelaunch-audit/**/*"] },
  // Next.js flat config (recommended + core-web-vitals)
  nextPlugin.flatConfig.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Auto-fixable guard against dead imports; unused locals stay allowed
      // (@typescript-eslint/no-unused-vars remains off).
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    files: ["src/app/explore/page.tsx"],
    rules: {
      "unused-imports/no-unused-imports": "off",
    },
  },
);
