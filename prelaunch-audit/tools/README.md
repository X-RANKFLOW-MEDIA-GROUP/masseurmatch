# Audit tooling (reproducible)

Black-box audit scripts used against https://www.masseurmatch.com. Node 22+.

```
npm i -D playwright @playwright/test lighthouse chrome-launcher cheerio axe-core
```

Headless Chromium in a proxied environment must disable Chrome's post-quantum
TLS key share (the re-terminating egress proxy drops it):
`--disable-features=PostQuantumKyber --ssl-version-max=tls1.2`, and route via
`$HTTPS_PROXY`. All scripts already apply this.

| Script | Purpose |
|---|---|
| `http-sweep.mjs` | status, redirect chains, security headers |
| `seo-crawl.mjs` | metadata / canonical / schema / thin / broken-link crawl |
| `explore.mjs` | console + network + HAR + screenshots, 4 viewports |
| `a11y.mjs` | axe-core WCAG 2 A/AA + keyboard focus trail |
| `lh-run.mjs` | Lighthouse mobile + desktop |
| `tests/audit.spec.mjs` | Playwright interactive QA (`npx playwright test --config=playwright.config.mjs`) |
