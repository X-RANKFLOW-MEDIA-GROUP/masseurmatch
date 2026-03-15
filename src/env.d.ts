// Ambient type shim so the auto-generated Supabase client (which uses
// import.meta.env) compiles under Next.js / TypeScript without Vite types.
declare interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly [key: string]: string | undefined;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
