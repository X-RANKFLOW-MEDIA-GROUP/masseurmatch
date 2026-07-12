// No-op stub for `server-only` (and similar guard modules) under vitest.
// The real `server-only` package throws unless the bundler applies the
// `react-server` export condition; the unit-test runtime doesn't, so importing
// server modules that guard with `import "server-only"` would crash on load.
export {};
