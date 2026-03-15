interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly [key: string]: string | undefined;
}

declare module "*.css" {}

// Merge env into the existing ImportMeta interface
declare namespace NodeJS {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
