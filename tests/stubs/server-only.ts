// Vitest stand-in for the `server-only` marker package. The real module
// throws unless the bundler runs with the `react-server` resolve condition,
// which vitest's node environment does not set. The marker carries no
// runtime behavior, so tests substitute this empty module.
export {};
