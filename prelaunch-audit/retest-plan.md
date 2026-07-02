# MasseurMatch — Retest Plan

This plan defines how to re-verify each fix from `final-audit-report.md` before
launch. Re-run the full automated suite **3 consecutive times** and require a
clean pass on all three before flipping the verdict to GO.

## Tooling (reproducible)

All black-box tools run from `prelaunch-audit/tools` against production
(`https://www.masseurmatch.com`). The headless Chromium in this environment must
route through the egress proxy and disable Chrome's post-quantum TLS key share,
which the re-terminating proxy drops:

```
--proxy-server=$HTTPS_PROXY --disable-features=PostQuantumKyber --ssl-version-max=tls1.2
```

| Tool | Command | Output |
|---|---|---|
| HTTP sweep | `node http-sweep.mjs` | status, redirect chains, headers |
| SEO crawl | `node seo-crawl.mjs` | `seo-crawl.csv`, metadata/thin/broken CSVs |
| Exploratory browser sweep | `node explore.mjs` | console, network, HAR, screenshots |
| axe-core a11y | `node a11y.mjs` | `a11y-results.json` |
| Playwright QA | `npx playwright test` | `playwright-report/` |
| Lighthouse (mobile+desktop) | `node lh-run.mjs` | `lighthouse-reports/` |

## Per-fix retest matrix

| ID | Fix to verify | How to retest | Pass criteria |
|---|---|---|---|
| C-1 | Directory cards resolve to live profiles | Crawl `/therapists`, click every card | 0 cards redirect to `/therapists` or 404 |
| C-2 | Sitemap only lists live, indexable profiles | Fetch `/sitemap.xml`, HTTP-check every `/therapists/*` | 100% return 200 and are not `noindex` |
| C-3 | Homepage counts reflect real inventory | Fetch `/`, compare "N Verified" to live profile count | No count exceeds real published profiles |
| H-1 | Verification copy matches badge policy | Grep `/`, `/about` for "verified credentials", "Every … verified" | Wording aligns with `/badge-disclaimer` |
| H-2 | Sitemap/noindex conflict removed | Cross-check sitemap URLs vs `<meta robots>` | 0 sitemap URLs carry `noindex` |
| H-3 | Homepage hydration error gone | `explore.mjs`, read `console-errors.json` | 0 React #418 on `/` (all 4 viewports) |
| H-4 | Color-contrast AA | `a11y.mjs` on `/`, `/therapists`, `/dallas`, `/blog`, `/search` | 0 serious `color-contrast` violations |
| H-5 | Rate limiting on search/hotel-search | Burst 60 req/min to each endpoint | 429 after threshold |
| M-1 | CSP hardened | `curl -I /`, inspect `content-security-policy` | No `http://localhost:*`; scoped `script-src` |
| M-2 | Title/description lengths | `seo-crawl.mjs`, read `metadata-issues.csv` | Titles ≤ ~60 chars, descriptions ≤ ~160 |
| M-3 | Stripe missing price fails audit | Unset a `STRIPE_PRICE_*`, run `pnpm release:audit` | Audit fails with explicit error |
| M-4 | (withdrawn) login error feedback — verified working on re-test | Playwright negative-login test | Clear "Invalid email or password" toast + 401 (already passing) |
| M-5 | Bugsnag single init | `explore.mjs`, read `console-warnings.json` | 0 "Bugsnag.start() … more than once" |

## Regression gate (run 3×)

```
node http-sweep.mjs && node seo-crawl.mjs && node explore.mjs && \
node a11y.mjs && npx playwright test && node lh-run.mjs
```

Record the pass/fail of each run in `prelaunch-audit/retest-runs.log`. Only mark
launch-ready when all three consecutive runs are clean on the criteria above.
