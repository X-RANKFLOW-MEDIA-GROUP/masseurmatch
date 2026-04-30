# Deploy Lockfile Checklist

To avoid Vercel deployment failures caused by dependency drift:

1. Always run `pnpm install` after any `package.json` change.
2. Commit `package.json` and `pnpm-lock.yaml` together.
3. Never manually edit `pnpm-lock.yaml`.
4. Before merging, verify with:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```
